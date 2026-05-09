'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import DOMPurify from 'isomorphic-dompurify'
import { createClient } from '@/lib/supabase/server'
import type { ProductComponent } from '@/lib/types'

const PRODUCTS_BUCKET = 'products'

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

function sanitize(html: string) {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target', 'rel', 'colspan', 'rowspan', 'colwidth', 'style'],
  })
}

function uniquePath(originalName: string) {
  const ext = originalName.includes('.') ? originalName.split('.').pop() : 'bin'
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
}

async function uploadFile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File
): Promise<string> {
  const path = uniquePath(file.name)
  const { error } = await supabase.storage
    .from(PRODUCTS_BUCKET)
    .upload(path, file, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })
  if (error) throw error
  return path
}

function getErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof Error) return e.message
  if (typeof e === 'object' && e !== null && 'message' in e) {
    const m = (e as { message?: unknown }).message
    if (typeof m === 'string') return m
  }
  return fallback
}

// 태그 화이트리스트는 이제 DB(tags 테이블)가 단일 출처. 어드민만 폼을 제출할 수 있으니
// value 가 영문/숫자/하이픈 형태로만 들어오도록 가벼운 형태 검증만 수행.
const TAG_VALUE_RE = /^[a-zA-Z0-9_-]+$/

function parsePositiveNumber(raw: FormDataEntryValue | null): number | null {
  if (raw == null) return null
  const s = String(raw).trim()
  if (!s) return null
  const n = Number(s)
  if (!Number.isFinite(n) || n <= 0) return null
  return n
}

function parseProductFields(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  const modelName = String(formData.get('model_name') ?? '').trim()
  const installType = String(formData.get('install_type') ?? '').trim()
  const sizeText = String(formData.get('size_text') ?? '').trim()
  const sizeW = parsePositiveNumber(formData.get('size_w'))
  const sizeD = parsePositiveNumber(formData.get('size_d'))
  const sizeH = parsePositiveNumber(formData.get('size_h'))
  const material = String(formData.get('material') ?? '').trim()
  const extrasText = String(formData.get('extras_text') ?? '').trim()
  const description = sanitize(String(formData.get('description') ?? '').trim())
  const categoryRaw = String(formData.get('category_id') ?? '').trim()
  const sortOrder = Number(formData.get('sort_order') ?? 0) || 0
  const isActive = formData.get('is_active') === 'on'

  // components: 폼에서는 component_name[] / component_target_id[] 두 배열로 옴
  const compNames = formData.getAll('component_name').map((v) => String(v).trim())
  const compTargets = formData.getAll('component_target_id').map((v) => String(v).trim())
  const components: ProductComponent[] = compNames
    .map((name, i): ProductComponent | null => {
      if (!name) return null
      const tid = compTargets[i] ? Number(compTargets[i]) : NaN
      return { name, target_id: Number.isFinite(tid) ? tid : null }
    })
    .filter((v): v is ProductComponent => v !== null)

  // tags: 형식 검증 + 중복 제거 (DB tags 테이블이 단일 출처)
  const tagsPresent = formData.get('tags_present') === '1'
  const rawTags = formData
    .getAll('tags')
    .map((v) => String(v).trim())
    .filter((v) => v && TAG_VALUE_RE.test(v))
  const tags = Array.from(new Set(rawTags))

  // colors: 색상 섹션이 렌더된 경우에만 갱신 (color_name[] / color_hex[] 같은 인덱스로 짝짓기)
  const colorsPresent = formData.get('colors_present') === '1'
  const colorNames = formData.getAll('color_name').map((v) => String(v).trim())
  const colorHexes = formData.getAll('color_hex').map((v) => String(v).trim())
  const colors = colorNames
    .map((name, i) => ({ name, hex: colorHexes[i] ?? '' }))
    .filter((c) => c.name && c.hex)

  // 카테고리별 필터값:
  //   filter_keys[] 에 등장한 key 들을 화이트리스트로 사용,
  //   각 key 별로 filter[<key>][] 의 모든 값을 모은다.
  const filtersPresent = formData.get('filters_present') === '1'
  const filterKeys = Array.from(
    new Set(
      formData
        .getAll('filter_keys')
        .map((v) => String(v).trim())
        .filter(Boolean)
    )
  )
  const filterValues: Record<string, string[]> = {}
  for (const key of filterKeys) {
    const vals = formData
      .getAll(`filter[${key}]`)
      .map((v) => String(v).trim())
      .filter(Boolean)
    if (vals.length > 0) filterValues[key] = Array.from(new Set(vals))
  }

  // 색상 필터 자동 동기화: 색상 섹션이 있으면 filter_values.color 를 colors 에서 자동 생성.
  // (어드민에서 색상 필터 옵션을 따로 관리할 필요 없음 — 글로벌 'color' 필터로 사용)
  if (colorsPresent) {
    const colorVals = colors
      .map((c) => c.name.trim())
      .filter(Boolean)
    if (colorVals.length > 0) {
      filterValues.color = Array.from(new Set(colorVals))
    } else {
      delete filterValues.color
    }
  }

  return {
    name,
    model_name: modelName || null,
    install_type: installType || null,
    size_text: sizeText || null,
    size_w: sizeW,
    size_d: sizeD,
    size_h: sizeH,
    material: material || null,
    components,
    extras_text: extrasText || null,
    description,
    category_id: categoryRaw ? Number(categoryRaw) : null,
    sort_order: sortOrder,
    is_active: isActive,
    // 각 섹션이 폼에 렌더된 경우에만 갱신 — 안 그러면 키를 빼서 기존 값 유지
    ...(tagsPresent ? { tags } : {}),
    ...(colorsPresent ? { colors } : {}),
    // filtersPresent OR colorsPresent 둘 중 하나라도 있으면 filter_values 갱신
    // (색상 자동 동기화가 색상 단독 변경에서도 반영되도록)
    ...(filtersPresent || colorsPresent ? { filter_values: filterValues } : {}),
  }
}

