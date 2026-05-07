'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { HERO_SLIDES_MAX } from '@/lib/types'

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
  revalidatePath('/construction-cases')
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
  revalidatePath('/construction-cases')
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
  revalidatePath('/construction-cases')
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
  const descriptionRaw = String(formData.get('description') ?? '').trim()
  const parentRaw = String(formData.get('parent_id') ?? '').trim()
  const rawDisplayType = String(formData.get('display_type') ?? 'tile')
  const display_type = (
    rawDisplayType === 'link' || rawDisplayType === 'text' ? rawDisplayType : 'tile'
  ) as 'tile' | 'link' | 'text'
  const sort_order = Number(formData.get('sort_order') ?? 0) || 0
  const is_active = formData.get('is_active') === 'on'
  const bannerTitleRaw = String(formData.get('banner_title') ?? '').trim()
  const bannerSubtitleRaw = String(formData.get('banner_subtitle') ?? '').trim()

  return {
    name,
    slug: slugRaw || null,
    href: hrefRaw || null,
    description: descriptionRaw || null,
    parent_id: parentRaw ? Number(parentRaw) : null,
    display_type,
    sort_order,
    is_active,
    banner_title: bannerTitleRaw || null,
    banner_subtitle: bannerSubtitleRaw || null,
  }
}

