import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import FilterForm from '../../FilterForm'
import { updateFilter } from '../../actions'
import { fetchProductCategories } from '@/lib/products'
import type { ProductFilter } from '@/lib/types'

export const revalidate = 0

export default async function EditFilterPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const filterId = Number(id)
  if (!Number.isFinite(filterId)) notFound()

  const sp = await searchParams
  const supabase = await createClient()

  const [categories, { data }] = await Promise.all([
    fetchProductCategories(),
    supabase.from('product_filters').select('*').eq('id', filterId).single(),
  ])
  if (!data) notFound()

  const filter = data as ProductFilter
  const action = updateFilter.bind(null, filterId)

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-12">
      <div className="mb-6">
        <Link
          href="/mng/filters"
          className="text-[0.875rem] text-neutral-500 hover:text-neutral-900"
        >
          ← 필터 목록으로
        </Link>
        <h1 className="mt-2 text-2xl font-bold">필터 수정</h1>
      </div>

      <FilterForm
        action={action}
        errorMessage={sp.error ? decodeURIComponent(sp.error) : undefined}
        categories={categories}
        initial={filter}
      />
    </div>
  )
}