export async function createProduct(formData: FormData) {
  const { supabase } = await ensureAdmin()
  const fields = parseProductFields(formData)

  const mainFile = formData.get('main_image') as File | null
  const additionalFiles = (formData.getAll('additional_images') as File[]).filter(
    (f) => f && f.size > 0
  )
  const specSheet = formData.get('spec_sheet') as File | null
  const colorChart = formData.get('color_chart') as File | null

  if (!fields.name) {
    redirect('/mng/products/new?error=' + encodeURIComponent('제품명을 입력해주세요'))
  }
  if (!mainFile || mainFile.size === 0) {
    redirect('/mng/products/new?error=' + encodeURIComponent('대표 이미지를 업로드해주세요'))
  }

  const uploaded: string[] = []
  let mainPath: string
  const additionalPaths: string[] = []
  let specPath: string | null = null
  let colorPath: string | null = null

  try {
    mainPath = await uploadFile(supabase, mainFile)
    uploaded.push(mainPath)
    for (const f of additionalFiles) {
      const p = await uploadFile(supabase, f)
      uploaded.push(p)
      additionalPaths.push(p)
    }
    if (specSheet && specSheet.size > 0) {
      specPath = await uploadFile(supabase, specSheet)
      uploaded.push(specPath)
    }
    if (colorChart && colorChart.size > 0) {
      colorPath = await uploadFile(supabase, colorChart)
      uploaded.push(colorPath)
    }
  } catch (e) {
    if (uploaded.length) await supabase.storage.from(PRODUCTS_BUCKET).remove(uploaded)
    redirect(
      '/mng/products/new?error=' + encodeURIComponent(getErrorMessage(e, '업로드 실패'))
    )
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      ...fields,
      main_image_path: mainPath,
      additional_images: additionalPaths,
      spec_sheet_path: specPath,
      color_chart_path: colorPath,
    })
    .select('id')
    .single()

  if (error) {
    await supabase.storage.from(PRODUCTS_BUCKET).remove(uploaded)
    redirect('/mng/products/new?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/mng/products')
  revalidatePath('/products')
  revalidatePath(`/products/${data!.id}`)
  revalidatePath('/') // 메인 Best Seller / New Product 갱신
  redirect('/mng/products')
}

