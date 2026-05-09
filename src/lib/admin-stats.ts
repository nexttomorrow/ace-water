import { createClient } from '@/lib/supabase/server'
import { ESTIMATE_STATUS_LABEL, type EstimateStatus } from '@/lib/types'

export type MonthBucket = {
  /** YYYY-MM */
  key: string
  /** "2026.05" */
  label: string
  /** 해당 월 1일 00:00 KST 기준의 ISO (UTC 변환) */
  startIso: string
  endIso: string
}

/**
 * 한국 시간(KST) 기준 월 1일을 ISO(UTC) 로 변환.
 * Supabase timestamptz 비교에 안전하게 쓸 수 있도록 KST 오프셋을 직접 적용.
 */
function kstMonthStart(year: number, month0: number): Date {
  // 'month0' 는 0-base. KST 자정 = UTC 전날 15:00
  return new Date(Date.UTC(year, month0, 1, -9, 0, 0))
}

/**
 * 가장 최근 month 부터 거꾸로 N 개월의 버킷을 반환.
 * 예: months=12, 현재가 2026-05 → [..., 2025-06, 2025-07, ..., 2026-05]
 */
export function buildMonthBuckets(
  months: number,
  reference: Date = new Date()
): MonthBucket[] {
  // KST 기준 현재 연·월 계산
  const kstNow = new Date(reference.getTime() + 9 * 3600 * 1000)
  const baseYear = kstNow.getUTCFullYear()
  const baseMonth0 = kstNow.getUTCMonth()

  const buckets: MonthBucket[] = []
  for (let i = months - 1; i >= 0; i--) {
    // baseMonth0 - i 의 정규화
    const totalMonths = baseYear * 12 + baseMonth0 - i
    const y = Math.floor(totalMonths / 12)
    const m = totalMonths - y * 12
    const start = kstMonthStart(y, m)
    const end = kstMonthStart(y, m + 1)
    const key = `${y}-${String(m + 1).padStart(2, '0')}`
    const label = `${y}.${String(m + 1).padStart(2, '0')}`
    buckets.push({
      key,
      label,
      startIso: start.toISOString(),
      endIso: end.toISOString(),
    })
  }
  return buckets
}

async function countCreatedBetween(
  table: 'estimate_inquiries' | 'gallery_items' | 'products' | 'posts' | 'profiles',
  startIso: string,
  endIso: string,
  filter?: { column: string; value: string }
): Promise<number> {
  const supabase = await createClient()
  let q = supabase
    .from(table)
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startIso)
    .lt('created_at', endIso)
  if (filter) q = q.eq(filter.column, filter.value)
  const { count } = await q
  return count ?? 0
}

export type MetricKey =
  | 'estimates'
  | 'gallery'
  | 'products'
  | 'posts'
  | 'members'

export const METRIC_LABEL: Record<MetricKey, string> = {
  estimates: '견적문의',
  gallery: '시공사례',
  products: '제품',
  posts: '게시글',
  members: '회원',
}

const METRIC_TABLE: Record<
  MetricKey,
  'estimate_inquiries' | 'gallery_items' | 'products' | 'posts' | 'profiles'
> = {
  estimates: 'estimate_inquiries',
  gallery: 'gallery_items',
  products: 'products',
  posts: 'posts',
  members: 'profiles',
}

/**
 * 모든 메트릭에 대해 월별 카운트를 채워서 반환.
 * 반환 형태: { [metricKey]: number[] } — buckets 와 같은 순서.
 */
export async function fetchMonthlyCounts(
  buckets: MonthBucket[]
): Promise<Record<MetricKey, number[]>> {
  const metrics = Object.keys(METRIC_LABEL) as MetricKey[]

  const result = Object.fromEntries(
    metrics.map((m) => [m, [] as number[]])
  ) as Record<MetricKey, number[]>

  // metrics × buckets 만큼의 카운트 호출. 데이터셋이 작으니 병렬로 처리.
  await Promise.all(
    metrics.flatMap((m) =>
      buckets.map(async (b, idx) => {
        const c = await countCreatedBetween(METRIC_TABLE[m], b.startIso, b.endIso)
        result[m][idx] = c
      })
    )
  )

  return result
}

/**
 * 견적문의 status 분포 (전체 누적).
 */
export async function fetchEstimateStatusBreakdown(): Promise<
  { status: EstimateStatus; label: string; count: number }[]
