import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import SubPageBanner from '@/components/SubPageBanner'
import { fetchProductCategories } from '@/lib/products'
import type { GalleryItem } from '@/lib/types'

export const revalidate = 0

const itemUrl = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gallery/${path}`

export default async function ConstructionCasesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const sp = await searchParams
  const supabase = await createClient()

  const categories = await fetchProductCategories()

  // category param: id or 'all'
  const activeCatId =
    sp.category && sp.category !== 'all' ? Number(sp.category) : null

  let q = supabase
    .from('gallery_items')
    .select('*')
    .order('created_at', { ascending: false })
  if (activeCatId) q = q.eq('category_id', activeCatId)

  const { data, error } = await q
  const items = (data ?? []) as GalleryItem[]

  const activeCat = activeCatId
    ? categories.find((c) => c.id === activeCatId) ?? null
    : null

  return (
    <>
      <SubPageBanner
        href="/construction-cases"
        fallbackTitle="시공사례"
        fallbackSubtitle="ACEWATER가 진행한 시공 프로젝트를 소개합니다"
      />

      <div className="mx-auto max-w-[1440px] px-6 py-12">
        {/* 카테고리 탭 */}
        {categories.length > 0 && (
          <div className="-mt-2 mb-8 flex flex-wrap items-center gap-2 border-b border-neutral-200 pb-3">
            <CategoryPill
              href="/construction-cases"
              active={!activeCatId}
              label="전체"
            />
            {categories.map((c) => (
              <CategoryPill
                key={c.id}
                href={`/construction-cases?category=${c.id}`}
                active={activeCatId === c.id}
                label={c.name}
              />
            ))}
          </div>
        )}

        <div className="mb-5 flex items-center justify-between">
          <p className="text-[13px] text-neutral-500">
            {activeCat ? (
              <>
                <span className="font-semibold text-neutral-900">{activeCat.name}</span>
                {' · '}
              </>
            ) : null}
            총 <span className="font-semibold text-neutral-900">{items.length}</span>개의
            시공사례
          </p>
        </div>

        {error && (
          <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
            {error.message}
          </p>
        )}

        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 p-12 text-center text-neutral-500">
            아직 등록된 시공사례가 없습니다.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/construction-cases/${item.id}`}
                className="group block"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-neutral-100">
                  <Image
                    src={itemUrl(item.image_path)}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    unoptimized
                    sizes="(min-width: 768px) 25vw, 50vw"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent opacity-0 transition group-hover:opacity-100" />
                </div>
                <div className="mt-4">
                  <p className="truncate text-[15px] font-semibold text-neutral-900 transition group-hover:text-blue-700">
                    {item.title}
                  </p>
                  {item.site_name && (
                    <p className="mt-1 truncate text-[12px] text-neutral-500">
                      {item.site_name}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function CategoryPill({
  href,
  active,
  label,
}: {
  href: string
  active: boolean
  label: string
}) {
  return (
    <Link
      href={href}
      className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
        active
          ? 'bg-neutral-900 text-white'
          : 'border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:text-neutral-900'
      }`}
    >
      {label}
    </Link>
  )
}
