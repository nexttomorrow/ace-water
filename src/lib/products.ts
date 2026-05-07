import type { ProductOption } from '@/lib/types'
import { createClient } from '@/lib/supabase/server'

/**
 * "제품안내" 최상위 카테고리 이름.
 * categories 테이블에서 name 으로 매칭하여 그 아래 자식들을 제품으로 간주.
 * (관리자가 이 메뉴 이름을 바꾸면 이 상수도 같이 바꿔야 함.)
 */
export const PRODUCT_ROOT_NAME = '제품안내'

/**
 * 시공사례 폼에서 "연결 제품" 선택지를 만드는 목록.
 * "제품안내" 최상위 카테고리의 자식들 중 href 가 있고 활성화된 것만 반환한다.
 * 제품안내 자체가 아직 없거나 자식이 없으면 빈 배열.
 */
export async function fetchProductOptions(): Promise<ProductOption[]> {
  const supabase = await createClient()

  // 1) 제품 루트 카테고리 찾기
  const { data: root } = await supabase
    .from('categories')
    .select('id, name')
    .is('parent_id', null)
    .eq('name', PRODUCT_ROOT_NAME)
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!root) return []

  // 2) 그 자식 카테고리 가져오기
  const { data: children } = await supabase
    .from('categories')
    .select('id, name, href')
    .eq('parent_id', root.id)
    .not('href', 'is', null)
    .neq('href', '#')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true })

  const seen = new Set<string>()
  const products: ProductOption[] = []
  for (const c of (children ?? []) as Array<{
    id: number
    name: string
    href: string | null
  }>) {
    if (!c.href || c.href === '#') continue
    if (seen.has(c.href)) continue
    seen.add(c.href)
    products.push({
      href: c.href,
      name: c.name,
      group: root.name, // 항상 "제품안내"
    })
  }
  return products
}