export async function updateProduct(id: number, formData: FormData) {
  const { supabase } = await ensureAdmin()
  const fields = parseProductFields(formData)

  if (!fields.name) {
    redirect(`/mng/products/${id}/edit?error=` + encodeURIComponent('제품명을 입력해주세요'))
  }

  const mainFile = formData.get('main_image') as File | null
  const additionalFiles = (formData.getAll('additional_images') as File[]).filter(
    (f) => f && f.size > 0
  )
  const removedAdditional = formData
    .getAll('remove_additional')
    .map(String)
    .filter(Boolean)
  const specSheet = formData.get('spec_sheet') as File | null
  const colorChart = formData.get('color_chart') as File | null
  const removeSpec = formData.get('remove_spec_sheet') === 'on'
  const removeColor = formData.get('remove_color_chart') === 'on'

  const { data: existing } = await supabase
    .from('products')
    .select(
      'main_image_path, additional_images, spec_sheet_path, color_chart_path'
    )
    .eq('id', id)
    .single()

  const currentAdditional = (existing?.additional_images ?? []) as string[]
  const keptAdditional = currentAdditional.filter((p) => !removedAdditional.includes(p))

  const update: Record<string, unknown> = { ...fields }
  const newlyUploaded: string[] = []
  const oldFilesToRemove: string[] = [...removedAdditional]

  try {
    if (mainFile && mainFile.size > 0) {
      const p = await uploadFile(supabase, mainFile)
      newlyUploaded.push(p)
      update.main_image_path = p
      if (existing?.main_image_path) oldFilesToRemove.push(existing.main_image_path)
    }

    const additionalUploaded: string[] = []
    for (const f of additionalFiles) {
      const p = await uploadFile(supabase, f)
      newlyUploaded.push(p)
      additionalUploaded.push(p)
    }
    update.additional_images = [...keptAdditional, ...additionalUploaded]

    if (specSheet && specSheet.size > 0) {
      const p = await uploadFile(supabase, specSheet)
      newlyUploaded.push(p)
      update.spec_sheet_path = p
      if (existing?.spec_sheet_path) oldFilesToRemove.push(existing.spec_sheet_path)
    } else if (removeSpec) {
      update.spec_sheet_path = null
      if (existing?.spec_sheet_path) oldFilesToRemove.push(existing.spec_sheet_path)
    }

    if (colorChart && colorChart.size > 0) {
      const p = await uploadFile(supabase, colorChart)
      newlyUploaded.push(p)
      update.color_chart_path = p
      if (existing?.color_chart_path) oldFilesToRemove.push(existing.color_chart_path)
    } else if (removeColor) {
      update.color_chart_path = null
      if (existing?.color_chart_path) oldFilesToRemove.push(existing.color_chart_path)
    }

    const { error } = await supabase.from('products').update(update).eq('id', id)
    if (error) throw error

    // 시공사례 연결 동기화 (메인 저장과 통합)
    await syncProductLinkedCases(supabase, id, formData)

    if (oldFilesToRemove.length) {
      await supabase.storage.from(PRODUCTS_BUCKET).remove(oldFilesToRemove)
    }
  } catch (e) {
    if (newlyUploaded.length) {
      await supabase.storage.from(PRODUCTS_BUCKET).remove(newlyUploaded)
    }
    redirect(
      `/mng/products/${id}/edit?error=` +
        encodeURIComponent(getErrorMessage(e, '수정 실패'))
    )
  }

  revalidatePath('/mng/products')
  revalidatePath('/products')
  revalidatePath(`/products/${id}`)
  revalidatePath('/construction-cases')
  revalidatePath('/mng/gallery')
  revalidatePath('/') // 메인 Best Seller / New Product 갱신
  redirect('/mng/products')
}

/**
 * 시공사례 양방향 동기화 (내부 헬퍼).
 * formData 의 case_ids 체크박스를 바탕으로 각 케이스의 product_hrefs 배열을 갱신.
 *
 * - cases_picker_present 마커가 없으면 (= 폼에 피커가 렌더되지 않은 등록 모드 등) 아무 것도 하지 않음
 * - 선택된 id: product_hrefs 에 productHref 추가 (없을 때만)
 * - 해제된 id (현재 연결돼있지만 미선택): productHref 제거
 */
