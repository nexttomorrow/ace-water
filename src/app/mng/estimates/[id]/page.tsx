import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateEstimateStatus, deleteEstimate } from '../actions'
import {
  ESTIMATE_REQUEST_TYPES,
  ESTIMATE_DELIVERY_METHODS,
  ESTIMATE_EXTRA_OPTIONS,
  ESTIMATE_STATUS_LABEL,
  ESTIMATE_FORM_TYPE_LABEL,
  type EstimateInquiry,
  type EstimateStatus,
} from '@/lib/types'

export const revalidate = 0

const REQUEST_LABEL = new Map<string, string>(
  ESTIMATE_REQUEST_TYPES.map((r) => [r.value, r.label])
)
const DELIVERY_LABEL = new Map<string, string>(
  ESTIMATE_DELIVERY_METHODS.map((d) => [d.value, d.label])
)
const EXTRA_LABEL = new Map<string, string>(
  ESTIMATE_EXTRA_OPTIONS.map((e) => [e.value, e.label])
)

const STATUS_TONE: Record<EstimateStatus, string> = {
  new: 'bg-blue-50 text-blue-700 ring-blue-100',
  in_progress: 'bg-amber-50 text-amber-700 ring-amber-100',
  done: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  archived: 'bg-neutral-100 text-neutral-500 ring-neutral-200',
}

