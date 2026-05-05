'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function ensureAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')
  return { supabase, user }
}

// ---------- gallery ----------

export async function createGalleryItem(formData: FormData) {
  const { supabase } = await ensureAdmin()

  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const file = formData.get('image') as File | null

  if (!title || !file || file.size === 0) {
    redirect('/admin/gallery/new?error=' + encodeURIComponent('제목과 이미지를 입력해주세요'))
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('gallery')
    .upload(path, file, { contentType: file.type, upsert: false })

  if (uploadError) {
    redirect('/admin/gallery/new?error=' + encodeURIComponent(uploadError.message))
  }

  const { error } = await supabase.from('gallery_items').insert({
    title,
    description: description || null,
    image_path: path,
  })

  if (error) {
    await supabase.storage.from('gallery').remove([path])
    redirect('/admin/gallery/new?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/admin/gallery')
  revalidatePath('/gallery')
  revalidatePath('/')
  redirect('/admin/gallery')
}

export async function updateGalleryItem(id: number, formData: FormData) {
  const { supabase } = await ensureAdmin()

  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const file = formData.get('image') as File | null

  if (!title) {
    redirect(`/admin/gallery/${id}/edit?error=` + encodeURIComponent('제목을 입력해주세요'))
  }

  const update: { title: string; description: string | null; image_path?: string } = {
    title,
    description: description || null,
  }

  let oldPath: string | null = null
  if (file && file.size > 0) {
    const { data: existing } = await supabase
      .from('gallery_items')
      .select('image_path')
      .eq('id', id)
      .single()
    oldPath = existing?.image_path ?? null

    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(path, file, { contentType: file.type })
    if (uploadError) {
      redirect(`/admin/gallery/${id}/edit?error=` + encodeURIComponent(uploadError.message))
    }
    update.image_path = path
  }

  const { error } = await supabase.from('gallery_items').update(update).eq('id', id)
  if (error) {
    redirect(`/admin/gallery/${id}/edit?error=` + encodeURIComponent(error.message))
  }

  if (oldPath && update.image_path) {
    await supabase.storage.from('gallery').remove([oldPath])
  }

  revalidatePath('/admin/gallery')
  revalidatePath('/gallery')
  revalidatePath('/')
  redirect('/admin/gallery')
}

export async function deleteGalleryItem(id: number) {
  const { supabase } = await ensureAdmin()

  const { data: existing } = await supabase
    .from('gallery_items')
    .select('image_path')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('gallery_items').delete().eq('id', id)
  if (error) throw new Error(error.message)

  if (existing?.image_path) {
    await supabase.storage.from('gallery').remove([existing.image_path])
  }

  revalidatePath('/admin/gallery')
  revalidatePath('/gallery')
  revalidatePath('/')
}

// ---------- board (admin) ----------

export async function adminDeletePost(id: number) {
  const { supabase } = await ensureAdmin()
  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/board')
  revalidatePath('/board')
  revalidatePath('/')
}

// ---------- categories ----------

function parseCategoryForm(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  const slugRaw = String(formData.get('slug') ?? '').trim()
  const hrefRaw = String(formData.get('href') ?? '').trim()
  const parentRaw = String(formData.get('parent_id') ?? '').trim()
  const display_type = (String(formData.get('display_type') ?? 'tile') === 'link'
    ? 'link'
    : 'tile') as 'tile' | 'link'
  const sort_order = Number(formData.get('sort_order') ?? 0) || 0
  const is_active = formData.get('is_active') === 'on'

  return {
    name,
    slug: slugRaw || null,
    href: hrefRaw || null,
    parent_id: parentRaw ? Number(parentRaw) : null,
    display_type,
    sort_order,
    is_active,
  }
}

export async function createCategory(formData: FormData) {
  const { supabase } = await ensureAdmin()
  const fields = parseCategoryForm(formData)
  const file = formData.get('image') as File | null

  if (!fields.name) {
    redirect('/admin/categories/new?error=' + encodeURIComponent('이름을 입력해주세요'))
  }

  let image_path: string | null = null
  if (file && file.size > 0) {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('categories')
      .upload(path, file, { contentType: file.type })
    if (uploadError) {
      redirect('/admin/categories/new?error=' + encodeURIComponent(uploadError.message))
    }
    image_path = path
  }

  const { error } = await supabase.from('categories').insert({ ...fields, image_path })
  if (error) {
    if (image_path) await supabase.storage.from('categories').remove([image_path])
    redirect('/admin/categories/new?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/admin/categories')
  revalidatePath('/', 'layout')
  redirect('/admin/categories')
}

export async function updateCategory(id: number, formData: FormData) {
  const { supabase } = await ensureAdmin()
  const fields = parseCategoryForm(formData)
  const file = formData.get('image') as File | null
  const removeImage = formData.get('remove_image') === 'on'

  if (!fields.name) {
    redirect(`/admin/categories/${id}/edit?error=` + encodeURIComponent('이름을 입력해주세요'))
  }

  // prevent self-parent
  if (fields.parent_id === id) {
    redirect(
      `/admin/categories/${id}/edit?error=` +
        encodeURIComponent('자기 자신을 부모로 지정할 수 없습니다')
    )
  }

  const update: Record<string, unknown> = { ...fields }
  let oldPath: string | null = null

  if (file && file.size > 0) {
    const { data: existing } = await supabase
      .from('categories')
      .select('image_path')
      .eq('id', id)
      .single()
    oldPath = existing?.image_path ?? null

    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('categories')
      .upload(path, file, { contentType: file.type })
    if (uploadError) {
      redirect(`/admin/categories/${id}/edit?error=` + encodeURIComponent(uploadError.message))
    }
    update.image_path = path
  } else if (removeImage) {
    const { data: existing } = await supabase
      .from('categories')
      .select('image_path')
      .eq('id', id)
      .single()
    oldPath = existing?.image_path ?? null
    update.image_path = null
  }

  const { error } = await supabase.from('categories').update(update).eq('id', id)
  if (error) {
    redirect(`/admin/categories/${id}/edit?error=` + encodeURIComponent(error.message))
  }

  if (oldPath) {
    await supabase.storage.from('categories').remove([oldPath])
  }

  revalidatePath('/admin/categories')
  revalidatePath('/', 'layout')
  redirect('/admin/categories')
}

export async function deleteCategory(id: number) {
  const { supabase } = await ensureAdmin()

  const { data: existing } = await supabase
    .from('categories')
    .select('image_path')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw new Error(error.message)

  if (existing?.image_path) {
    await supabase.storage.from('categories').remove([existing.image_path])
  }

  revalidatePath('/admin/categories')
  revalidatePath('/', 'layout')
}

export async function toggleCategoryActive(id: number, currentValue: boolean) {
  const { supabase } = await ensureAdmin()
  const { error } = await supabase
    .from('categories')
    .update({ is_active: !currentValue })
    .eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/categories')
  revalidatePath('/', 'layout')
}
