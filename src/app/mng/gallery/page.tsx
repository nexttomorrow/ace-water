import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { fetchProductCategories } from '@/lib/products'
import GalleryListClient from './GalleryListClient'
import type { GalleryItem } from '@/lib/types'

export const revalidate = 0

export default async function AdminGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; error?: string }>
}) {
  const sp = await searchParams
  const supabase = await createClient()

  const categories = await fetchProductCategories()
  const categoryNameById = Object.fromEntries(
    categories.map((c) => [c.id, c.name])
  ) as Record<number, string>

  const activeCatId = sp.category ? Number(sp.category) : null

  let q = supabase
    .from('gallery_items')
    .select('*')
    .order('created_at', { ascending: false })
  if (activeCatId) q = q.eq('category_id', activeCatId)

  const { data } = await q

  const publicUrl = (path: string) =>
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gallery/${path}`

  const items = ((data ?? []) as GalleryItem[]).map((it) => ({
    id: it.id,
    title: it.title,
    model_name: it.model_name,
    category_id: it.category_id,
    image_url: publicUrl(it.image_path),
    is_active: it.is_active,
  }))

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-12">
      {sp.error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[0.875rem] text-red-700">
          {sp.error}
        </div>
      )}
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">시공사례 관리</h1>
          <p className="mt-1 text-[0.875rem] text-neutral-500">
            <Link href="/construction-cases" target="_blank" className="hover:underline">
              /construction-cases
            </Link>{' '}
            페이지에 노출되는 시공사례를 관리합니다.
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
            href="/mng/gallery/new"
            className="rounded bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            + 시공사례 추가
          </Link>
        </div>
      </div>

      {/* 카테고리 필터 탭 */}
      {categories.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-neutral-200 pb-2">
          <Link
            href="/mng/gallery"
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
                href={`/mng/gallery?category=${c.id}`}
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
          시공사례를 추가해주세요.
        </p>
      ) : (
        <div className="mt-6">
          <GalleryListClient
            items={items}
            categoryNameById={categoryNameById}
          />
        </div>
      )}
    </div>
  )
}
