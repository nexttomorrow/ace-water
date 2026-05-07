import { createClient } from '@/lib/supabase/server'
import CaseForm from '@/components/CaseForm'
import { createGalleryItem } from '../../actions'
import { fetchProductOptions } from '@/lib/products'
import type { ConstructionCaseCategory } from '@/lib/types'

export default async function NewGalleryItemPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const sp = await searchParams
  const supabase = await createClient()
  const [{ data }, products] = await Promise.all([
    supabase
      .from('construction_case_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true }),
    fetchProductOptions(),
  ])
  const categories = (data ?? []) as ConstructionCaseCategory[]

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-1 text-2xl font-bold">시공사례 추가</h1>
      <p className="mb-6 text-[13px] text-neutral-500">
        대표 이미지는 필수, 나머지 정보는 가능한 만큼 채워주세요.
      </p>
      <CaseForm
        action={createGalleryItem}
        categories={categories}
        products={products}
        errorMessage={sp.error}
        submitLabel="등록"
        cancelHref="/admin/gallery"
      />
    </div>
  )
}
