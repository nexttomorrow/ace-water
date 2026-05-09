import type { ProductFilter } from '@/lib/types'
import { createClient } from '@/lib/supabase/server'

/**
 * 특정 카테고리에 적용되는 필터 + 글로벌 필터(category_id null) 를 합쳐서 반환.
 * 화면에 노출할 필터만 (is_visible = true).
 */
export async function fetchVisibleFiltersForCategory(
  categoryId: number | null
): Promise<ProductFilter[]> {
  const supabase = await createClient()

  const query = supabase
    .from('product_filters')
    .select('*')
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true })

  const { data } = categoryId
    ? await query.or(`category_id.eq.${categoryId},category_id.is.null`)
    : await query.is('category_id', null)

  return (data ?? []) as ProductFilter[]
}

/**
 * 어드민 화면용 — 모든 필터 (숨김 포함) 조회.
 */
export async function fetchAllFilters(): Promise<ProductFilter[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('product_filters')
    .select('*')
    .order('category_id', { ascending: true, nullsFirst: true })
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true })
  return (data ?? []) as ProductFilter[]
}
