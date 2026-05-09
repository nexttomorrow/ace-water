'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  HERO_SLIDES_MAX,
  CASE_ADDITIONAL_MAX,
  type EstimateStatus,
} from '@/lib/types'

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

// ---------- gallery (시공사례) ----------

async function uploadToGallery(supabase: Awaited<ReturnType<typeof createClient>>, file: File) {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage
    .from('gallery')
    .upload(path, file, { contentType: file.type, upsert: false })
  if (error) throw error
  return path
}

// Supabase 에러는 Error 인스턴스가 아닐 수 있어 직접 message 를 추출
function getErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof Error) return e.message
  if (typeof e === 'object' && e !== null && 'message' in e) {
    const m = (e as { message?: unknown }).message
    if (typeof m === 'string') return m
  }
  if (typeof e === 'string') return e
  return fallback
}

function parseCaseFields(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const modelName = String(formData.get('model_name') ?? '').trim()
  const siteName = String(formData.get('site_name') ?? '').trim()
  const clientName = String(formData.get('client_name') ?? '').trim()
  const productHrefs = formData
    .getAll('product_hrefs')
    .map((v) => String(v).trim())
    .filter(Boolean)
  const categoryRaw = String(formData.get('category_id') ?? '').trim()

  return {
    title,
    description: description || null,
    model_name: modelName || null,
    site_name: siteName || null,
    client_name: clientName || null,
    product_hrefs: productHrefs,
    category_id: categoryRaw ? Number(categoryRaw) : null,
  }
}

