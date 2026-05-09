'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import DOMPurify from 'isomorphic-dompurify'
import { createClient } from '@/lib/supabase/server'

function sanitize(html: string) {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target', 'rel', 'colspan', 'rowspan', 'colwidth', 'style'],
  })
}

function parseTags(formData: FormData): string[] {
  return formData
    .getAll('tags')
    .map((v) => String(v).trim())
    .filter(Boolean)
}

export async function createQna(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/qna/new')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') redirect('/qna')

  const question = String(formData.get('question') ?? '').trim()
  const rawAnswer = String(formData.get('answer') ?? '').trim()
  const answer = sanitize(rawAnswer)

  if (!question || !answer || answer === '<p></p>') {
    redirect('/qna/new?error=' + encodeURIComponent('질문과 답변을 입력해주세요'))
  }

  const tags = parseTags(formData)

  // 새 글은 가장 위에 오도록 sort_order = (현재 최소값 - 1)
  const { data: minRow } = await supabase
    .from('qna')
    .select('sort_order')
    .order('sort_order', { ascending: true })
    .limit(1)
    .maybeSingle()
  const minSort = (minRow as { sort_order: number } | null)?.sort_order ?? 0
  const sortOrder = minSort - 1

  const { error } = await supabase
    .from('qna')
    .insert({ question, answer, tags, sort_order: sortOrder, author_id: user.id })

  if (error) {
    redirect('/qna/new?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/qna')
  redirect('/qna')
}

export async function updateQna(id: number, formData: FormData) {
  const supabase = await createClient()
  const question = String(formData.get('question') ?? '').trim()
  const rawAnswer = String(formData.get('answer') ?? '').trim()
  const answer = sanitize(rawAnswer)
  const tags = parseTags(formData)

  if (!question || !answer || answer === '<p></p>') {
    redirect(`/qna/${id}/edit?error=` + encodeURIComponent('질문과 답변을 입력해주세요'))
  }

  const { error } = await supabase
    .from('qna')
    .update({ question, answer, tags })
    .eq('id', id)

  if (error) {
    redirect(`/qna/${id}/edit?error=` + encodeURIComponent(error.message))
  }

  revalidatePath('/qna')
  redirect('/qna')
}

export async function deleteQna(id: number) {
  const supabase = await createClient()
  const { error } = await supabase.from('qna').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/qna')
  redirect('/qna')
}

/**
 * 드래그 reorder — orderedIds 순서대로 sort_order = 0,1,2,... 갱신
 * (관리자 권한은 RLS 가 보장)
 */
export async function reorderQna(orderedIds: number[]) {
  if (orderedIds.length === 0) return
  const supabase = await createClient()
  await Promise.all(
    orderedIds.map((id, idx) =>
      supabase.from('qna').update({ sort_order: idx }).eq('id', id)
    )
  )
  revalidatePath('/qna')
}
