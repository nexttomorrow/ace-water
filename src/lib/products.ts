import type { Category, ProductOption } from '@/lib/types'
import { createClient } from '@/lib/supabase/server'

/**
 * "제품안내" 최상위 카테고리 이름.
 * categories 테이블에서 name 으로 매칭하여 그 아래 자식들을 시공사례 카테고리로 사용.
 */
export const PRODUCT_ROOT_NAME = '제품안내'

/**
 * 시공사례에서 사용할 카테고리 목록.
 * "제품안내" 메뉴의 활성화된 자식 카테고리들을 반환한다.
 * (예: 정수기 / 연수기 / 음수기 ...)
 */
export async function fetchProductCategories(): Promise<
  { id: number; name: string }[]
> {
  const supabase = await createClient()

  const { data: root } = await supabase
    .from('categories')
    .select('id')
    .is('parent_id', null)
    .eq('name', PRODUCT_ROOT_NAME)
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!root) return []

  const { data: children } = await supabase
    .from('categories')
    .select('id, name')
    .eq('parent_id', root.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true })

  return (children ?? []) as { id: number; name: string }[]
}

/**
 * "제품안내" 카테고리 트리의 href를 자동 바인딩.
 * - 루트 "제품안내" → /products
 * - 그 자식들 → /products?category={id}
 * 외부 URL (http로 시작)은 보존, 그 외에는 모두 자동 매핑으로 덮어씀.
 */
export function applyProductCategoryHrefs<T extends Category>(cats: T[]): T[] {
  const root = cats.find(
    (c) => c.parent_id === null && (c.name ?? '').trim() === PRODUCT_ROOT_NAME
  )
  if (!root) return cats
  return cats.map((c) => {
    if (c.id === root.id) {
      if (c.href && c.href.startsWith('http')) return c
      return { ...c, href: '/products' }
    }
    if (c.parent_id !== root.id) return c
    if (c.href && c.href.startsWith('http')) return c
    return { ...c, href: `/products?category=${c.id}` }
  })
}

/**
 * 시공사례 폼의 "연결 제품" 선택지.
 * products 테이블에서 활성화된 제품을 조회하고, 카테고리명으로 그룹화한다.
 */
export async function fetchProductOptions(): Promise<ProductOption[]> {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('id, name, model_name, category_id')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true })

  const rows = (products ?? []) as Array<{
    id: number
    name: string
    model_name: string | null
    category_id: number | null
  }>
  if (rows.length === 0) return []

  const catIds = Array.from(
    new Set(rows.map((p) => p.category_id).filter((v): v is number => v != null))
  )

  let nameByCatId = new Map<number, string>()
  if (catIds.length > 0) {
    const { data: cats } = await supabase
      .from('categories')
      .select('id, name')
      .in('id', catIds)
    nameByCatId = new Map(
      ((cats ?? []) as Array<{ id: number; name: string }>).map((c) => [c.id, c.name])
    )
  }

  return rows.map((p) => ({
    href: `/products/${p.id}`,
    name: p.model_name ? `${p.model_name} ${p.name}` : p.name,
    group: p.category_id ? nameByCatId.get(p.category_id) ?? null : null,
  }))
}
