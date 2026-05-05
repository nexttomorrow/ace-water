'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createPost(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/board/new')

  const title = String(formData.get('title') ?? '').trim()
  const content = String(formData.get('content') ?? '').trim()

  if (!title || !content) {
    redirect('/board/new?error=' + encodeURIComponent('제목과 내용을 입력해주세요'))
  }

  const { data, error } = await supabase
    .from('posts')
    .insert({ title, content, author_id: user.id })
    .select('id')
    .single()

  if (error) {
    redirect('/board/new?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/board')
  revalidatePath('/')
  redirect(`/board/${data!.id}`)
}

export async function updatePost(id: number, formData: FormData) {
  const supabase = await createClient()
  const title = String(formData.get('title') ?? '').trim()
  const content = String(formData.get('content') ?? '').trim()

  if (!title || !content) {
    redirect(`/board/${id}/edit?error=` + encodeURIComponent('제목과 내용을 입력해주세요'))
  }

  // RLS will reject if not author or admin
  const { error } = await supabase.from('posts').update({ title, content }).eq('id', id)

  if (error) {
    redirect(`/board/${id}/edit?error=` + encodeURIComponent(error.message))
  }

  revalidatePath('/board')
  revalidatePath(`/board/${id}`)
  redirect(`/board/${id}`)
}

export async function deletePost(id: number) {
  const supabase = await createClient()
  const { error } = await supabase.from('posts').delete().eq('id', id)

  if (error) {
    // can't easily redirect with query for arbitrary path; throw
    throw new Error(error.message)
  }

  revalidatePath('/board')
  revalidatePath('/')
  redirect('/board')
}