export default async function EstimateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const inquiryId = Number(id)
  if (!Number.isFinite(inquiryId)) notFound()

  const supabase = await createClient()
  const { data } = await supabase
    .from('estimate_inquiries')
    .select('*')
    .eq('id', inquiryId)
    .single()

  if (!data) notFound()
  const it = data as EstimateInquiry

  const attachmentUrl = it.attachment_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/estimate-files/${it.attachment_path}`
    : null

  const updateAction = updateEstimateStatus.bind(null, inquiryId)
  const deleteAction = deleteEstimate.bind(null, inquiryId)

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-12">
      <div className="mb-1 text-[0.75rem] text-neutral-500">
        <Link href="/mng/estimates" className="hover:underline">
          견적·도면 문의
        </Link>{' '}
        ›
      </div>
      <header className="mb-8 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{it.company_name || it.client_name}</h1>
            <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-[0.75rem] font-semibold text-blue-700 ring-1 ring-blue-100">
              {ESTIMATE_FORM_TYPE_LABEL[it.form_type] ?? it.form_type}
            </span>
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-[0.75rem] font-semibold ring-1 ${
                STATUS_TONE[it.status]
              }`}
            >
              {ESTIMATE_STATUS_LABEL[it.status]}
            </span>
          </div>
          <p className="mt-1 text-[0.875rem] text-neutral-500">
            #{it.id} ·{' '}
            {new Date(it.created_at).toLocaleString('ko-KR', {
              dateStyle: 'long',
              timeStyle: 'short',
            })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/mng/estimates/${inquiryId}/print`}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded bg-gradient-to-r from-blue-600 to-cyan-500 px-3.5 py-2 text-[0.875rem] font-medium text-white shadow-sm transition hover:shadow-md"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" />
            </svg>
            견적서 출력 / PDF
          </Link>
          <form action={updateAction} className="flex items-center gap-2">
            <select
              name="status"
              defaultValue={it.status}
              className="rounded border border-neutral-300 bg-white px-3 py-2 text-[0.875rem]"
            >
              {(Object.keys(ESTIMATE_STATUS_LABEL) as EstimateStatus[]).map((s) => (
                <option key={s} value={s}>
                  {ESTIMATE_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded bg-neutral-900 px-3 py-2 text-[0.875rem] font-medium text-white hover:bg-neutral-700"
            >
              상태 변경
            </button>
          </form>
          <form action={deleteAction}>
            <button
              type="submit"
              className="rounded border border-red-300 px-3 py-2 text-[0.875rem] text-red-700 hover:bg-red-50"
            >
              삭제
            </button>
          </form>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* 좌측 메인 */}
        <div className="md:col-span-2">
          <DetailCard label="Request" title="요청사항">
            <div className="flex flex-wrap gap-1.5">
              {(it.request_types ?? []).map((v) => (
                <span
                  key={v}
                  className="rounded-full bg-blue-50 px-3 py-1 text-[0.75rem] font-medium text-blue-800 ring-1 ring-blue-100"
                >
                  {REQUEST_LABEL.get(v) ?? v}
                </span>
              ))}
              {(it.request_types ?? []).length === 0 && (
                <span className="text-[0.875rem] text-neutral-400">—</span>
              )}
            </div>
          </DetailCard>

          <DetailCard label="Company" title="업체정보">
            <Row label="업체명" value={it.company_name} />
            <Row label="발주처" value={it.client_name} />
            <Row label="예산" value={it.budget} />
            <Row label="담당자" value={it.contact_name} />
            <Row label="연락처" value={<PhoneLink phone={it.phone} />} />
            <Row label="이메일" value={<EmailLink email={it.email} />} />
          </DetailCard>

          <DetailCard label="Delivery" title="납품·현장">
            <Row
              label="납품방법"
              value={DELIVERY_LABEL.get(it.delivery_method) ?? it.delivery_method}
            />
            <Row label="현장" value={it.site_address} />
            <Row
              label="납기 요청일"
              value={
                it.due_date ? new Date(it.due_date).toLocaleDateString('ko-KR') : null
              }
            />
          </DetailCard>

          <DetailCard label="Product" title="제품정보">
            <Row label="모델명" value={it.model_name} />
            <Row label="수량" value={it.quantity} />
            <Row
              label="추가요청"
              value={
                (it.extra_options ?? []).length > 0
                  ? (it.extra_options ?? [])
                      .map((v) => EXTRA_LABEL.get(v) ?? v)
                      .join(', ')
                  : null
              }
            />
          </DetailCard>

          {it.note && (
            <DetailCard label="Notes" title="참고사항">
              <p className="whitespace-pre-line text-[0.875rem] leading-[1.85] text-neutral-700">
                {it.note}
              </p>
            </DetailCard>
          )}
        </div>

        {/* 우측 사이드 */}
        <aside className="space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-[0.75rem] font-semibold uppercase tracking-[0.3em] text-blue-700">
              Attachment
            </p>
            <h3 className="mt-1.5 text-[1rem] font-bold tracking-tight">첨부파일</h3>
            {attachmentUrl ? (
              <a
                href={attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex w-full items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-[0.875rem] font-medium text-neutral-800 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                <span className="min-w-0 truncate">
                  📎 {it.attachment_name ?? '첨부파일'}
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
              </a>
            ) : (
              <p className="mt-3 text-[0.875rem] text-neutral-400">첨부 없음</p>
            )}
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-[0.75rem] font-semibold uppercase tracking-[0.3em] text-blue-700">
              Quick Actions
            </p>
            <h3 className="mt-1.5 text-[1rem] font-bold tracking-tight">빠른 응대</h3>
            <div className="mt-3 space-y-2">
              <PhoneLink phone={it.phone} button />
              <EmailLink email={it.email} button subject={`[ACEWATER] ${it.company_name} 견적 문의`} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function DetailCard({
  label,
  title,
  children,
}: {
  label: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-4 rounded-xl border border-neutral-200 bg-white p-5">
      <header className="mb-3 border-b border-neutral-100 pb-2.5">
        <p className="text-[0.75rem] font-semibold uppercase tracking-[0.3em] text-blue-700">
          {label}
        </p>
        <h3 className="mt-1 text-[1rem] font-bold tracking-tight">{title}</h3>
      </header>
      <div className="space-y-2">{children}</div>
    </section>
  )
}

function Row({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="w-20 shrink-0 text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-neutral-400">
        {label}
      </span>
      <span className="flex-1 text-[0.875rem] text-neutral-800">
        {value || <span className="text-neutral-300">—</span>}
      </span>
    </div>
  )
}

function PhoneLink({ phone, button }: { phone: string; button?: boolean }) {
  if (!phone) return <span className="text-neutral-300">—</span>
  if (button) {
    return (
      <a
        href={`tel:${phone.replaceAll('-', '')}`}
        className="flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-4 py-2.5 text-[0.875rem] font-medium text-white transition hover:bg-neutral-700"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
        전화 걸기
      </a>
    )
  }
  return (
    <a href={`tel:${phone.replaceAll('-', '')}`} className="font-mono hover:text-blue-700 hover:underline">
      {phone}
    </a>
  )
}

function EmailLink({
  email,
  button,
  subject,
}: {
  email: string
  button?: boolean
  subject?: string
}) {
  if (!email) return <span className="text-neutral-300">—</span>
  const href = `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`
  if (button) {
    return (
      <a
        href={href}
        className="flex items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-[0.875rem] font-medium text-neutral-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h16v16H4zM4 4l8 8 8-8" />
        </svg>
        이메일 보내기
      </a>
    )
  }
  return (
    <a href={href} className="hover:text-blue-700 hover:underline">
      {email}
    </a>
  )
}