async function syncProductLinkedCases(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productId: number,
  formData: FormData
) {
  if (formData.get('cases_picker_present') !== '1') return

  const productHref = `/products/${productId}`
  const selectedIds = new Set(
    formData
      .getAll('case_ids')
      .map((v) => Number(v))
      .filter((v) => Number.isFinite(v))
  )

  // jsonb contains 가 환경에 따라 까다로워 전체 가져와 JS 로 필터
  const { data: allCases } = await supabase
    .from('gallery_items')
    .select('id, product_hrefs')

  const currentlyLinkedById = new Map<number, string[]>()
  for (const r of (allCases ?? []) as Array<{
    id: number
    product_hrefs: string[]
  }>) {
    if (Array.isArray(r.product_hrefs) && r.product_hrefs.includes(productHref)) {
      currentlyLinkedById.set(r.id, r.product_hrefs)
    }
  }

  const toAddIds = Array.from(selectedIds).filter(
    (id) => !currentlyLinkedById.has(id)
  )
  const toRemoveIds = Array.from(currentlyLinkedById.keys()).filter(
    (id) => !selectedIds.has(id)
  )

  if (toAddIds.length > 0) {
    const { data: addRows } = await supabase
      .from('gallery_items')
      .select('id, product_hrefs')
      .in('id', toAddIds)

    const addResults = await Promise.all(
      ((addRows ?? []) as Array<{ id: number; product_hrefs: string[] }>).map(
        (r) => {
          const next = Array.from(new Set([...(r.product_hrefs ?? []), productHref]))
          return supabase
            .from('gallery_items')
            .update({ product_hrefs: next })
            .eq('id', r.id)
        }
      )
    )
    const failed = addResults.find((r) => r.error)
    if (failed?.error) {
      throw new Error('시공사례 연결 추가 실패: ' + failed.error.message)
    }
  }

  if (toRemoveIds.length > 0) {
    const removeResults = await Promise.all(
      toRemoveIds.map((id) => {
        const cur = currentlyLinkedById.get(id) ?? []
        const next = cur.filter((h) => h !== productHref)
        return supabase
          .from('gallery_items')
          .update({ product_hrefs: next })
          .eq('id', id)
      })
    )
    const failed = removeResults.find((r) => r.error)
    if (failed?.error) {
      throw new Error('시공사례 연결 해제 실패: ' + failed.error.message)
    }
  }

  console.log('[product cases sync]', {
    productId,
    selected: Array.from(selectedIds),
    added: toAddIds,
    removed: toRemoveIds,
  })
}

/**
 * 단일 제품 복제 (내부 헬퍼). 성공 시 새 id 반환, 실패 시 throw.
 * 외부 액션(duplicateProduct, bulkDuplicateProducts) 둘 다에서 사용.
 */
async function duplicateProductCore(
  supabase: Awaited<ReturnType<typeof createClient>>,
  id: number
): Promise<number> {
  const { data: src, error: fetchErr } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()
  if (fetchErr || !src) throw new Error('복제 대상 제품을 찾을 수 없습니다')

  const copyOne = async (path: string | null): Promise<string | null> => {
    if (!path) return null
    const newPath = uniquePath(path)
    const { error } = await supabase.storage
      .from(PRODUCTS_BUCKET)
      .copy(path, newPath)
    if (error) throw error
    return newPath
  }

  const copiedPaths: string[] = []
  let newMain: string | null = null
  let newSpec: string | null = null
  let newColorChart: string | null = null
  const newAdditional: string[] = []

  try {
    newMain = await copyOne(src.main_image_path)
    if (newMain) copiedPaths.push(newMain)

    for (const p of (src.additional_images ?? []) as string[]) {
      const np = await copyOne(p)
      if (np) {
        copiedPaths.push(np)
        newAdditional.push(np)
      }
    }

    newSpec = await copyOne(src.spec_sheet_path)
    if (newSpec) copiedPaths.push(newSpec)

    newColorChart = await copyOne(src.color_chart_path)
    if (newColorChart) copiedPaths.push(newColorChart)

    const baseName = String(src.name ?? '').replace(
      /\s*\(복사(?:\s*\d+)?\)\s*$/,
      ''
    )
    const cloneName = `${baseName} (복사)`

    const { data: inserted, error: insErr } = await supabase
      .from('products')
      .insert({
        category_id: src.category_id,
        name: cloneName,
        model_name: src.model_name,
        install_type: src.install_type,
        size_text: src.size_text,
        size_w: src.size_w,
        size_d: src.size_d,
        size_h: src.size_h,
        material: src.material,
        components: src.components ?? [],
        extras_text: src.extras_text,
        main_image_path: newMain ?? src.main_image_path,
        additional_images: newAdditional,
        description: src.description,
        spec_sheet_path: newSpec,
        color_chart_path: newColorChart,
        colors: src.colors ?? [],
        tags: src.tags ?? [],
        filter_values: src.filter_values ?? {},
        is_active: false,
        sort_order: src.sort_order ?? 0,
      })
      .select('id')
      .single()

    if (insErr || !inserted) {
      throw new Error(insErr?.message ?? '복제 저장 실패')
    }
    return inserted.id as number
  } catch (e) {
    if (copiedPaths.length) {
      await supabase.storage.from(PRODUCTS_BUCKET).remove(copiedPaths)
    }
    throw e
  }
}

