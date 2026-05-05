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

  const { error } = await supabase
    .from('qna')
    .insert({ question, answer, author_id: user.id })

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

  if (!question || !answer || answer === '<p></p>') {
    redirect(`/qna/${id}/edit?error=` + encodeURIComponent('질문과 답변을 입력해주세요'))
  }

  const { error } = await supabase.from('qna').update({ question, answer }).eq('id', id)

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