export async function createGalleryItem(formData: FormData) {
  const { supabase } = await ensureAdmin()
  const fields = parseCaseFields(formData)
  const mainFile = formData.get('image') as File | null
  const additionalFiles = formData.getAll('additional_images') as File[]
  const validAdditional = additionalFiles.filter((f) => f && f.size > 0)

  if (!fields.title || !mainFile || mainFile.size === 0) {
    redirect('/mng/gallery/new?error=' + encodeURIComponent('제목과 대표 이미지를 입력해주세요'))
  }

  if (validAdditional.length > CASE_ADDITIONAL_MAX) {
    redirect(
      '/mng/gallery/new?error=' +
        encodeURIComponent(
          `추가 이미지는 최대 ${CASE_ADDITIONAL_MAX}장까지 등록할 수 있어요 (선택: ${validAdditional.length}장)`
        )
    )
  }

  const uploaded: string[] = []
  let mainPath: string
  try {
    mainPath = await uploadToGallery(supabase, mainFile)
    uploaded.push(mainPath)
    for (const f of validAdditional) {
      const p = await uploadToGallery(supabase, f)
      uploaded.push(p)
    }
  } catch (e) {
    if (uploaded.length) await supabase.storage.from('gallery').remove(uploaded)
    redirect('/mng/gallery/new?error=' + encodeURIComponent(getErrorMessage(e, '업로드 실패')))
  }

  const additionalPaths = uploaded.slice(1)

  const { error } = await supabase.from('gallery_items').insert({
    ...fields,
    image_path: mainPath,
    additional_images: additionalPaths,
  })

  if (error) {
    await supabase.storage.from('gallery').remove(uploaded)
    redirect('/mng/gallery/new?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/mng/gallery')
  revalidatePath('/gallery')
  revalidatePath('/construction-cases')
  revalidatePath('/')
  redirect('/mng/gallery')
}

export async function updateGalleryItem(id: number, formData: FormData) {
  const { supabase } = await ensureAdmin()
  const fields = parseCaseFields(formData)
  const mainFile = formData.get('image') as File | null
  const additionalFiles = formData.getAll('additional_images') as File[]
  // 기존 추가 이미지 중 제거할 path 들
  const removedAdditional = formData.getAll('remove_additional').map(String).filter(Boolean)

  if (!fields.title) {
    redirect(`/mng/gallery/${id}/edit?error=` + encodeURIComponent('제목을 입력해주세요'))
  }

  const { data: existing } = await supabase
    .from('gallery_items')
    .select('image_path, additional_images')
    .eq('id', id)
    .single()

  const currentAdditional = (existing?.additional_images ?? []) as string[]
  const keptAdditional = currentAdditional.filter(
    (p) => !removedAdditional.includes(p)
  )
  const validNewAdditional = additionalFiles.filter((f) => f && f.size > 0)
  const finalCount = keptAdditional.length + validNewAdditional.length

  if (finalCount > CASE_ADDITIONAL_MAX) {
    redirect(
      `/mng/gallery/${id}/edit?error=` +
        encodeURIComponent(
          `추가 이미지는 최대 ${CASE_ADDITIONAL_MAX}장까지 가능합니다 (현재 유지 ${keptAdditional.length}장 + 신규 ${validNewAdditional.length}장 = ${finalCount}장)`
        )
    )
  }

  const update: Record<string, unknown> = { ...fields }
  let oldMainPath: string | null = null
  const newlyUploaded: string[] = []

  try {
    if (mainFile && mainFile.size > 0) {
      oldMainPath = existing?.image_path ?? null
      const p = await uploadToGallery(supabase, mainFile)
      newlyUploaded.push(p)
      update.image_path = p
    }

    const additionalUploaded: string[] = []
    for (const f of validNewAdditional) {
      const p = await uploadToGallery(supabase, f)
      newlyUploaded.push(p)
      additionalUploaded.push(p)
    }

    update.additional_images = [...keptAdditional, ...additionalUploaded]

    const { error } = await supabase.from('gallery_items').update(update).eq('id', id)
    if (error) throw error

    // 정리 — 교체된 메인 이미지 + 제거 요청된 추가 이미지 삭제
    const toRemove: string[] = []
    if (oldMainPath) toRemove.push(oldMainPath)
    toRemove.push(...removedAdditional)
    if (toRemove.length) {
      await supabase.storage.from('gallery').remove(toRemove)
    }
  } catch (e) {
    if (newlyUploaded.length) await supabase.storage.from('gallery').remove(newlyUploaded)
    redirect(
      `/mng/gallery/${id}/edit?error=` + encodeURIComponent(getErrorMessage(e, '업데이트 실패'))
    )
  }

  revalidatePath('/mng/gallery')
  revalidatePath('/gallery')
  revalidatePath('/construction-cases')
  revalidatePath(`/construction-cases/${id}`)
  revalidatePath('/')
  redirect('/mng/gallery')
}

/**
 * 단일 시공사례 복제 (내부 헬퍼). 성공 시 새 id 반환, 실패 시 throw.
 */
async function duplicateGalleryItemCore(
  supabase: Awaited<ReturnType<typeof createClient>>,
  id: number
): Promise<number> {
  const { data: src, error: fetchErr } = await supabase
    .from('gallery_items')
    .select('*')
    .eq('id', id)
    .single()
  if (fetchErr || !src) throw new Error('복제 대상 사례를 찾을 수 없습니다')

  const copyOne = async (path: string | null): Promise<string | null> => {
    if (!path) return null
    const ext = path.split('.').pop() ?? 'jpg'
    const newPath = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const { error } = await supabase.storage.from('gallery').copy(path, newPath)
    if (error) throw error
    return newPath
  }

  const copiedPaths: string[] = []
  let newImage: string | null = null
  const newAdditional: string[] = []

  try {
    newImage = await copyOne(src.image_path)
    if (newImage) copiedPaths.push(newImage)
    for (const p of (src.additional_images ?? []) as string[]) {
      const np = await copyOne(p)
      if (np) {
        copiedPaths.push(np)
        newAdditional.push(np)
      }
    }

    const baseTitle = String(src.title ?? '').replace(
      /\s*\(복사(?:\s*\d+)?\)\s*$/,
      ''
    )
    const cloneTitle = `${baseTitle} (복사)`

    const { data: inserted, error: insErr } = await supabase
      .from('gallery_items')
      .insert({
        title: cloneTitle,
        description: src.description,
        image_path: newImage ?? src.image_path,
        additional_images: newAdditional,
        category_id: src.category_id,
        model_name: src.model_name,
        site_name: src.site_name,
        client_name: src.client_name,
        product_hrefs: src.product_hrefs ?? [],
      })
      .select('id')
      .single()

    if (insErr || !inserted) {
      throw new Error(insErr?.message ?? '복제 저장 실패')
    }
    return inserted.id as number
  } catch (e) {
    if (copiedPaths.length) {
      await supabase.storage.from('gallery').remove(copiedPaths)
    }
    throw e
  }
}

/**
 * 시공사례 복제 (단일) — 새 사례 수정 페이지로 이동.
 */
export async function duplicateGalleryItem(id: number) {
  const { supabase } = await ensureAdmin()
  let newId: number
  try {
    newId = await duplicateGalleryItemCore(supabase, id)
  } catch (e) {
    redirect(
      '/mng/gallery?error=' +
        encodeURIComponent(getErrorMessage(e, '복제 실패'))
    )
  }
  revalidatePath('/mng/gallery')
  revalidatePath('/construction-cases')
  redirect(`/mng/gallery/${newId}/edit`)
}

/**
 * 시공사례 일괄 복제. 실패한 항목이 있으면 throw 로 클라이언트에 알림.
 */
export async function bulkDuplicateGalleryItems(ids: number[]) {
  if (!ids || ids.length === 0) return
  const { supabase } = await ensureAdmin()

  const failures: string[] = []
  let successCount = 0
  for (const id of ids) {
    try {
      await duplicateGalleryItemCore(supabase, id)
      successCount++
    } catch (e) {
      const msg = getErrorMessage(e, '알수없는 오류')
      failures.push(`#${id}: ${msg}`)
      console.warn('[bulk duplicate gallery] failed', id, e)
    }
  }

  revalidatePath('/mng/gallery', 'page')
  revalidatePath('/mng', 'layout')
  revalidatePath('/construction-cases')
  revalidatePath('/')

  if (failures.length > 0) {
    throw new Error(
      `${successCount}건 성공 / ${failures.length}건 실패. ${failures
        .slice(0, 3)
        .join(' · ')}`
    )
  }
}

/**
 * 시공사례 일괄 공개 상태 변경 (true=공개, false=비공개).
 */
export async function bulkUpdateGalleryItemsActive(
  ids: number[],
  active: boolean
) {
  if (!ids || ids.length === 0) return
  const { supabase } = await ensureAdmin()
  const { error } = await supabase
    .from('gallery_items')
    .update({ is_active: active })
    .in('id', ids)
  if (error) throw new Error(error.message)

  revalidatePath('/mng/gallery', 'page')
  revalidatePath('/mng', 'layout')
  revalidatePath('/construction-cases')
  revalidatePath('/')
}

/**
 * 시공사례 일괄 삭제. 스토리지 정리 포함.
 */
export async function bulkDeleteGalleryItems(ids: number[]) {
  if (!ids || ids.length === 0) return
  const { supabase } = await ensureAdmin()

  const { data: rows } = await supabase
    .from('gallery_items')
    .select('image_path, additional_images')
    .in('id', ids)

  const { error } = await supabase
    .from('gallery_items')
    .delete()
    .in('id', ids)
  if (error) throw new Error(error.message)

  const paths: string[] = []
  for (const r of (rows ?? []) as Array<{
    image_path: string | null
    additional_images: string[] | null
  }>) {
    if (r.image_path) paths.push(r.image_path)
    if (Array.isArray(r.additional_images)) paths.push(...r.additional_images)
  }
  if (paths.length) {
    const { error: storageErr } = await supabase.storage
      .from('gallery')
      .remove(paths)
    if (storageErr) {
      console.warn('[bulk delete gallery] storage cleanup failed', storageErr)
    }
  }

  revalidatePath('/mng/gallery')
  revalidatePath('/construction-cases')
}

export async function deleteGalleryItem(id: number) {
  const { supabase } = await ensureAdmin()

  const { data: existing } = await supabase
    .from('gallery_items')
    .select('image_path, additional_images')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('gallery_items').delete().eq('id', id)
  if (error) {
    redirect(
      '/mng/gallery?error=' +
        encodeURIComponent('시공사례 삭제 실패: ' + error.message)
    )
  }

  // 스토리지 정리 — 실패해도 행은 이미 삭제됐으니 무시 (로그만)
  const paths: string[] = []
  if (existing?.image_path) paths.push(existing.image_path)
  if (existing?.additional_images) paths.push(...(existing.additional_images as string[]))
  if (paths.length) {
    const { error: storageErr } = await supabase.storage.from('gallery').remove(paths)
    if (storageErr) {
      console.warn('[delete gallery] storage cleanup failed', storageErr)
    }
  }

  revalidatePath('/mng/gallery')
  revalidatePath('/gallery')
  revalidatePath('/construction-cases')
  revalidatePath('/')
  redirect('/mng/gallery')
}

// ---------- 시공사례 카테고리 ----------

export async function createCaseCategory(formData: FormData) {
  const { supabase } = await ensureAdmin()
  const name = String(formData.get('name') ?? '').trim()
  const slug = String(formData.get('slug') ?? '').trim()
  const sortOrder = Number(formData.get('sort_order') ?? 0) || 0
  const isActive = formData.get('is_active') === 'on'

  if (!name) {
    redirect(
      '/mng/gallery/categories/new?error=' + encodeURIComponent('이름을 입력해주세요')
    )
  }

  const { error } = await supabase.from('construction_case_categories').insert({
    name,
    slug: slug || null,
    sort_order: sortOrder,
    is_active: isActive,
  })

  if (error) {
    redirect('/mng/gallery/categories/new?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/mng/gallery')
  revalidatePath('/mng/gallery/categories')
  revalidatePath('/construction-cases')
  redirect('/mng/gallery/categories')
}

export async function updateCaseCategory(id: number, formData: FormData) {
  const { supabase } = await ensureAdmin()
  const name = String(formData.get('name') ?? '').trim()
  const slug = String(formData.get('slug') ?? '').trim()
  const sortOrder = Number(formData.get('sort_order') ?? 0) || 0
  const isActive = formData.get('is_active') === 'on'

  if (!name) {
    redirect(
      `/mng/gallery/categories/${id}/edit?error=` + encodeURIComponent('이름을 입력해주세요')
    )
  }

  const { error } = await supabase
    .from('construction_case_categories')
    .update({
      name,
      slug: slug || null,
      sort_order: sortOrder,
      is_active: isActive,
    })
    .eq('id', id)

  if (error) {
    redirect(
      `/mng/gallery/categories/${id}/edit?error=` + encodeURIComponent(error.message)
    )
  }

  revalidatePath('/mng/gallery')
  revalidatePath('/mng/gallery/categories')
  revalidatePath('/construction-cases')
  redirect('/mng/gallery/categories')
}

export async function deleteCaseCategory(id: number) {
  const { supabase } = await ensureAdmin()
  const { error } = await supabase.from('construction_case_categories').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/mng/gallery')
  revalidatePath('/mng/gallery/categories')
  revalidatePath('/construction-cases')
}

// ---------- board (admin) ----------

export async function adminDeletePost(id: number) {
  const { supabase } = await ensureAdmin()
  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/mng/board')
  revalidatePath('/board')
  revalidatePath('/')
}

/**
 * 게시글 일괄 삭제. ids 가 비어있으면 무시.
 */
export async function adminBulkDeletePosts(ids: number[]) {
  if (!ids || ids.length === 0) return
  const { supabase } = await ensureAdmin()
  const { error } = await supabase.from('posts').delete().in('id', ids)
  if (error) throw new Error(error.message)

  revalidatePath('/mng/board')
  revalidatePath('/board')
  revalidatePath('/')
}

// ---------- notices (admin) ----------

export async function adminBulkDeleteNotices(ids: number[]) {
  if (!ids || ids.length === 0) return
  const { supabase } = await ensureAdmin()
  const { error } = await supabase.from('notices').delete().in('id', ids)
  if (error) throw new Error(error.message)

  revalidatePath('/mng/notices')
  revalidatePath('/notices')
}

// ---------- estimate inquiries (admin) ----------

export async function adminBulkDeleteEstimates(ids: number[]) {
  if (!ids || ids.length === 0) return
  const { supabase } = await ensureAdmin()
  const { error } = await supabase
    .from('estimate_inquiries')
    .delete()
    .in('id', ids)
  if (error) throw new Error(error.message)

  revalidatePath('/mng/estimates')
}

export async function adminBulkUpdateEstimateStatus(
  ids: number[],
  status: EstimateStatus
) {
  if (!ids || ids.length === 0) return
  const { supabase } = await ensureAdmin()
  const { error } = await supabase
    .from('estimate_inquiries')
    .update({ status })
    .in('id', ids)
  if (error) throw new Error(error.message)

  revalidatePath('/mng/estimates')
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
    redirect('/mng/categories/new?error=' + encodeURIComponent('이름을 입력해주세요'))
  }

  let image_path: string | null = null
  if (file && file.size > 0) {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('categories')
      .upload(path, file, { contentType: file.type })
    if (uploadError) {
      redirect('/mng/categories/new?error=' + encodeURIComponent(uploadError.message))
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
      redirect('/mng/categories/new?error=' + encodeURIComponent(uploadError.message))
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
    redirect('/mng/categories/new?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/mng/categories')
  revalidatePath('/', 'layout')
  redirect('/mng/categories')
}

export async function updateCategory(id: number, formData: FormData) {
  const { supabase } = await ensureAdmin()
  const fields = parseCategoryForm(formData)
  const file = formData.get('image') as File | null
  const removeImage = formData.get('remove_image') === 'on'
  const bannerFile = formData.get('banner_image') as File | null
  const removeBannerImage = formData.get('remove_banner_image') === 'on'

  if (!fields.name) {
    redirect(`/mng/categories/${id}/edit?error=` + encodeURIComponent('이름을 입력해주세요'))
  }

  // prevent self-parent
  if (fields.parent_id === id) {
    redirect(
      `/mng/categories/${id}/edit?error=` +
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
      redirect(`/mng/categories/${id}/edit?error=` + encodeURIComponent(uploadError.message))
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
      redirect(`/mng/categories/${id}/edit?error=` + encodeURIComponent(uploadError.message))
    }
    update.banner_image_path = path
  } else if (removeBannerImage) {
    oldBannerPath = existing?.banner_image_path ?? null
    update.banner_image_path = null
  }

  const { error } = await supabase.from('categories').update(update).eq('id', id)
  if (error) {
    redirect(`/mng/categories/${id}/edit?error=` + encodeURIComponent(error.message))
  }

  if (oldImagePath) {
    await supabase.storage.from('categories').remove([oldImagePath])
  }
  if (oldBannerPath) {
    await supabase.storage.from('category-banners').remove([oldBannerPath])
  }

  revalidatePath('/mng/categories')
  revalidatePath('/', 'layout')
  redirect('/mng/categories')
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

  revalidatePath('/mng/categories')
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
    redirect('/mng/hero/new?error=' + encodeURIComponent('타이틀과 이미지를 입력해주세요'))
  }

  const { count } = await supabase
    .from('hero_slides')
    .select('*', { count: 'exact', head: true })
  if ((count ?? 0) >= HERO_SLIDES_MAX) {
    redirect(
      '/mng/hero/new?error=' +
        encodeURIComponent(`슬라이드는 최대 ${HERO_SLIDES_MAX}개까지 등록할 수 있어요`)
    )
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('hero')
    .upload(path, file, { contentType: file.type, upsert: false })
  if (uploadError) {
    redirect('/mng/hero/new?error=' + encodeURIComponent(uploadError.message))
  }

  const { error } = await supabase.from('hero_slides').insert({
    eyebrow,
    title,
    image_path: path,
    sort_order: sortOrder,
  })
  if (error) {
    await supabase.storage.from('hero').remove([path])
    redirect('/mng/hero/new?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/mng/hero')
  revalidatePath('/')
  redirect('/mng/hero')
}

export async function updateHeroSlide(id: number, formData: FormData) {
  const { supabase } = await ensureAdmin()

  const eyebrow = String(formData.get('eyebrow') ?? '').trim()
  const title = String(formData.get('title') ?? '').trim()
  const sortOrder = Number(formData.get('sort_order') ?? 0) || 0
  const file = formData.get('image') as File | null

  if (!title) {
    redirect(`/mng/hero/${id}/edit?error=` + encodeURIComponent('타이틀을 입력해주세요'))
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
      redirect(`/mng/hero/${id}/edit?error=` + encodeURIComponent(uploadError.message))
    }
    update.image_path = path
  }

  const { error } = await supabase.from('hero_slides').update(update).eq('id', id)
  if (error) {
    redirect(`/mng/hero/${id}/edit?error=` + encodeURIComponent(error.message))
  }

  if (oldPath && update.image_path) {
    await supabase.storage.from('hero').remove([oldPath])
  }

  revalidatePath('/mng/hero')
  revalidatePath('/')
  redirect('/mng/hero')
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

  revalidatePath('/mng/hero')
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
      redirect(`/mng/subpages/${id}/edit?error=` + encodeURIComponent(uploadError.message))
    }
    update.banner_image_path = path
  } else if (removeBannerImage) {
    update.banner_image_path = null
  }

  const { error } = await supabase.from('categories').update(update).eq('id', id)
  if (error) {
    redirect(`/mng/subpages/${id}/edit?error=` + encodeURIComponent(error.message))
  }

  if (oldBannerPath && update.banner_image_path !== oldBannerPath) {
    await supabase.storage.from('category-banners').remove([oldBannerPath])
  }

  revalidatePath('/mng/subpages')
  revalidatePath('/', 'layout')
  redirect('/mng/subpages')
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

  revalidatePath('/mng/categories')
  revalidatePath('/', 'layout')
}

export async function toggleCategoryActive(id: number, currentValue: boolean) {
  const { supabase } = await ensureAdmin()
  const { error } = await supabase
    .from('categories')
    .update({ is_active: !currentValue })
    .eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/mng/categories')
  revalidatePath('/', 'layout')
}
