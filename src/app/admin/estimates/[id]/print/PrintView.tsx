'use client'

import { useEffect } from 'react'
import type { ProductColor } from '@/lib/types'

type Props = {
  id: number
  createdAt: string
  requestLabels: string[]
  companyName: string
  clientName: string
  budget: string | null
  contactName: string
  phone: string
  email: string
  deliveryLabel: string
  siteAddress: string
  dueDate: string | null
  modelName: string
  quantity: string
  extraLabels: string[]
  productColorRows: { line: string; colors: ProductColor[] }[]
  note: string | null
  attachmentName: string | null
}

const COMPANY = {
  name: '에이스엔지니어링',
  brand: 'ACEWATER',
  ceo: '구 종 철',
  bizNo: '111-24-75831',
  address: '경기도 파주시 탄현면 방촌로 449-58',
  phone: '031-944-2903',
  fax: '031-944-2901',
  email: 'acewater@acewater.net',
}

export default function PrintView(props: Props) {
  const {
    id,
    createdAt,
    requestLabels,
    companyName,
    clientName,
    budget,
    contactName,
    phone,
    email,
    deliveryLabel,
    siteAddress,
    dueDate,
    modelName,
    quantity,
    extraLabels,
    productColorRows,
    note,
    attachmentName,
  } = props

  const formattedCreated = new Date(createdAt).toLocaleString('ko-KR', {
    dateStyle: 'long',
    timeStyle: 'short',
  })
  const formattedDue = dueDate
    ? new Date(dueDate).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null
  const issueDate = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // 다운로드(PDF로 저장) 시 기본 파일명: 업체명_모델명_수량_납기일
  useEffect(() => {
    const sanitize = (s: string | null | undefined) =>
      (s ?? '').replace(/[\\/:*?"<>|]/g, '').trim()
    const dueCompact = dueDate ? dueDate.replaceAll('-', '') : ''
    const parts = [
      sanitize(companyName),
      sanitize(modelName),
      sanitize(quantity),
      sanitize(dueCompact),
    ].filter(Boolean)
    const filename = parts.join('_') || `견적서_${id}`
    const prevTitle = document.title
    document.title = filename
    return () => {
      document.title = prevTitle
    }
  }, [companyName, modelName, quantity, dueDate, id])

  return (
    <>
      {/* 화면 전용 툴바 — 인쇄 시 숨김 */}
      <div className="no-print sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3 px-6 py-3">
          <div className="text-[13px] text-neutral-500">
            <span className="font-semibold text-neutral-900">견적·도면 문의서</span>
            <span className="mx-2 text-neutral-300">·</span>#{id}
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`/admin/estimates/${id}`}
              className="rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-[12px] font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              ← 상세로
            </a>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-1.5 text-[12px] font-bold text-white shadow-sm transition hover:shadow-md"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" />
              </svg>
              인쇄 / PDF 저장
            </button>
          </div>
        </div>
        <p className="mx-auto max-w-[1100px] px-6 pb-2 text-[11px] text-neutral-500">
          💡 브라우저 인쇄 창에서 <strong className="text-neutral-700">대상</strong>을{' '}
          <strong className="text-neutral-700">&ldquo;PDF로 저장&rdquo;</strong>으로 선택하면 다운로드됩니다.
        </p>
      </div>

      {/* A4 문서 */}
      <div className="min-h-screen bg-neutral-100 py-10 print:bg-white print:py-0">
        <article className="print-page mx-auto bg-white text-neutral-900">
          {/* 헤더 */}
          <header className="flex items-start justify-between border-b-2 border-neutral-900 pb-3">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.4em] text-neutral-500">
                {COMPANY.brand}
              </p>
              <h1 className="mt-1 text-[22px] font-extrabold tracking-tight">
                견적·도면 문의서
              </h1>
            </div>
            <div className="text-right text-[9.5px] leading-[1.65] text-neutral-600">
              <p>
                <span className="text-neutral-400">접수번호 </span>
                <span className="font-mono font-semibold text-neutral-900">
                  EST-{String(id).padStart(6, '0')}
                </span>
              </p>
              <p>
                <span className="text-neutral-400">접수일자 </span>
                {formattedCreated}
              </p>
              <p>
                <span className="text-neutral-400">발행일자 </span>
                {issueDate}
              </p>
            </div>
          </header>

          {/* 요청사항 */}
          <Section title="요청사항">
            {requestLabels.length > 0 ? (
              <ul className="grid grid-cols-2 gap-1 text-[12px]">
                {requestLabels.map((l) => (
                  <li key={l} className="flex items-center gap-2">
                    <span aria-hidden className="text-neutral-900">
                      ✓
                    </span>
                    {l}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[12px] text-neutral-400">—</p>
            )}
          </Section>

          {/* 업체정보 */}
          <Section title="업체 정보">
            <table className="w-full border-collapse text-[12px]">
              <tbody>
                <Row label="업체명" value={companyName} />
                <Row label="발주처" value={clientName} />
                <Row label="담당자" value={contactName} />
                <Row label="연락처" value={phone} mono />
                <Row label="이메일" value={email} mono />
                {budget && <Row label="예산" value={budget} />}
              </tbody>
            </table>
          </Section>

          {/* 납품 정보 */}
          <Section title="납품 정보">
            <table className="w-full border-collapse text-[12px]">
              <tbody>
                <Row label="납품방법" value={deliveryLabel} />
                <Row label="현장 주소" value={siteAddress} />
                {formattedDue && <Row label="납기 요청일" value={formattedDue} />}
              </tbody>
            </table>
          </Section>

          {/* 제품 정보 */}
          <Section title="제품 정보">
            <table className="w-full border-collapse text-[12px]">
              <tbody>
                <Row label="모델명" value={modelName} mono />
                <Row label="수량" value={quantity} />
                {productColorRows.length > 0 && (
                  <tr className="border-b border-neutral-200 last:border-0">
                    <th className="w-[100px] bg-neutral-50 px-2.5 py-1.5 text-left align-top text-[10.5px] font-semibold text-neutral-700">
                      색상
                    </th>
                    <td className="px-2.5 py-1.5 text-[11.5px] text-neutral-900">
                      <div className="space-y-1">
                        {productColorRows.map((row, i) => (
                          <div key={i} className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="font-mono text-[10.5px] text-neutral-500">
                              {row.line}
                            </span>
                            <span className="text-neutral-300">·</span>
                            {row.colors.map((c, j) => (
                              <span
                                key={j}
                                className="inline-flex items-center gap-1 text-[11px] text-neutral-700"
                                title={c.name}
                              >
                                <span
                                  className="block h-3 w-3 rounded-full ring-1 ring-neutral-300"
                                  style={{ background: c.hex }}
                                />
                                {c.name}
                              </span>
                            ))}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
                {extraLabels.length > 0 && (
                  <Row label="추가요청" value={extraLabels.join(', ')} />
                )}
              </tbody>
            </table>
          </Section>

          {/* 참고사항 */}
          {note && (
            <Section title="참고사항">
              <div className="min-h-[60px] whitespace-pre-line rounded border border-neutral-200 bg-neutral-50/50 p-3 text-[12px] leading-[1.85]">
                {note}
              </div>
            </Section>
          )}

          {/* 첨부 */}
          {attachmentName && (
            <Section title="첨부">
              <p className="text-[12px] text-neutral-700">📎 {attachmentName}</p>
            </Section>
          )}

          {/* 푸터 */}
          <footer className="mt-6 border-t-2 border-neutral-900 pt-3">
            <div className="grid grid-cols-2 gap-4 text-[10px] leading-[1.7]">
              <div>
                <p className="text-[10.5px] font-bold tracking-tight text-neutral-900">
                  {COMPANY.name} · {COMPANY.brand}
                </p>
                <p className="mt-0.5 text-neutral-600">
                  대표: {COMPANY.ceo} &nbsp;|&nbsp; 사업자등록번호: {COMPANY.bizNo}
                </p>
                <p className="text-neutral-600">{COMPANY.address}</p>
              </div>
              <div className="text-right text-neutral-600">
                <p>T. {COMPANY.phone} &nbsp;|&nbsp; F. {COMPANY.fax}</p>
                <p>E. {COMPANY.email}</p>
              </div>
            </div>
            <p className="mt-2 text-center text-[9px] text-neutral-400">
              본 문서는 견적·도면 문의 접수 내역을 기록한 문서입니다. 정식 견적서는 별도 발행됩니다.
            </p>
          </footer>
        </article>
      </div>

      {/* 인쇄 / A4 스타일 — 1장에 들어가도록 컴팩트 + 사이트 chrome 완전 숨김 */}
      <style jsx global>{`
        .print-page {
          /* A4 = 210mm × 297mm, 컴팩트 패딩 12mm */
          width: 210mm;
          min-height: 297mm;
          padding: 12mm 14mm;
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

          /* (1) body 직속 chrome (사이트 Header / Footer / FloatingButtons 등) — main 제외, print-page 미포함 모두 숨김 */
          body > *:not(main):not(:has(.print-page)) {
            display: none !important;
          }

          /* (2) main 안의 어드민 chrome (AdminNav 등) — print-page 자체 또는 print-page 를 자손으로 가진 요소만 남기고 모두 숨김 */
          body > main > *:not(.print-page):not(:has(.print-page)) {
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

          .print-page {
            box-shadow: none !important;
            margin: 0 !important;
            min-height: auto !important;
            page-break-after: avoid;
            page-break-inside: avoid;
          }
          .print-page * {
            page-break-inside: avoid;
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
    <section className="mt-3.5">
      <h2 className="mb-1.5 border-b border-neutral-900 pb-1 text-[11.5px] font-bold tracking-tight">
        {title}
      </h2>
      {children}
    </section>
  )
}

function Row({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <tr className="border-b border-neutral-200 last:border-0">
      <th className="w-[100px] bg-neutral-50 px-2.5 py-1.5 text-left text-[10.5px] font-semibold text-neutral-700">
        {label}
      </th>
      <td className={`px-2.5 py-1.5 text-[11.5px] text-neutral-900 ${mono ? 'font-mono' : ''}`}>
        {value}
      </td>
    </tr>
  )
}
