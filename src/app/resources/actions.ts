'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const RESOURCES_BUCKET = 'resources'

async function ensureAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, isAdmin: false }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  return { supabase, user, isAdmin: profile?.role === 'admin' }
}

function uniquePath(originalName: string) {
  const ext = originalName.includes('.') ? originalName.split('.').pop() : 'bin'
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
}

type ResourceUpdates = {
  title: string
  content: string
  file_path?: string
  file_name?: string
  file_size?: number
  file_type?: string
}

export async function createResource(formData: FormData) {
  const { supabase, user, isAdmin } = await ensureAdmin()
  if (!user) redirect('/login?redirect=/resources/new')
  if (!isAdmin) redirect('/resources')

  const title = String(formData.get('title') ?? '').trim()
  const content = String(formData.get('content') ?? '').trim()
  const file = formData.get('file') as File | null

  if (!title) {
    redirect('/resources/new?error=' + encodeURIComponent('제목을 입력해주세요'))
  }
  if (!file || file.size === 0) {
    redirect('/resources/new?error=' + encodeURIComponent('파일을 첨부해주세요'))
  }

  const path = uniquePath(file.name)
  const { error: uploadError } = await supabase.storage
    .from(RESOURCES_BUCKET)
    .upload(path, file, { contentType: file.type || 'application/octet-stream', upsert: false })
  if (uploadError) {
    redirect('/resources/new?error=' + encodeURIComponent(uploadError.message))
  }

  const { data, error } = await supabase
    .from('resources')
    .insert({
      title,
      content,
      author_id: user.id,
      file_path: path,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type || '',
    })
    .select('id')
    .single()

  if (error) {
    await supabase.storage.from(RESOURCES_BUCKET).remove([path])
    redirect('/resources/new?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/resources')
  redirect(`/resources/${data!.id}`)
}

export async function updateResource(id: number, formData: FormData) {
  const { supabase, isAdmin } = await ensureAdmin()
  if (!isAdmin) redirect('/resources')

  const title = String(formData.get('title') ?? '').trim()
  const content = String(formData.get('content') ?? '').trim()
  const file = formData.get('file') as File | null

  if (!title) {
    redirect(`/resources/${id}/edit?error=` + encodeURIComponent('제목을 입력해주세요'))
  }

  const updates: ResourceUpdates = { title, content }
  let oldPathToDelete: string | null = null

  if (file && file.size > 0) {
    const { data: existing } = await supabase
      .from('resources')
      .select('file_path')
      .eq('id', id)
      .single()

    const path = uniquePath(file.name)
    const { error: uploadError } = await supabase.storage
      .from(RESOURCES_BUCKET)
      .upload(path, file, { contentType: file.type || 'application/octet-stream', upsert: false })
    if (uploadError) {
      redirect(`/resources/${id}/edit?error=` + encodeURIComponent(uploadError.message))
    }

    updates.file_path = path
    updates.file_name = file.name
    updates.file_size = file.size
    updates.file_type = file.type || ''
    oldPathToDelete = existing?.file_path ?? null
  }

  const { error } = await supabase.from('resources').update(updates).eq('id', id)
  if (error) {
    if (updates.file_path) {
      await supabase.storage.from(RESOURCES_BUCKET).remove([updates.file_path])
    }
    redirect(`/resources/${id}/edit?error=` + encodeURIComponent(error.message))
  }

  if (oldPathToDelete) {
    await supabase.storage.from(RESOURCES_BUCKET).remove([oldPathToDelete])
  }

  revalidatePath('/resources')
  revalidatePath(`/resources/${id}`)
  redirect(`/resources/${id}`)
}

export async function deleteResource(id: number) {
  const supabase = await createClient()
  const { data: existing } = await supabase
    .from('resources')
    .select('file_path')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('resources').delete().eq('id', id)
  if (error) throw new Error(error.message)

  if (existing?.file_path) {
    await supabase.storage.from(RESOURCES_BUCKET).remove([existing.file_path])
  }

  revalidatePath('/resources')
  redirect('/resources')
}
