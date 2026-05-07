import { createClient } from '@/lib/supabase/server'
import ProductForm from '@/components/ProductForm'
import { createProduct } from '../actions'
import { fetchProductCategories } from '@/lib/products'

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const sp = await searchParams
  const supabase = await createClient()

  const [categories, { data: linkable }] = await Promise.all([
    fetchProductCategories(),
    supabase
      .from('products')
      .select('id, name, model_name')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true }),
  ])

  const linkableProducts = (linkable ?? []) as {
    id: number
    name: string
    model_name: string | null
  }[]

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-1 text-2xl font-bold">제품 추가</h1>
      <p className="mb-6 text-[13px] text-neutral-500">
        대표 이미지와 제품명은 필수입니다. 나머지 정보는 가능한 만큼 채워주세요.
      </p>
      <ProductForm
        action={createProduct}
        categories={categories}
        linkableProducts={linkableProducts}
        errorMessage={sp.error}
        submitLabel="등록"
        cancelHref="/admin/products"
      />
    </div>
  )
}
