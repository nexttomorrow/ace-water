import Link from 'next/link'
import {
  buildMonthBuckets,
  fetchEstimateStatusBreakdown,
  fetchKpiSummary,
  fetchMonthlyCounts,
  METRIC_LABEL,
  type MetricKey,
} from '@/lib/mng-stats'
import {
  MonthlyBarChart,
  MonthlyTrendChart,
  StatusDoughnut,
} from '@/components/mng/dashboard/Charts'

export const revalidate = 0

const TREND_PALETTE: Record<MetricKey, string> = {
  estimates: '#2563eb',
  gallery: '#10b981',
  products: '#f59e0b',
  posts: '#a855f7',
  members: '#ef4444',
}

export default async function AdminHome() {
  // 12개월 추이 + 6개월 막대 + KPI(이번달 vs 지난달) + 견적 status 분포
  const buckets12 = buildMonthBuckets(12)
  const buckets6 = buckets12.slice(-6)

  const [monthly12, kpi, statusRows] = await Promise.all([
    fetchMonthlyCounts(buckets12),
    fetchKpiSummary(),
    fetchEstimateStatusBreakdown(),
  ])

  const labels12 = buckets12.map((b) => b.label)
  const labels6 = buckets6.map((b) => b.label)

  // 6개월 막대용 — 견적문의 한정
  const estimates6 = monthly12.estimates.slice(-6)

  // 라인차트 데이터셋 — 5개 메트릭 모두
  const trendDatasets = (Object.keys(METRIC_LABEL) as MetricKey[]).map((m) => ({
    label: METRIC_LABEL[m],
    data: monthly12[m],
    color: TREND_PALETTE[m],
  }))

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-12">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-[0.75rem] font-semibold uppercase tracking-[0.3em] text-blue-700">
            Dashboard
          </p>
          <h1 className="mt-1 text-2xl font-bold">어드민</h1>
          <p className="mt-1 text-[0.875rem] text-neutral-500">
            이번 달 운영 지표를 한 화면에서 확인하세요. 월별 리포트는 PDF 로 저장할 수 있습니다.
          </p>
        </div>
        <Link
          href="/mng/reports"
          className="inline-flex items-center gap-1.5 rounded-full bg-black px-5 py-2.5 text-[0.875rem] font-bold text-white hover:bg-neutral-800"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
          </svg>
          월별 리포트
        </Link>
      </div>

      {/* KPI 카드 */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {kpi.map((k) => (
          <Link
            key={k.key}
            href={k.href}
            className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-400"
          >
            <p className="text-[0.75rem] font-medium text-neutral-500">{k.label}</p>
            <p className="mt-1.5 text-[1.75rem] font-extrabold leading-none tracking-tight">
              {k.current.toLocaleString('ko-KR')}
            </p>
            <DiffChip diff={k.diff} pct={k.pct} />
            <p className="mt-1 text-[0.75rem] text-neutral-400">
              지난달 {k.previous.toLocaleString('ko-KR')}건
            </p>
          </Link>
        ))}
      </section>

      {/* 차트 */}
      <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 lg:col-span-2">
          <header className="mb-4 flex items-baseline justify-between">
            <h2 className="text-[1rem] font-bold text-neutral-900">최근 12개월 추이</h2>
            <span className="text-[0.75rem] text-neutral-500">월별 등록 수</span>
          </header>
          <MonthlyTrendChart labels={labels12} datasets={trendDatasets} />
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <header className="mb-4 flex items-baseline justify-between">
            <h2 className="text-[1rem] font-bold text-neutral-900">견적문의 상태</h2>
            <span className="text-[0.75rem] text-neutral-500">전체 누적</span>
          </header>
          <StatusDoughnut rows={statusRows} />
        </div>
      </section>

      <section className="mt-4 rounded-xl border border-neutral-200 bg-white p-5">
        <header className="mb-4 flex items-baseline justify-between">
          <h2 className="text-[1rem] font-bold text-neutral-900">최근 6개월 견적문의</h2>
          <span className="text-[0.75rem] text-neutral-500">월별 신규 접수</span>
        </header>
        <MonthlyBarChart
          labels={labels6}
          data={estimates6}
          label="견적문의"
          color="#2563eb"
        />
      </section>
    </div>
  )
}

function DiffChip({ diff, pct }: { diff: number; pct: number | null }) {
  const isUp = diff > 0
  const isDown = diff < 0
  const isFlat = diff === 0

  const tone = isUp
    ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
    : isDown
      ? 'bg-rose-50 text-rose-700 ring-rose-100'
      : 'bg-neutral-100 text-neutral-600 ring-neutral-200'

  const arrow = isUp ? '▲' : isDown ? '▼' : '–'
  const absDiff = Math.abs(diff).toLocaleString('ko-KR')
  const pctText =
    pct == null
      ? isFlat
        ? '0%'
        : '신규'
      : `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`

  return (
    <div
      className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.75rem] font-bold ring-1 ${tone}`}
    >
      <span aria-hidden>{arrow}</span>
      <span>
        {isUp ? '+' : isDown ? '-' : ''}
        {absDiff}
      </span>
      <span className="opacity-70">·</span>
      <span>{pctText}</span>
    </div>
  )
}
