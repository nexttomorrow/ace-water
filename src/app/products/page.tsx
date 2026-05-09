import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { fetchProductCategories } from '@/lib/products'
import { fetchVisibleFiltersForCategory } from '@/lib/product-filters'
import SubPageBanner from '@/components/SubPageBanner'
import ProductCarouselCard, {
  type CarouselCardItem,
} from '@/components/ProductCarouselCard'
import ProductFilterBar from '@/components/products/ProductFilterBar'
import type { Product, ProductColor, ProductFilter } from '@/lib/types'

export const revalidate = 0

const PAGE_SIZE = 20 // 4 cols × 5 rows
const FILTER_PARAM_PREFIX = 'f_'

const fileUrl = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${path}`

type ListItem = Pick<
  Product,
  | 'id'
  | 'name'
  | 'model_name'
  | 'category_id'
  | 'main_image_path'
  | 'additional_images'
  | 'tags'
  | 'colors'
  | 'components'
  | 'filter_values'
>

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const supabase = await createClient()

  const categories = await fetchProductCategories()
  const categoryRaw = typeof sp.category === 'string' ? sp.category : undefined
  const activeCatId =
    categoryRaw && categoryRaw !== 'all' ? Number(categoryRaw) : null
  const pageRaw = typeof sp.page === 'string' ? sp.page : undefined
  const requestedPage = Math.max(1, Number(pageRaw) || 1)

  // 활성 필터 정의 + 적용된 값 파싱
  const rawFilters = await fetchVisibleFiltersForCategory(activeCatId)

  // 'color' 필터의 옵션은 자동 합성 — 활성 제품의 colors 에서 unique 추출
  const filters = await injectColorOptions(supabase, rawFilters, activeCatId)

  const appliedFilters: Record<string, string[]> = {}
  for (const f of filters) {
    const raw = sp[`${FILTER_PARAM_PREFIX}${f.key}`]
    const text = Array.isArray(raw) ? raw.join(',') : raw
    if (!text) continue
    const vals = text.split(',').map((s) => s.trim()).filter(Boolean)
    if (vals.length > 0) appliedFilters[f.key] = vals
  }
  const hasFilterApplied = Object.keys(appliedFilters).length > 0

  // 1단계: SQL 조건 (카테고리 + 활성)
  // 필터값 매칭은 jsonb 안에서 OR 조건이 까다로워, 일단 카테고리/활성 조건으로 후보를 가져온 뒤 JS 에서 매칭.
  const baseSelect = supabase
    .from('products')
    .select(
      'id, name, model_name, category_id, main_image_path, additional_images, tags, colors, components, filter_values',
      { count: hasFilterApplied ? undefined : 'exact' }
    )
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('id', { ascending: false })

  let q = baseSelect
  if (activeCatId) q = q.eq('category_id', activeCatId)

  const fromIdx = (requestedPage - 1) * PAGE_SIZE
  const toIdx = fromIdx + PAGE_SIZE - 1

  let items: ListItem[] = []
  let total = 0

  if (!hasFilterApplied) {
    q = q.range(fromIdx, toIdx)
    const { data, count } = await q
    items = (data ?? []) as ListItem[]
    total = count ?? 0
  } else {
    // 필터가 적용된 경우: 모두 가져온 뒤 필터링 후 총 개수 계산 + 페이지 슬라이스
    const { data } = await q
    const all = (data ?? []) as ListItem[]
    const matched = all.filter((p) => matchesAllFilters(p, appliedFilters))
    total = matched.length
    items = matched.slice(fromIdx, toIdx + 1)
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(requestedPage, totalPages)

  const activeCat = activeCatId
    ? categories.find((c) => c.id === activeCatId) ?? null
    : null

  const bannerHref = activeCatId ? `/products?category=${activeCatId}` : '/products'

  // ListItem → CarouselCardItem 변환 (메인 + 추가 이미지 합침)
  const cardItems: CarouselCardItem[] = items.map((p) => ({
    id: p.id,
    name: p.name,
    modelName: p.model_name,
    images: [fileUrl(p.main_image_path), ...(p.additional_images ?? []).map(fileUrl)],
    tags: p.tags ?? [],
    colors: p.colors ?? [],
    componentNames: (p.components ?? [])
      .map((c) => c.name)
      .filter((n) => !!n && n.trim().length > 0),
  }))

  // 페이지네이션 URL 생성기 — 현재 적용된 필터를 보존
  const buildHref = (page: number) => {
    const params = new URLSearchParams()
    if (activeCatId) params.set('category', String(activeCatId))
    for (const [k, vals] of Object.entries(appliedFilters)) {
      if (vals.length > 0) params.set(`${FILTER_PARAM_PREFIX}${k}`, vals.join(','))
    }
    if (page > 1) params.set('page', String(page))
    const qs = params.toString()
    return qs ? `/products?${qs}` : '/products'
  }

  return (
    <>
      <SubPageBanner
        href={bannerHref}
        fallbackTitle="제품안내"
        fallbackSubtitle="ACEWATER의 제품 라인업을 만나보세요"
      />

      <div className="mx-auto max-w-[1440px] px-6 py-12">
        {/* 카테고리 필터 칩 — SubPageBanner 의 SubmenuTabs 와 중복이므로 숨김 */}

        {/* 핀 드롭다운 필터 바 (어드민 product_filters 정의 기반) */}
        <ProductFilterBar
          filters={filters}
          totalCount={total}
          activeCategoryId={activeCatId}
        />

        <div className="mt-6 mb-6 flex items-center justify-between">
          <p className="text-[0.875rem] text-neutral-500">
            {activeCat ? (
              <>
                <span className="font-semibold text-neutral-900">{activeCat.name}</span>
                {' · '}
              </>
            ) : null}
            총 <span className="font-semibold text-neutral-900">{total}</span>개의 제품
            {totalPages > 1 && (
              <>
                {' · '}
                {currentPage} / {totalPages} 페이지
              </>
            )}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-neutral-300 p-12 text-center text-neutral-500">
            <svg
              className="mx-auto mb-3 h-10 w-10 text-neutral-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
            <p className="text-[0.875rem]">등록된 제품이 없습니다.</p>
          </div>
        ) : (
          <>
            {/* 4 × 5 그리드 = 한 페이지 20개 */}
            <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 md:grid-cols-4">
              {cardItems.map((p) => (
                <ProductCarouselCard key={p.id} item={p} />
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

/**
 * 'color' 필터를 발견하면 옵션을 활성 제품들의 색상에서 자동으로 합성.
 * 카테고리가 선택된 경우 해당 카테고리 + 글로벌 색상으로 한정.
 * 제품에 색상이 등록되지 않았다면 색상 필터 자체를 빼서 노출하지 않음.
 */
async function injectColorOptions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  filters: ProductFilter[],
  activeCatId: number | null
): Promise<ProductFilter[]> {
  const idx = filters.findIndex((f) => f.key === 'color')
  if (idx < 0) return filters

  let q = supabase
    .from('products')
    .select('colors')
    .eq('is_active', true)
  if (activeCatId) q = q.eq('category_id', activeCatId)

  const { data } = await q
  const rows = (data ?? []) as { colors: ProductColor[] | null }[]

  const byName = new Map<string, string>() // name → hex (먼저 발견된 hex 사용)
  for (const r of rows) {
    for (const c of r.colors ?? []) {
      const name = c?.name?.trim()
      const hex = c?.hex?.trim()
      if (!name || !hex) continue
      if (!byName.has(name)) byName.set(name, hex)
    }
  }

  const options = Array.from(byName.entries())
    .map(([name, hex]) => ({ value: name, label: name, hex }))
    .sort((a, b) => a.label.localeCompare(b.label, 'ko'))

  if (options.length === 0) {
    // 색상 정보가 등록된 제품이 없으면 색상 필터 자체를 노출하지 않음
    return filters.filter((_, i) => i !== idx)
  }

  return filters.map((f, i) => (i === idx ? { ...f, options } : f))
}

/**
 * 제품이 모든 활성 필터 조건을 만족하는지 검사.
 * 각 필터 키 별로 OR (여러 옵션 중 하나라도 일치),
 * 필터 키 끼리는 AND (모든 키가 매칭되어야 함).
 */
function matchesAllFilters(
  p: ListItem,
  applied: Record<string, string[]>
): boolean {
  const fv = (p.filter_values ?? {}) as Record<string, unknown>
  for (const [key, wanted] of Object.entries(applied)) {
    const have = fv[key]
    const haveArr = Array.isArray(have) ? have.map(String) : []
    const ok = wanted.some((v) => haveArr.includes(v))
    if (!ok) return false
  }
  return true
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
  const pages = Array.from({ length: end - adjustedStart + 1 }, (_, i) => adjustedStart + i)

  const baseLayout =
    'inline-flex h-9 min-w-9 items-center justify-center rounded border px-3 text-sm transition'
  const inactive = 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100'
  const active = 'border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800'
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
