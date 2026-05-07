import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { deleteGalleryItem } from '../actions'
import type { GalleryItem, ConstructionCaseCategory } from '@/lib/types'

export const revalidate = 0

export default async function AdminGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const sp = await searchParams
  const supabase = await createClient()

  const { data: catData } = await supabase
    .from('construction_case_categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true })
  const categories = (catData ?? []) as ConstructionCaseCategory[]

  const activeCatId = sp.category ? Number(sp.category) : null

  let q = supabase
    .from('gallery_items')
    .select('*, construction_case_categories(name)')
    .order('created_at', { ascending: false })
  if (activeCatId) q = q.eq('category_id', activeCatId)

  const { data } = await q
  type Row = GalleryItem & {
    construction_case_categories: { name: string } | null
  }
  const items = (data ?? []) as Row[]

  const publicUrl = (path: string) =>
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gallery/${path}`

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-12">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">시공사례 관리</h1>
          <p className="mt-1 text-[13px] text-neutral-500">
            <Link href="/construction-cases" target="_blank" className="hover:underline">
              /construction-cases
            </Link>{' '}
            페이지에 노출되는 시공사례를 관리합니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/gallery/categories"
            className="rounded border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
          >
            카테고리 관리
          </Link>
          <Link
            href="/admin/gallery/new"
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
            href="/admin/gallery"
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
                href={`/admin/gallery?category=${c.id}`}
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
          시공사례를 추가해주세요.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item) => {
            const handleDelete = deleteGalleryItem.bind(null, item.id)
            const cat = item.construction_case_categories?.name
            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-lg border border-neutral-200 bg-white"
              >
                <div className="aspect-square">
                  <Image
                    src={publicUrl(item.image_path)}
                    alt={item.title}
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
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  {item.model_name && (
                    <p className="truncate text-[11px] text-neutral-500">
                      {item.model_name}
                    </p>
                  )}
                  <div className="mt-2 flex gap-2">
                    <Link
                      href={`/admin/gallery/${item.id}/edit`}
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
