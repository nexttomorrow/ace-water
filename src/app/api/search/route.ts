import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  SEARCH_TYPE_ORDER,
  SEARCH_MIN_LENGTH,
  SEARCH_PERIOD_DAYS,
  type SearchResult,
  type SearchType,
  type SortField,
  type SortDir,
  type SearchPeriod,
} from '@/lib/search'

/**
 * 통합검색 API — 제품/시공사례/공지사항/자료실/게시판을 한 번에 검색.
 *
 * 쿼리:
 *   q       검색어 (2글자 이상)
 *   type    all|product|case|notice|resource|post — 특정 유형이면 많이, 전체면 유형별로 조금씩
 *   sort    relevance|date|name (기본 relevance)
 *   dir     asc|desc (기본 desc) — date/name 정렬에 적용
 *   period  all|1w|1m|3m|1y (기본 all) — 등록일 기준 기간 필터
 *
 * counts 는 항상 모든 유형의 총 매칭 수(기간 필터 반영)를 head count 로 반환.
 */

const PER_TYPE_ALL = 6
const PER_TYPE_ONE = 30

type Supa = Awaited<ReturnType<typeof createClient>>

const storageUrl = (bucket: string, path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`

/** PostgREST or() 문자열/ilike 패턴을 깨는 문자 제거 */
function sanitize(raw: string): string {
  return raw.replace(/[%,()*]/g, ' ').replace(/\s+/g, ' ').trim()
}

/** 유형별 검색 대상 컬럼 (or ilike 에 사용) */
const OR_COLUMNS: Record<SearchType, string[]> = {
  product: ['name', 'model_name', 'description'],
  case: ['title', 'description', 'site_name', 'model_name', 'client_name'],
  notice: ['title', 'content'],
  resource: ['title', 'content'],
  post: ['title', 'content'],
}

const TABLE: Record<SearchType, string> = {
  product: 'products',
  case: 'gallery_items',
  notice: 'notices',
  resource: 'resources',
  post: 'posts',
}

/** is_active 컬럼이 있는(공개 노출 제어) 테이블 */
const HAS_ACTIVE: Record<SearchType, boolean> = {
  product: true,
  case: true,
  notice: false,
  resource: false,
  post: false,
}

/** 이름 정렬 시 사용할 컬럼 */
const NAME_COLUMN: Record<SearchType, string> = {
  product: 'name',
  case: 'title',
  notice: 'title',
  resource: 'title',
  post: 'title',
}

function orFilter(type: SearchType, like: string): string {
  return OR_COLUMNS[type].map((c) => `${c}.ilike.${like}`).join(',')
}

/** 기간값 → 기준 ISO. 'all' 이면 null */
function cutoffISO(period: SearchPeriod): string | null {
  if (period === 'all') return null
  const days = SEARCH_PERIOD_DAYS[period]
  return new Date(Date.now() - days * 86400000).toISOString()
}

type Row = Record<string, unknown>
const str = (v: unknown): string => (typeof v === 'string' ? v : '')

type SearchOpts = { sort: SortField; dir: SortDir; cutoff: string | null }

async function fetchResults(
  supabase: Supa,
  type: SearchType,
  like: string,
  limit: number,
  opts: SearchOpts
): Promise<SearchResult[]> {
  const asc = opts.dir === 'asc'
  const selectCols =
    type === 'product'
      ? 'id, name, model_name, main_image_path'
      : type === 'case'
        ? 'id, title, site_name, model_name, image_path'
        : 'id, title'

  // 필터(검색어 + is_active + 기간)
  const base = supabase.from(TABLE[type]).select(selectCols).or(orFilter(type, like))
  const active = HAS_ACTIVE[type] ? base.eq('is_active', true) : base
  const filtered = opts.cutoff ? active.gte('created_at', opts.cutoff) : active

  // 정렬
  const ordered =
    opts.sort === 'date'
      ? filtered.order('created_at', { ascending: asc })
      : opts.sort === 'name'
        ? filtered.order(NAME_COLUMN[type], { ascending: asc })
        : type === 'product'
          ? filtered.order('sort_order', { ascending: true }).order('created_at', { ascending: false })
          : filtered.order('created_at', { ascending: false })

  const { data } = await ordered.limit(limit)
  // select 문자열이 동적이라 PostgREST 타입 추론이 안 되므로 unknown 경유 캐스트
  const rows = (data ?? []) as unknown as Row[]

  switch (type) {
    case 'product':
      return rows.map((r) => ({
        type,
        id: r.id as number,
        title: str(r.name),
        subtitle: str(r.model_name) || null,
        href: `/products/${r.id}`,
        imageUrl: r.main_image_path ? storageUrl('products', str(r.main_image_path)) : null,
      }))
    case 'case':
      return rows.map((r) => ({
        type,
        id: r.id as number,
        title: str(r.title),
        subtitle: str(r.site_name) || str(r.model_name) || null,
        href: `/construction-cases/${r.id}`,
        imageUrl: r.image_path ? storageUrl('gallery', str(r.image_path)) : null,
      }))
    default: {
      const hrefBase = type === 'notice' ? '/notices' : type === 'resource' ? '/resources' : '/board'
      return rows.map((r) => ({
        type,
        id: r.id as number,
        title: str(r.title),
        href: `${hrefBase}/${r.id}`,
      }))
    }
  }
}

async function fetchCount(
  supabase: Supa,
  type: SearchType,
  like: string,
  cutoff: string | null
): Promise<number> {
  const base = supabase
    .from(TABLE[type])
    .select('id', { count: 'exact', head: true })
    .or(orFilter(type, like))
  const active = HAS_ACTIVE[type] ? base.eq('is_active', true) : base
  const { count } = await (cutoff ? active.gte('created_at', cutoff) : active)
  return count ?? 0
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = sanitize(searchParams.get('q') ?? '')
  const typeParam = searchParams.get('type')
  const sortParam = searchParams.get('sort')
  const dirParam = searchParams.get('dir')
  const periodParam = searchParams.get('period')

  if (q.length < SEARCH_MIN_LENGTH) {
    return NextResponse.json({ q, results: [], counts: {} })
  }

  const supabase = await createClient()
  const like = `%${q}%`

  const activeType =
    typeParam && (SEARCH_TYPE_ORDER as string[]).includes(typeParam)
      ? (typeParam as SearchType)
      : null
  const sort: SortField =
    sortParam === 'date' || sortParam === 'name' ? sortParam : 'relevance'
  const dir: SortDir = dirParam === 'asc' ? 'asc' : 'desc'
  const period: SearchPeriod = (['1w', '1m', '3m', '1y'] as const).includes(
    periodParam as never
  )
    ? (periodParam as SearchPeriod)
    : 'all'
  const cutoff = cutoffISO(period)

  const typesToFetch = activeType ? [activeType] : SEARCH_TYPE_ORDER
  const perType = activeType ? PER_TYPE_ONE : PER_TYPE_ALL

  // 결과(선택 유형) + 카운트(모든 유형) 병렬
  const [resultGroups, countPairs] = await Promise.all([
    Promise.all(
      typesToFetch.map((t) => fetchResults(supabase, t, like, perType, { sort, dir, cutoff }))
    ),
    Promise.all(
      SEARCH_TYPE_ORDER.map(async (t) => [t, await fetchCount(supabase, t, like, cutoff)] as const)
    ),
  ])

  const results = resultGroups.flat()
  const counts: Partial<Record<SearchType, number>> = {}
  for (const [t, c] of countPairs) counts[t] = c

  return NextResponse.json({ q, results, counts })
}