/**
 * 제품 복제 (단일) — 새 제품의 수정 페이지로 이동.
 */
export async function duplicateProduct(id: number) {
  const { supabase } = await ensureAdmin()
  let newId: number
  try {
    newId = await duplicateProductCore(supabase, id)
  } catch (e) {
    redirect(
      '/mng/products?error=' +
        encodeURIComponent(getErrorMessage(e, '복제 실패'))
    )
  }
  revalidatePath('/mng/products', 'page')
  revalidatePath('/mng', 'layout')
  revalidatePath('/products')
  redirect(`/mng/products/${newId}/edit`)
}

/**
 * 제품 일괄 복제. 실패한 항목이 있으면 throw 로 클라이언트에 알림.
 */
export async function bulkDuplicateProducts(ids: number[]) {
  if (!ids || ids.length === 0) return
  const { supabase } = await ensureAdmin()

  const failures: string[] = []
  let successCount = 0
  for (const id of ids) {
    try {
      await duplicateProductCore(supabase, id)
      successCount++
    } catch (e) {
      const msg = getErrorMessage(e, '알수없는 오류')
      failures.push(`#${id}: ${msg}`)
      console.warn('[bulk duplicate product] failed', id, e)
    }
  }

  // 캐시 무효화 — page · 상위 layout 둘 다 (Next 16 의 cache 동작 보강)
  revalidatePath('/mng/products', 'page')
  revalidatePath('/mng', 'layout')
  revalidatePath('/products')
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
 * 제품 일괄 공개 상태 변경 (true=공개, false=비공개).
 */
export async function bulkUpdateProductsActive(ids: number[], active: boolean) {
  if (!ids || ids.length === 0) return
  const { supabase } = await ensureAdmin()
  const { error } = await supabase
    .from('products')
    .update({ is_active: active })
    .in('id', ids)
  if (error) throw new Error(error.message)

  revalidatePath('/mng/products', 'page')
  revalidatePath('/mng', 'layout')
  revalidatePath('/products')
  revalidatePath('/')
}

/**
 * 제품 일괄 삭제. 스토리지 정리 포함.
 */
export async function bulkDeleteProducts(ids: number[]) {
  if (!ids || ids.length === 0) return
  const { supabase } = await ensureAdmin()

  const { data: rows } = await supabase
    .from('products')
    .select(
      'main_image_path, additional_images, spec_sheet_path, color_chart_path'
    )
    .in('id', ids)

  const { error } = await supabase.from('products').delete().in('id', ids)
  if (error) throw new Error(error.message)

  const paths: string[] = []
  for (const r of (rows ?? []) as Array<{
    main_image_path: string | null
    additional_images: string[] | null
    spec_sheet_path: string | null
    color_chart_path: string | null
  }>) {
    if (r.main_image_path) paths.push(r.main_image_path)
    if (Array.isArray(r.additional_images)) paths.push(...r.additional_images)
    if (r.spec_sheet_path) paths.push(r.spec_sheet_path)
    if (r.color_chart_path) paths.push(r.color_chart_path)
  }
  if (paths.length) {
    await supabase.storage.from(PRODUCTS_BUCKET).remove(paths)
  }

  revalidatePath('/mng/products', 'page')
  revalidatePath('/mng', 'layout')
  revalidatePath('/products')
  revalidatePath('/')
}

export async function deleteProduct(id: number) {
  const { supabase } = await ensureAdmin()

  const { data: existing } = await supabase
    .from('products')
    .select('main_image_path, additional_images, spec_sheet_path, color_chart_path')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw new Error(error.message)

  const paths: string[] = []
  if (existing?.main_image_path) paths.push(existing.main_image_path)
  if (existing?.additional_images)
    paths.push(...((existing.additional_images as string[]) ?? []))
  if (existing?.spec_sheet_path) paths.push(existing.spec_sheet_path)
  if (existing?.color_chart_path) paths.push(existing.color_chart_path)
  if (paths.length) {
    await supabase.storage.from(PRODUCTS_BUCKET).remove(paths)
  }

  revalidatePath('/mng/products', 'page')
  revalidatePath('/mng', 'layout')
  revalidatePath('/products')
  revalidatePath('/')
}