> {
  const supabase = await createClient()
  const statuses: EstimateStatus[] = ['new', 'in_progress', 'done', 'archived']
  const results = await Promise.all(
    statuses.map(async (s) => {
      const { count } = await supabase
        .from('estimate_inquiries')
        .select('*', { count: 'exact', head: true })
        .eq('status', s)
      return {
        status: s,
        label: ESTIMATE_STATUS_LABEL[s],
        count: count ?? 0,
      }
    })
  )
  return results
}

export type KpiSummary = {
  key: MetricKey
  label: string
  current: number
  previous: number
  diff: number
  /** 0~Infinity. previous=0 일 때는 Infinity 또는 null 처리 */
  pct: number | null
  href: string
}

const HREF_BY_METRIC: Record<MetricKey, string> = {
  estimates: '/admin/estimates',
  gallery: '/admin/gallery',
  products: '/admin/products',
  posts: '/admin/board',
  members: '/admin',
}

/**
 * 각 메트릭의 이번달 vs 지난달 비교 KPI.
 */
export async function fetchKpiSummary(
  reference: Date = new Date()
): Promise<KpiSummary[]> {
  const buckets = buildMonthBuckets(2, reference)
  const [prev, cur] = buckets
  const monthly = await fetchMonthlyCounts([prev, cur])

  const metrics = Object.keys(METRIC_LABEL) as MetricKey[]
  return metrics.map((m): KpiSummary => {
    const previous = monthly[m][0] ?? 0
    const current = monthly[m][1] ?? 0
    const diff = current - previous
    const pct = previous === 0 ? null : (diff / previous) * 100
    return {
      key: m,
      label: METRIC_LABEL[m],
      current,
      previous,
      diff,
      pct,
      href: HREF_BY_METRIC[m],
    }
  })
}

/**
 * 단일 월에 대한 모든 메트릭 카운트 + 견적 status 분포 (월별 리포트용).
 */
export async function fetchMonthlyReport(
  monthKey: string // YYYY-MM
) {
  const [yStr, mStr] = monthKey.split('-')
  const y = Number(yStr)
  const m0 = Number(mStr) - 1
  const start = kstMonthStart(y, m0).toISOString()
  const end = kstMonthStart(y, m0 + 1).toISOString()

  const supabase = await createClient()

  const metrics = Object.keys(METRIC_LABEL) as MetricKey[]

  // 메트릭 카운트
  const counts = await Promise.all(
    metrics.map((m) =>
      countCreatedBetween(METRIC_TABLE[m], start, end).then((count) => ({
        key: m,
        label: METRIC_LABEL[m],
        count,
      }))
    )
  )

  // 직전월 카운트 (증감용)
  const prevTotalMonths = y * 12 + m0 - 1
  const py = Math.floor(prevTotalMonths / 12)
  const pm = prevTotalMonths - py * 12
  const prevStart = kstMonthStart(py, pm).toISOString()
  const prevEnd = kstMonthStart(py, pm + 1).toISOString()
  const prevCounts = await Promise.all(
    metrics.map((m) =>
      countCreatedBetween(METRIC_TABLE[m], prevStart, prevEnd)
    )
  )

  const metricRows = counts.map((c, i) => {
    const prev = prevCounts[i] ?? 0
    const diff = c.count - prev
    const pct = prev === 0 ? null : (diff / prev) * 100
    return { ...c, prev, diff, pct }
  })

  // 견적 status 분포 (해당 월 한정)
  const statuses: EstimateStatus[] = ['new', 'in_progress', 'done', 'archived']
  const statusRows = await Promise.all(
    statuses.map(async (s) => {
      const { count } = await supabase
        .from('estimate_inquiries')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', start)
        .lt('created_at', end)
        .eq('status', s)
      return { status: s, label: ESTIMATE_STATUS_LABEL[s], count: count ?? 0 }
    })
  )

  // 해당 월의 견적문의 상세 리스트 (최대 50건)
  const { data: estimates } = await supabase
    .from('estimate_inquiries')
    .select(
      'id, created_at, company_name, client_name, contact_name, phone, model_name, quantity, status'
    )
    .gte('created_at', start)
    .lt('created_at', end)
    .order('created_at', { ascending: false })
    .limit(50)

  return {
    monthKey,
    monthLabel: `${y}.${String(m0 + 1).padStart(2, '0')}`,
    startIso: start,
    endIso: end,
    metrics: metricRows,
    statuses: statusRows,
    estimates: (estimates ?? []) as Array<{
      id: number
      created_at: string
      company_name: string | null
      client_name: string
      contact_name: string
      phone: string
      model_name: string
      quantity: string
      status: EstimateStatus
    }>,
  }
}