export async function createCategory(formData: FormData) {
  const { supabase } = await ensureAdmin()
  const fields = parseCategoryForm(formData)
  const file = formData.get('image') as File | null
  const bannerFile = formData.get('banner_image') as File | null

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

  let banner_image_path: string | null = null
  if (bannerFile && bannerFile.size > 0) {
    const ext = bannerFile.name.split('.').pop() ?? 'jpg'
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('category-banners')
      .upload(path, bannerFile, { contentType: bannerFile.type })
    if (uploadError) {
      if (image_path) await supabase.storage.from('categories').remove([image_path])
      redirect('/admin/categories/new?error=' + encodeURIComponent(uploadError.message))
    }
    banner_image_path = path
  }

  const { error } = await supabase
    .from('categories')
    .insert({ ...fields, image_path, banner_image_path })
  if (error) {
    if (image_path) await supabase.storage.from('categories').remove([image_path])
    if (banner_image_path)
      await supabase.storage.from('category-banners').remove([banner_image_path])
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
  const bannerFile = formData.get('banner_image') as File | null
  const removeBannerImage = formData.get('remove_banner_image') === 'on'

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
  let oldImagePath: string | null = null
  let oldBannerPath: string | null = null

  // need a single fetch if either image is being changed/removed
  const needFetchExisting =
    (file && file.size > 0) || removeImage || (bannerFile && bannerFile.size > 0) || removeBannerImage

  let existing: { image_path: string | null; banner_image_path: string | null } | null = null
  if (needFetchExisting) {
    const { data } = await supabase
      .from('categories')
      .select('image_path, banner_image_path')
      .eq('id', id)
      .single()
    existing = data ?? null
  }

  if (file && file.size > 0) {
    oldImagePath = existing?.image_path ?? null
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
    oldImagePath = existing?.image_path ?? null
    update.image_path = null
  }

  if (bannerFile && bannerFile.size > 0) {
    oldBannerPath = existing?.banner_image_path ?? null
    const ext = bannerFile.name.split('.').pop() ?? 'jpg'
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('category-banners')
      .upload(path, bannerFile, { contentType: bannerFile.type })
    if (uploadError) {
      redirect(`/admin/categories/${id}/edit?error=` + encodeURIComponent(uploadError.message))
    }
    update.banner_image_path = path
  } else if (removeBannerImage) {
    oldBannerPath = existing?.banner_image_path ?? null
    update.banner_image_path = null
  }

  const { error } = await supabase.from('categories').update(update).eq('id', id)
  if (error) {
    redirect(`/admin/categories/${id}/edit?error=` + encodeURIComponent(error.message))
  }

  if (oldImagePath) {
    await supabase.storage.from('categories').remove([oldImagePath])
  }
  if (oldBannerPath) {
    await supabase.storage.from('category-banners').remove([oldBannerPath])
  }

  revalidatePath('/admin/categories')
  revalidatePath('/', 'layout')
  redirect('/admin/categories')
}

export async function deleteCategory(id: number) {
  const { supabase } = await ensureAdmin()

  const { data: existing } = await supabase
    .from('categories')
    .select('image_path, banner_image_path')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw new Error(error.message)

  if (existing?.image_path) {
    await supabase.storage.from('categories').remove([existing.image_path])
  }
  if (existing?.banner_image_path) {
    await supabase.storage.from('category-banners').remove([existing.banner_image_path])
  }

  revalidatePath('/admin/categories')
  revalidatePath('/', 'layout')
}

// ---------- hero slides ----------

export async function createHeroSlide(formData: FormData) {
  const { supabase } = await ensureAdmin()

  const eyebrow = String(formData.get('eyebrow') ?? '').trim()
  const title = String(formData.get('title') ?? '').trim()
  const sortOrder = Number(formData.get('sort_order') ?? 0) || 0
  const file = formData.get('image') as File | null

  if (!title || !file || file.size === 0) {
    redirect('/admin/hero/new?error=' + encodeURIComponent('타이틀과 이미지를 입력해주세요'))
  }

  const { count } = await supabase
    .from('hero_slides')
    .select('*', { count: 'exact', head: true })
  if ((count ?? 0) >= HERO_SLIDES_MAX) {
    redirect(
      '/admin/hero/new?error=' +
        encodeURIComponent(`슬라이드는 최대 ${HERO_SLIDES_MAX}개까지 등록할 수 있어요`)
    )
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('hero')
    .upload(path, file, { contentType: file.type, upsert: false })
  if (uploadError) {
    redirect('/admin/hero/new?error=' + encodeURIComponent(uploadError.message))
  }

  const { error } = await supabase.from('hero_slides').insert({
    eyebrow,
    title,
    image_path: path,
    sort_order: sortOrder,
  })
  if (error) {
    await supabase.storage.from('hero').remove([path])
    redirect('/admin/hero/new?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/admin/hero')
  revalidatePath('/')
  redirect('/admin/hero')
}

export async function updateHeroSlide(id: number, formData: FormData) {
  const { supabase } = await ensureAdmin()

  const eyebrow = String(formData.get('eyebrow') ?? '').trim()
  const title = String(formData.get('title') ?? '').trim()
  const sortOrder = Number(formData.get('sort_order') ?? 0) || 0
  const file = formData.get('image') as File | null

  if (!title) {
    redirect(`/admin/hero/${id}/edit?error=` + encodeURIComponent('타이틀을 입력해주세요'))
  }

  const update: {
    eyebrow: string
    title: string
    sort_order: number
    image_path?: string
  } = {
    eyebrow,
    title,
    sort_order: sortOrder,
  }

  let oldPath: string | null = null
  if (file && file.size > 0) {
    const { data: existing } = await supabase
      .from('hero_slides')
      .select('image_path')
      .eq('id', id)
      .single()
    oldPath = existing?.image_path ?? null

    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('hero')
      .upload(path, file, { contentType: file.type })
    if (uploadError) {
      redirect(`/admin/hero/${id}/edit?error=` + encodeURIComponent(uploadError.message))
    }
    update.image_path = path
  }

  const { error } = await supabase.from('hero_slides').update(update).eq('id', id)
  if (error) {
    redirect(`/admin/hero/${id}/edit?error=` + encodeURIComponent(error.message))
  }

  if (oldPath && update.image_path) {
    await supabase.storage.from('hero').remove([oldPath])
  }

  revalidatePath('/admin/hero')
  revalidatePath('/')
  redirect('/admin/hero')
}

export async function deleteHeroSlide(id: number) {
  const { supabase } = await ensureAdmin()

  const { data: existing } = await supabase
    .from('hero_slides')
    .select('image_path')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('hero_slides').delete().eq('id', id)
  if (error) throw new Error(error.message)

  if (existing?.image_path) {
    await supabase.storage.from('hero').remove([existing.image_path])
  }

  revalidatePath('/admin/hero')
  revalidatePath('/')
}

// ---------- subpage banner (banner fields only) ----------

export async function updateCategoryBanner(id: number, formData: FormData) {
  const { supabase } = await ensureAdmin()

  const bannerTitle = String(formData.get('banner_title') ?? '').trim()
  const bannerSubtitle = String(formData.get('banner_subtitle') ?? '').trim()
  const bannerFile = formData.get('banner_image') as File | null
  const removeBannerImage = formData.get('remove_banner_image') === 'on'

  const update: Record<string, unknown> = {
    banner_title: bannerTitle || null,
    banner_subtitle: bannerSubtitle || null,
  }

  let oldBannerPath: string | null = null

  if ((bannerFile && bannerFile.size > 0) || removeBannerImage) {
    const { data: existing } = await supabase
      .from('categories')
      .select('banner_image_path')
      .eq('id', id)
      .single()
    oldBannerPath = existing?.banner_image_path ?? null
  }

  if (bannerFile && bannerFile.size > 0) {
    const ext = bannerFile.name.split('.').pop() ?? 'jpg'
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('category-banners')
      .upload(path, bannerFile, { contentType: bannerFile.type })
    if (uploadError) {
      redirect(`/admin/subpages/${id}/edit?error=` + encodeURIComponent(uploadError.message))
    }
    update.banner_image_path = path
  } else if (removeBannerImage) {
    update.banner_image_path = null
  }

  const { error } = await supabase.from('categories').update(update).eq('id', id)
  if (error) {
    redirect(`/admin/subpages/${id}/edit?error=` + encodeURIComponent(error.message))
  }

  if (oldBannerPath && update.banner_image_path !== oldBannerPath) {
    await supabase.storage.from('category-banners').remove([oldBannerPath])
  }

  revalidatePath('/admin/subpages')
  revalidatePath('/', 'layout')
  redirect('/admin/subpages')
}

// 드래그로 순서 변경 — 같은 그룹(같은 parent_id를 공유하는 형제들) 안에서 호출
// orderedIds: 새 순서대로 나열된 카테고리 id 배열. 각 id의 sort_order를 인덱스로 갱신.
export async function reorderCategories(orderedIds: number[]) {
  const { supabase } = await ensureAdmin()

  if (orderedIds.length === 0) return

  await Promise.all(
    orderedIds.map((id, idx) =>
      supabase.from('categories').update({ sort_order: idx }).eq('id', id)
    )
  )

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
