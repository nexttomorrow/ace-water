import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { fetchProductCategories } from '@/lib/products'
import { deleteProduct } from './actions'
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
  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]))

  const activeCatId = sp.category ? Number(sp.category) : null

  let q = supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('id', { ascending: false })
  if (activeCatId) q = q.eq('category_id', activeCatId)

  const { data } = await q
  const items = (data ?? []) as Product[]

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-12">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">제품 관리</h1>
          <p className="mt-1 text-[13px] text-neutral-500">
            <Link href="/products" target="_blank" className="hover:underline">
              /products
            </Link>{' '}
            상세 페이지에 노출되는 제품을 관리합니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/categories"
            className="rounded border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
          >
            제품안내 메뉴 관리
          </Link>
          <Link
            href="/admin/products/new"
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
            href="/admin/products"
            className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
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
                href={`/admin/products?category=${c.id}`}
                className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
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
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item) => {
            const handleDelete = deleteProduct.bind(null, item.id)
            const cat = item.category_id ? categoryNameById.get(item.category_id) : null
            return (
              <div
                key={item.id}
                className={`overflow-hidden rounded-lg border bg-white ${
                  item.is_active ? 'border-neutral-200' : 'border-dashed border-neutral-300 opacity-70'
                }`}
              >
                <div className="aspect-square">
                  <Image
                    src={fileUrl(item.main_image_path)}
                    alt={item.name}
                    width={400}
                    height={400}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                </div>
                <div className="px-3 py-2">
                  {cat && (
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                      {cat}
                    </p>
                  )}
                  {item.model_name && (
                    <p className="truncate text-[11px] font-bold text-neutral-900">
                      {item.model_name}
                    </p>
                  )}
                  <p className="truncate text-sm text-neutral-700">{item.name}</p>
                  {!item.is_active && (
                    <p className="mt-1 text-[10px] font-semibold text-neutral-400">비공개</p>
                  )}
                  <div className="mt-2 flex gap-2">
                    <Link
                      href={`/admin/products/${item.id}/edit`}
                      className="flex-1 rounded border border-neutral-300 px-2 py-1 text-center text-xs hover:bg-neutral-100"
                    >
                      수정
                    </Link>
                    <form action={handleDelete} className="flex-1">
                      <button
                        type="submit"
                        className="w-full rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                      >
                        삭제
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
