import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductForm from '@/components/ProductForm'
import { updateProduct } from '../../actions'
import {
  fetchProductCategories,
  fetchLinkableProductsForPicker,
} from '@/lib/products'
import { fetchAllFilters } from '@/lib/product-filters'
import type { Product, GalleryItem } from '@/lib/types'

const fileUrl = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${path}`

const galleryUrl = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gallery/${path}`

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
  const productHref = `/products/${itemId}`

  const [categories, linkableProducts, { data: allCasesData }, allFilters] =
    await Promise.all([
      fetchProductCategories(),
      fetchLinkableProductsForPicker(itemId),
      // 시공사례 멀티셀렉트 후보 — 전체
      supabase
        .from('gallery_items')
        .select('id, title, image_path, site_name, model_name, product_hrefs, created_at')
        .order('created_at', { ascending: false }),
      fetchAllFilters(),
    ])

  const allCases = (allCasesData ?? []) as Pick<
    GalleryItem,
    'id' | 'title' | 'image_path' | 'site_name' | 'model_name' | 'product_hrefs' | 'created_at'
  >[]

  const initialSelectedCaseIds = allCases
    .filter((c) => (c.product_hrefs ?? []).includes(productHref))
    .map((c) => c.id)

  const caseOptions = allCases.map((c) => ({
    id: c.id,
    title: c.title,
    imageUrl: galleryUrl(c.image_path),
    modelName: c.model_name,
    siteName: c.site_name,
  }))

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
      <p className="mb-6 text-[0.875rem] text-neutral-500">
        {product.model_name ? `${product.model_name} · ` : ''}
        {product.name}
      </p>
      <ProductForm
        action={action}
        categories={categories}
        linkableProducts={linkableProducts}
        allFilters={allFilters}
        initial={product}
        errorMessage={sp.error}
        submitLabel="저장"
        cancelHref="/mng/products"
        imageUrl={imageUrl}
        additional={additional}
        specSheetUrl={specSheetUrl}
        specSheetName={specSheetName}
        colorChartUrl={colorChartUrl}
        colorChartName={colorChartName}
        productId={itemId}
        cases={caseOptions}
        initialSelectedCaseIds={initialSelectedCaseIds}
      />
    </div>
  )
}
