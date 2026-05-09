import Link from 'next/link'
import FilterForm from '../FilterForm'
import { fetchProductCategories } from '@/lib/products'
import { createFilter } from '../actions'

export const revalidate = 0

export default async function NewFilterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const sp = await searchParams
  const categories = await fetchProductCategories()

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-12">
      <div className="mb-6">
        <Link
          href="/mng/filters"
          className="text-[0.875rem] text-neutral-500 hover:text-neutral-900"
        >
          ← 필터 목록으로
        </Link>
        <h1 className="mt-2 text-2xl font-bold">필터 추가</h1>
      </div>

      <FilterForm
        action={createFilter}
        errorMessage={sp.error ? decodeURIComponent(sp.error) : undefined}
        categories={categories}
      />
    </div>
  )
}
