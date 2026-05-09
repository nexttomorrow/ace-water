import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { fetchProductCategories } from '@/lib/products'
import ProductsListClient from './ProductsListClient'
import type { Product } from '@/lib/types'

export const revalidate = 0

const fileUrl = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${path}`

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const sp = await searchParams
  const supabase = await createClient()

  const categories = await fetchProductCategories()
  const categoryNameById = Object.fromEntries(
    categories.map((c) => [c.id, c.name])
  ) as Record<number, string>

  const activeCatId = sp.category ? Number(sp.category) : null

  let q = supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('id', { ascending: false })
  if (activeCatId) q = q.eq('category_id', activeCatId)

  const { data } = await q
  const items = ((data ?? []) as Product[]).map((p) => ({
    id: p.id,
    name: p.name,
    model_name: p.model_name,
    category_id: p.category_id,
    main_image_url: fileUrl(p.main_image_path),
    is_active: p.is_active,
  }))

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-12">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">제품 관리</h1>
          <p className="mt-1 text-[0.875rem] text-neutral-500">
            <Link href="/products" target="_blank" className="hover:underline">
              /products
            </Link>{' '}
            상세 페이지에 노출되는 제품을 관리합니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/mng/categories"
            className="rounded border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
          >
            제품안내 메뉴 관리
          </Link>
          <Link
            href="/mng/products/new"
            className="rounded bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            + 제품 추가
          </Link>
        </div>
      </div>

      {/* 카테고리 필터 */}
      {categories.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-neutral-200 pb-2">
          <Link
            href="/mng/products"
            className={`rounded-full px-3 py-1.5 text-[0.75rem] font-medium transition ${
              !activeCatId
                ? 'bg-neutral-900 text-white'
                : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            전체
          </Link>
          {categories.map((c) => {
            const active = activeCatId === c.id
            return (
              <Link
                key={c.id}
                href={`/mng/products?category=${c.id}`}
                className={`rounded-full px-3 py-1.5 text-[0.75rem] font-medium transition ${
                  active
                    ? 'bg-neutral-900 text-white'
                    : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {c.name}
              </Link>
            )
          })}
        </div>
      )}

      {items.length === 0 ? (
        <p className="mt-6 rounded border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          제품을 추가해주세요.
        </p>
      ) : (
        <div className="mt-6">
          <ProductsListClient
            items={items}
            categoryNameById={categoryNameById}
          />
        </div>
      )}
    </div>
  )
}
