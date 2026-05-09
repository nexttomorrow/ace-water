'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { ProductFilterOption } from '@/lib/types'

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
  return { supabase }
}

function slugifyKey(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function parseFilterFields(formData: FormData) {
  const categoryRaw = String(formData.get('category_id') ?? '').trim()
  const keyRaw = String(formData.get('key') ?? '').trim()
  const label = String(formData.get('label') ?? '').trim()
  const isVisible = formData.get('is_visible') === 'on'
  const sortOrder = Number(formData.get('sort_order') ?? 0) || 0

  const optionLabels = formData
    .getAll('option_label')
    .map((v) => String(v).trim())
  const optionValues = formData
    .getAll('option_value')
    .map((v) => String(v).trim())

  const options: ProductFilterOption[] = optionLabels
    .map((labelText, i) => {
      const value = optionValues[i] || slugifyKey(labelText)
      return { value, label: labelText }
    })
    .filter((o) => o.label && o.value)

  return {
    category_id: categoryRaw ? Number(categoryRaw) : null,
    key: slugifyKey(keyRaw) || slugifyKey(label),
    label,
    options,
    is_visible: isVisible,
    sort_order: sortOrder,
  }
}

/** 'color' 키는 옵션을 자동 합성하므로 옵션 개수 검증 제외 대상 */
const AUTO_OPTION_KEYS = new Set(['color'])

export async function createFilter(formData: FormData) {
  const { supabase } = await ensureAdmin()
  const fields = parseFilterFields(formData)
  if (!fields.label) {
    redirect('/mng/filters/new?error=' + encodeURIComponent('필터 라벨을 입력해주세요'))
  }
  if (!fields.key) {
    redirect('/mng/filters/new?error=' + encodeURIComponent('필터 키를 입력해주세요'))
  }
  if (!AUTO_OPTION_KEYS.has(fields.key) && fields.options.length === 0) {
    redirect('/mng/filters/new?error=' + encodeURIComponent('옵션을 1개 이상 추가해주세요'))
  }

  const { error } = await supabase.from('product_filters').insert(fields)
  if (error) {
    redirect('/mng/filters/new?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/mng/filters')
  revalidatePath('/products')
  redirect('/mng/filters')
}

export async function updateFilter(id: number, formData: FormData) {
  const { supabase } = await ensureAdmin()
  const fields = parseFilterFields(formData)
  if (!fields.label) {
    redirect(`/mng/filters/${id}/edit?error=` + encodeURIComponent('필터 라벨을 입력해주세요'))
  }
  if (!fields.key) {
    redirect(`/mng/filters/${id}/edit?error=` + encodeURIComponent('필터 키를 입력해주세요'))
  }
  if (!AUTO_OPTION_KEYS.has(fields.key) && fields.options.length === 0) {
    redirect(`/mng/filters/${id}/edit?error=` + encodeURIComponent('옵션을 1개 이상 추가해주세요'))
  }

  const { error } = await supabase.from('product_filters').update(fields).eq('id', id)
  if (error) {
    redirect(`/mng/filters/${id}/edit?error=` + encodeURIComponent(error.message))
  }

  revalidatePath('/mng/filters')
  revalidatePath('/products')
  redirect('/mng/filters')
}

/**
 * 글로벌 'color' 필터를 한 번에 생성. 이미 있으면 무시.
 */
export async function ensureColorFilter() {
  const { supabase } = await ensureAdmin()

  const { data: existing } = await supabase
    .from('product_filters')
    .select('id')
    .is('category_id', null)
    .eq('key', 'color')
    .maybeSingle()

  if (existing) {
    revalidatePath('/mng/filters')
    return
  }

  await supabase.from('product_filters').insert({
    category_id: null,
    key: 'color',
    label: '색상',
    options: [],
    is_visible: true,
    sort_order: 0,
  })

  revalidatePath('/mng/filters')
  revalidatePath('/products')
}

export async function deleteFilter(id: number) {
  const { supabase } = await ensureAdmin()
  await supabase.from('product_filters').delete().eq('id', id)
  revalidatePath('/mng/filters')
  revalidatePath('/products')
}

export async function toggleFilterVisible(id: number, current: boolean) {
  const { supabase } = await ensureAdmin()
  await supabase.from('product_filters').update({ is_visible: !current }).eq('id', id)
  revalidatePath('/mng/filters')
  revalidatePath('/products')
}

/**
 * 같은 카테고리 그룹 내에서만 sort_order 를 순차로 다시 매김.
 * orderedIds 는 이미 원하는 순서로 정렬된 id 배열.
 */
export async function reorderFilters(orderedIds: number[]) {
  const { supabase } = await ensureAdmin()
  if (orderedIds.length === 0) return
  await Promise.all(
    orderedIds.map((id, idx) =>
      supabase.from('product_filters').update({ sort_order: idx }).eq('id', id)
    )
  )
  revalidatePath('/mng/filters')
  revalidatePath('/products')
}
