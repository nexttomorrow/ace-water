import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import SubPageBanner from '@/components/SubPageBanner'
import { fetchProductCategories } from '@/lib/products'
import type { GalleryItem } from '@/lib/types'

export const revalidate = 0

const PAGE_SIZE = 20 // 4 cols × 5 rows — 제품안내와 동일

const itemUrl = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gallery/${path}`

export default async function ConstructionCasesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>
}) {
  const sp = await searchParams
  const supabase = await createClient()

  const categories = await fetchProductCategories()

  const activeCatId =
    sp.category && sp.category !== 'all' ? Number(sp.category) : null
  const requestedPage = Math.max(1, Number(sp.page) || 1)

  let q = supabase
    .from('gallery_items')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  if (activeCatId) q = q.eq('category_id', activeCatId)

  const fromIdx = (requestedPage - 1) * PAGE_SIZE
  const toIdx = fromIdx + PAGE_SIZE - 1
  q = q.range(fromIdx, toIdx)

  const { data, error, count } = await q
  const items = (data ?? []) as GalleryItem[]
  const total = count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(requestedPage, totalPages)

  const activeCat = activeCatId
    ? categories.find((c) => c.id === activeCatId) ?? null
    : null

  // 페이지네이션 URL 생성기 — 카테고리 보존
  const buildHref = (page: number) => {
    const params = new URLSearchParams()
    if (activeCatId) params.set('category', String(activeCatId))
    if (page > 1) params.set('page', String(page))
    const qs = params.toString()
    return qs ? `/construction-cases?${qs}` : '/construction-cases'
  }

  return (
    <>
      <SubPageBanner
        href="/construction-cases"
        fallbackTitle="시공사례"
        fallbackSubtitle=""
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
          <p className="text-[0.875rem] text-neutral-500">
            {activeCat ? (
              <>
                <span className="font-semibold text-neutral-900">
                  {activeCat.name}
                </span>
                {' · '}
              </>
            ) : null}
            총 <span className="font-semibold text-neutral-900">{total}</span>개의
            시공사례
            {totalPages > 1 && (
              <>
                {' · '}
                {currentPage} / {totalPages} 페이지
              </>
            )}
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
          <>
            {/* 4 × 5 그리드 = 한 페이지 20개 */}
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
                    <p className="truncate text-[1rem] font-semibold text-neutral-900 transition group-hover:text-blue-700">
                      {item.title}
                    </p>
                    {item.site_name && (
                      <p className="mt-1 truncate text-[0.75rem] text-neutral-500">
                        {item.site_name}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                buildHref={buildHref}
              />
            )}
          </>
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
      className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[0.875rem] font-medium transition ${
        active
          ? 'bg-neutral-900 text-white'
          : 'border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:text-neutral-900'
      }`}
    >
      {label}
    </Link>
  )
}

function Pagination({
  currentPage,
  totalPages,
  buildHref,
}: {
  currentPage: number
  totalPages: number
  buildHref: (page: number) => string
}) {
  const windowSize = 5
  const start = Math.max(1, currentPage - Math.floor(windowSize / 2))
  const end = Math.min(totalPages, start + windowSize - 1)
  const adjustedStart = Math.max(1, end - windowSize + 1)
  const pages = Array.from(
    { length: end - adjustedStart + 1 },
    (_, i) => adjustedStart + i
  )

  const baseLayout =
    'inline-flex h-9 min-w-9 items-center justify-center rounded border px-3 text-sm transition'
  const inactive =
    'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100'
  const active =
    'border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800'
  const disabled = 'pointer-events-none opacity-40'

  return (
    <nav className="mt-12 flex items-center justify-center gap-1">
      <Link
        href={buildHref(Math.max(1, currentPage - 1))}
        className={`${baseLayout} ${inactive} ${currentPage === 1 ? disabled : ''}`}
        aria-label="이전 페이지"
      >
        ‹
      </Link>
      {pages.map((p) => (
        <Link
          key={p}
          href={buildHref(p)}
          className={`${baseLayout} ${p === currentPage ? active : inactive}`}
          aria-current={p === currentPage ? 'page' : undefined}
        >
          {p}
        </Link>
      ))}
      <Link
        href={buildHref(Math.min(totalPages, currentPage + 1))}
        className={`${baseLayout} ${inactive} ${currentPage === totalPages ? disabled : ''}`}
        aria-label="다음 페이지"
      >
        ›
      </Link>
    </nav>
  )
}
