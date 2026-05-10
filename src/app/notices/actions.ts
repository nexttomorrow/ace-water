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

export async function createNotice(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/notices/new')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') redirect('/notices')

  const title = String(formData.get('title') ?? '').trim()
  const rawContent = String(formData.get('content') ?? '').trim()
  const content = sanitize(rawContent)

  if (!title || !content || content === '<p></p>') {
    redirect('/notices/new?error=' + encodeURIComponent('제목과 내용을 입력해주세요'))
  }

  const { data, error } = await supabase
    .from('notices')
    .insert({ title, content, author_id: user.id })
    .select('id')
    .single()

  if (error) {
    redirect('/notices/new?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/notices')
  redirect(`/notices/${data!.id}`)
}

export async function updateNotice(id: number, formData: FormData) {
  const supabase = await createClient()
  const title = String(formData.get('title') ?? '').trim()
  const rawContent = String(formData.get('content') ?? '').trim()
  const content = sanitize(rawContent)

  if (!title || !content || content === '<p></p>') {
    redirect(`/notices/${id}/edit?error=` + encodeURIComponent('제목과 내용을 입력해주세요'))
  }

  const { error } = await supabase.from('notices').update({ title, content }).eq('id', id)

  if (error) {
    redirect(`/notices/${id}/edit?error=` + encodeURIComponent(error.message))
  }

  revalidatePath('/notices')
  revalidatePath(`/notices/${id}`)
  redirect(`/notices/${id}`)
}

export async function deleteNotice(id: number) {
  const supabase = await createClient()
  const { error } = await supabase.from('notices').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/notices')
  redirect('/notices')
}
