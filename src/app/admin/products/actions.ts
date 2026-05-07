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

function parseProductFields(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  const modelName = String(formData.get('model_name') ?? '').trim()
  const installType = String(formData.get('install_type') ?? '').trim()
  const sizeText = String(formData.get('size_text') ?? '').trim()
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

  return {
    name,
    model_name: modelName || null,
    install_type: installType || null,
    size_text: sizeText || null,
    material: material || null,
    components,
    extras_text: extrasText || null,
    description,
    category_id: categoryRaw ? Number(categoryRaw) : null,
    sort_order: sortOrder,
    is_active: isActive,
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
    redirect('/admin/products/new?error=' + encodeURIComponent('제품명을 입력해주세요'))
  }
  if (!mainFile || mainFile.size === 0) {
    redirect('/admin/products/new?error=' + encodeURIComponent('대표 이미지를 업로드해주세요'))
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
      '/admin/products/new?error=' + encodeURIComponent(getErrorMessage(e, '업로드 실패'))
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
    redirect('/admin/products/new?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/admin/products')
  revalidatePath('/products')
  revalidatePath(`/products/${data!.id}`)
  redirect('/admin/products')
}

export async function updateProduct(id: number, formData: FormData) {
  const { supabase } = await ensureAdmin()
  const fields = parseProductFields(formData)

  if (!fields.name) {
    redirect(`/admin/products/${id}/edit?error=` + encodeURIComponent('제품명을 입력해주세요'))
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

    if (oldFilesToRemove.length) {
      await supabase.storage.from(PRODUCTS_BUCKET).remove(oldFilesToRemove)
    }
  } catch (e) {
    if (newlyUploaded.length) {
      await supabase.storage.from(PRODUCTS_BUCKET).remove(newlyUploaded)
    }
    redirect(
      `/admin/products/${id}/edit?error=` +
        encodeURIComponent(getErrorMessage(e, '수정 실패'))
    )
  }

  revalidatePath('/admin/products')
  revalidatePath('/products')
  revalidatePath(`/products/${id}`)
  redirect('/admin/products')
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

  revalidatePath('/admin/products')
  revalidatePath('/products')
}
