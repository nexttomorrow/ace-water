import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductForm from '@/components/ProductForm'
import { updateProduct } from '../../actions'
import { fetchProductCategories } from '@/lib/products'
import type { Product } from '@/lib/types'

const fileUrl = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${path}`

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const itemId = Number(id)
  if (!Number.isFinite(itemId)) notFound()

  const supabase = await createClient()
  const { data: item } = await supabase
    .from('products')
    .select('*')
    .eq('id', itemId)
    .single()
  if (!item) notFound()

  const product = item as Product

  const [categories, { data: linkable }] = await Promise.all([
    fetchProductCategories(),
    supabase
      .from('products')
      .select('id, name, model_name')
      .eq('is_active', true)
      .neq('id', itemId)
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true }),
  ])

  const linkableProducts = (linkable ?? []) as {
    id: number
    name: string
    model_name: string | null
  }[]

  const imageUrl = product.main_image_path ? fileUrl(product.main_image_path) : null
  const additional = (product.additional_images ?? []).map((p) => ({
    path: p,
    url: fileUrl(p),
  }))
  const specSheetUrl = product.spec_sheet_path ? fileUrl(product.spec_sheet_path) : null
  const specSheetName = product.spec_sheet_path
    ? product.spec_sheet_path.split('/').pop() ?? null
    : null
  const colorChartUrl = product.color_chart_path ? fileUrl(product.color_chart_path) : null
  const colorChartName = product.color_chart_path
    ? product.color_chart_path.split('/').pop() ?? null
    : null

  const action = updateProduct.bind(null, itemId)

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-1 text-2xl font-bold">제품 수정</h1>
      <p className="mb-6 text-[13px] text-neutral-500">
        {product.model_name ? `${product.model_name} · ` : ''}
        {product.name}
      </p>
      <ProductForm
        action={action}
        categories={categories}
        linkableProducts={linkableProducts}
        initial={product}
        errorMessage={sp.error}
        submitLabel="저장"
        cancelHref="/admin/products"
        imageUrl={imageUrl}
        additional={additional}
        specSheetUrl={specSheetUrl}
        specSheetName={specSheetName}
        colorChartUrl={colorChartUrl}
        colorChartName={colorChartName}
      />
    </div>
  )
}
