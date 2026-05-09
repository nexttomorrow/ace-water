import ProductForm from '@/components/ProductForm'
import { createProduct } from '../actions'
import {
  fetchProductCategories,
  fetchLinkableProductsForPicker,
} from '@/lib/products'
import { fetchAllFilters } from '@/lib/product-filters'

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const sp = await searchParams

  const [categories, linkableProducts, allFilters] = await Promise.all([
    fetchProductCategories(),
    fetchLinkableProductsForPicker(),
    fetchAllFilters(),
  ])

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
        allFilters={allFilters}
        errorMessage={sp.error}
        submitLabel="등록"
        cancelHref="/admin/products"
      />
    </div>
  )
}
