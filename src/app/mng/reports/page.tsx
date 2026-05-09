import { fetchMonthlyReport, buildMonthBuckets } from '@/lib/mng-stats'
import ReportView from './ReportView'

export const revalidate = 0

function currentMonthKey(): string {
  // KST 기준
  const now = new Date(Date.now() + 9 * 3600 * 1000)
  const y = now.getUTCFullYear()
  const m = String(now.getUTCMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const sp = await searchParams
  const monthKey =
    sp.month && /^\d{4}-\d{2}$/.test(sp.month) ? sp.month : currentMonthKey()
  const report = await fetchMonthlyReport(monthKey)

  // 최근 24개월 선택지 (최신이 위로)
  const monthOptions = buildMonthBuckets(24)
    .map((b) => ({ key: b.key, label: b.label }))
    .reverse()

  return <ReportView report={report} monthOptions={monthOptions} />
}
