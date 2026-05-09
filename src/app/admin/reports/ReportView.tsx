'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { ESTIMATE_STATUS_LABEL, type EstimateStatus } from '@/lib/types'

type MetricRow = {
  key: string
  label: string
  count: number
  prev: number
  diff: number
  pct: number | null
}

type StatusRow = {
  status: EstimateStatus
  label: string
  count: number
}

type EstimateRow = {
  id: number
  created_at: string
  company_name: string | null
  client_name: string
  contact_name: string
  phone: string
  model_name: string
  quantity: string
  status: EstimateStatus
}

type Report = {
  monthKey: string
  monthLabel: string
  startIso: string
  endIso: string
  metrics: MetricRow[]
  statuses: StatusRow[]
  estimates: EstimateRow[]
}

type Props = {
  report: Report
  monthOptions: { key: string; label: string }[]
}

const COMPANY = {
  name: '에이스엔지니어링',
  brand: 'ACEWATER',
}

export default function ReportView({ report, monthOptions }: Props) {
  const router = useRouter()
  const params = useSearchParams()

  // 인쇄 시 다운로드 파일명
  useEffect(() => {
    const filename = `ACEWATER_월별리포트_${report.monthKey}`
    const prev = document.title
    document.title = filename
    return () => {
      document.title = prev
    }
  }, [report.monthKey])

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = new URLSearchParams(params.toString())
    next.set('month', e.target.value)
    router.push(`/admin/reports?${next.toString()}`)
  }

  const issueDate = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const totalEstimates =
    report.statuses.reduce((sum, s) => sum + s.count, 0) || 0

  return (
    <>
      {/* 화면 전용 툴바 — 인쇄 시 숨김 */}
      <div className="no-print sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3 px-6 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-[13px] text-neutral-500 hover:text-neutral-900"
            >
              ← 대시보드
            </Link>
            <span className="text-neutral-300">·</span>
            <span className="text-[13px] font-semibold text-neutral-900">월별 리포트</span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={report.monthKey}
              onChange={handleMonthChange}
              className="rounded-full border border-neutral-300 bg-white px-3.5 py-1.5 text-[12px] font-medium text-neutral-700 focus:border-blue-500 focus:outline-none"
            >
              {monthOptions.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-1.5 text-[12px] font-bold text-white shadow-sm transition hover:shadow-md"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" />
              </svg>
              PDF 저장 / 인쇄
            </button>
          </div>
        </div>
        <p className="mx-auto max-w-[1100px] px-6 pb-2 text-[11px] text-neutral-500">
          💡 브라우저 인쇄 창에서 <strong>대상</strong>을{' '}
          <strong>&ldquo;PDF로 저장&rdquo;</strong>으로 선택하면 다운로드됩니다.
        </p>
      </div>

      <div className="min-h-screen bg-neutral-100 py-10 print:bg-white print:py-0">
        <article className="report-page mx-auto bg-white text-neutral-900">
          {/* 헤더 */}
          <header className="flex items-start justify-between border-b-2 border-neutral-900 pb-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-neutral-500">
                {COMPANY.brand}
              </p>
              <h1 className="mt-1 text-[22px] font-extrabold tracking-tight">
                월별 운영 리포트
              </h1>
              <p className="mt-1 text-[13px] font-bold text-blue-700">
                {report.monthLabel}
              </p>
            </div>
            <div className="text-right text-[10px] leading-[1.65] text-neutral-600">
              <p>
                <span className="text-neutral-400">발행일자 </span>
                {issueDate}
              </p>
              <p>
                <span className="text-neutral-400">기간 </span>
                {report.monthLabel} 1일 ~ 말일 (KST)
              </p>
            </div>
          </header>

          {/* 핵심 지표 */}
          <Section title="핵심 지표">
            <table className="w-full border-collapse text-[11.5px]">
              <thead>
                <tr className="bg-neutral-50">
                  <th className="border border-neutral-200 px-2.5 py-1.5 text-left font-semibold text-neutral-700">
                    항목
                  </th>
                  <th className="border border-neutral-200 px-2.5 py-1.5 text-right font-semibold text-neutral-700">
                    당월
                  </th>
                  <th className="border border-neutral-200 px-2.5 py-1.5 text-right font-semibold text-neutral-700">
                    전월
                  </th>
                  <th className="border border-neutral-200 px-2.5 py-1.5 text-right font-semibold text-neutral-700">
                    증감 (건)
                  </th>
                  <th className="border border-neutral-200 px-2.5 py-1.5 text-right font-semibold text-neutral-700">
                    증감률 (%)
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.metrics.map((m) => (
                  <tr key={m.key}>
                    <td className="border border-neutral-200 px-2.5 py-1.5 font-medium">
                      {m.label}
                    </td>
                    <td className="border border-neutral-200 px-2.5 py-1.5 text-right font-mono">
                      {m.count.toLocaleString('ko-KR')}
                    </td>
                    <td className="border border-neutral-200 px-2.5 py-1.5 text-right font-mono text-neutral-500">
                      {m.prev.toLocaleString('ko-KR')}
                    </td>
                    <td
                      className={`border border-neutral-200 px-2.5 py-1.5 text-right font-mono ${
                        m.diff > 0
                          ? 'text-emerald-700'
                          : m.diff < 0
                            ? 'text-rose-700'
                            : 'text-neutral-500'
                      }`}
                    >
                      {m.diff > 0 ? '+' : ''}
                      {m.diff.toLocaleString('ko-KR')}
                    </td>
                    <td
                      className={`border border-neutral-200 px-2.5 py-1.5 text-right font-mono ${
                        (m.pct ?? 0) > 0
                          ? 'text-emerald-700'
                          : (m.pct ?? 0) < 0
                            ? 'text-rose-700'
                            : 'text-neutral-500'
                      }`}
                    >
                      {m.pct == null
                        ? m.diff === 0
                          ? '0%'
                          : '신규'
                        : `${m.pct >= 0 ? '+' : ''}${m.pct.toFixed(1)}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* 견적문의 상태 분포 */}
          <Section title="견적문의 상태 분포 (당월)">
            <table className="w-full border-collapse text-[11.5px]">
              <thead>
                <tr className="bg-neutral-50">
                  <th className="border border-neutral-200 px-2.5 py-1.5 text-left font-semibold text-neutral-700">
                    상태
                  </th>
                  <th className="border border-neutral-200 px-2.5 py-1.5 text-right font-semibold text-neutral-700">
                    건수
                  </th>
                  <th className="border border-neutral-200 px-2.5 py-1.5 text-right font-semibold text-neutral-700">
                    비중 (%)
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.statuses.map((s) => {
                  const pct = totalEstimates === 0 ? 0 : (s.count / totalEstimates) * 100
                  return (
                    <tr key={s.status}>
                      <td className="border border-neutral-200 px-2.5 py-1.5 font-medium">
                        {s.label}
                      </td>
                      <td className="border border-neutral-200 px-2.5 py-1.5 text-right font-mono">
                        {s.count.toLocaleString('ko-KR')}
                      </td>
                      <td className="border border-neutral-200 px-2.5 py-1.5 text-right font-mono text-neutral-600">
                        {pct.toFixed(1)}%
                      </td>
                    </tr>
                  )
                })}
                <tr className="bg-neutral-50 font-bold">
                  <td className="border border-neutral-200 px-2.5 py-1.5">합계</td>
                  <td className="border border-neutral-200 px-2.5 py-1.5 text-right font-mono">
                    {totalEstimates.toLocaleString('ko-KR')}
                  </td>
                  <td className="border border-neutral-200 px-2.5 py-1.5 text-right font-mono">
                    100.0%
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* 견적문의 상세 */}
          {report.estimates.length > 0 && (
            <Section title={`견적문의 상세 (${report.estimates.length}건)`}>
              <table className="w-full border-collapse text-[10.5px]">
                <thead>
                  <tr className="bg-neutral-50">
                    <th className="border border-neutral-200 px-2 py-1 text-left font-semibold text-neutral-700">접수일</th>
                    <th className="border border-neutral-200 px-2 py-1 text-left font-semibold text-neutral-700">업체</th>
                    <th className="border border-neutral-200 px-2 py-1 text-left font-semibold text-neutral-700">담당자</th>
                    <th className="border border-neutral-200 px-2 py-1 text-left font-semibold text-neutral-700">연락처</th>
                    <th className="border border-neutral-200 px-2 py-1 text-left font-semibold text-neutral-700">모델명</th>
                    <th className="border border-neutral-200 px-2 py-1 text-right font-semibold text-neutral-700">수량</th>
                    <th className="border border-neutral-200 px-2 py-1 text-left font-semibold text-neutral-700">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {report.estimates.map((e) => {
                    const date = new Date(e.created_at).toLocaleDateString('ko-KR', {
                      month: '2-digit',
                      day: '2-digit',
                    })
                    return (
                      <tr key={e.id}>
                        <td className="border border-neutral-200 px-2 py-1 font-mono">{date}</td>
                        <td className="border border-neutral-200 px-2 py-1">
                          {e.company_name ?? e.client_name}
                        </td>
                        <td className="border border-neutral-200 px-2 py-1">{e.contact_name}</td>
                        <td className="border border-neutral-200 px-2 py-1 font-mono">{e.phone}</td>
                        <td className="border border-neutral-200 px-2 py-1 font-mono">
                          {e.model_name.split('\n').slice(0, 1).join(', ')}
                          {e.model_name.includes('\n') ? ' …' : ''}
                        </td>
                        <td className="border border-neutral-200 px-2 py-1 text-right font-mono">
                          {e.quantity}
                        </td>
                        <td className="border border-neutral-200 px-2 py-1">
                          {ESTIMATE_STATUS_LABEL[e.status]}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </Section>
          )}

          {/* 푸터 */}
          <footer className="mt-6 border-t-2 border-neutral-900 pt-3">
            <p className="text-center text-[10px] text-neutral-500">
              {COMPANY.name} · {COMPANY.brand} — 본 문서는 {report.monthLabel} 운영 데이터를 정리한
              내부 리포트입니다.
            </p>
          </footer>
        </article>
      </div>

      {/* 인쇄 / A4 — 사이트 chrome 완전 숨김 */}
      <style jsx global>{`
        .report-page {
          width: 210mm;
          min-height: 297mm;
          padding: 14mm 16mm;
          box-sizing: border-box;
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
        }

        @page {
          size: A4 portrait;
          margin: 0;
        }

        @media print {
          html,
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
          }

          body > *:not(main):not(:has(.report-page)) {
            display: none !important;
          }
          body > main > *:not(.report-page):not(:has(.report-page)) {
            display: none !important;
          }
          body > main {
            display: block !important;
            flex: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .no-print {
            display: none !important;
          }

          .report-page {
            box-shadow: none !important;
            margin: 0 !important;
            min-height: auto !important;
          }
        }
      `}</style>
    </>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-5">
      <h2 className="mb-1.5 border-b border-neutral-900 pb-1 text-[12px] font-bold tracking-tight">
        {title}
      </h2>
      {children}
    </section>
  )
}
