import { createClient } from '@/lib/supabase/server'
import { fetchProductCategories } from '@/lib/products'

export type EstimateProductOption = {
  id: number
  name: string
  modelName: string | null
  /** 카드에 함께 보일 라벨 — "모델명 제품명" 또는 "제품명" */
  label: string
  /** 모델명 입력에 채워질 토큰 — 모델명 우선, 없으면 제품명 */
  fillToken: string
  categoryId: number | null
  categoryName: string | null
  /** 모달에 표시할 썸네일 (제품 메인 이미지) */
  imageUrl: string | null
}

/**
 * 견적 폼의 "제품명" 모달에서 사용하는 데이터.
 * 등록된 활성 제품 + 제품안내 하위 카테고리를 함께 반환.
 */
export async function fetchEstimateProductPicker() {
  const supabase = await createClient()

  const [categories, { data: products }] = await Promise.all([
    fetchProductCategories(),
    supabase
      .from('products')
      .select(
        'id, name, model_name, category_id, main_image_path, sort_order, created_at'
      )
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false }),
  ])

  const catNameById = new Map(categories.map((c) => [c.id, c.name]))

  const productImageUrl = (path: string | null) =>
    path
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${path}`
      : null

  const options: EstimateProductOption[] = (
    (products ?? []) as Array<{
      id: number
      name: string
      model_name: string | null
      category_id: number | null
      main_image_path: string | null
    }>
  ).map((p) => {
    // 제품 상세 → 견적문의 prefill 과 동일한 포맷: "모델명 제품명"
    const fullToken = p.model_name ? `${p.model_name} ${p.name}` : p.name
    return {
      id: p.id,
      name: p.name,
      modelName: p.model_name,
      label: fullToken,
      fillToken: fullToken,
      categoryId: p.category_id,
      categoryName: p.category_id ? catNameById.get(p.category_id) ?? null : null,
      imageUrl: productImageUrl(p.main_image_path),
    }
  })

  return { categories, options }
}
