import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  ESTIMATE_STATUS_LABEL,
  ESTIMATE_REQUEST_TYPES,
  ESTIMATE_FORM_TYPE_LABEL,
  type EstimateInquiry,
  type EstimateStatus,
} from '@/lib/types'

export const revalidate = 0

const STATUS_TONE: Record<EstimateStatus, string> = {
  new: 'bg-blue-50 text-blue-700 ring-blue-100',
  in_progress: 'bg-amber-50 text-amber-700 ring-amber-100',
  done: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  archived: 'bg-neutral-100 text-neutral-500 ring-neutral-200',
}

const REQUEST_LABEL = new Map<string, string>(
  ESTIMATE_REQUEST_TYPES.map((r) => [r.value, r.label])
)

export default async function AdminEstimatesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const sp = await searchParams
  const supabase = await createClient()

  const STATUS_TABS: { value: EstimateStatus | 'all'; label: string }[] = [
    { value: 'all', label: '전체' },
    { value: 'new', label: '신규' },
    { value: 'in_progress', label: '진행중' },
    { value: 'done', label: '완료' },
    { value: 'archived', label: '보관' },
  ]
  const activeStatus =
    (sp.status as EstimateStatus | 'all' | undefined) ?? 'all'

  let q = supabase
    .from('estimate_inquiries')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
  if (activeStatus !== 'all') q = q.eq('status', activeStatus)

  const { data, count } = await q
  const items = (data ?? []) as EstimateInquiry[]

  // 상태별 카운트 (간단 — 개별 쿼리)
  const counts: Record<string, number> = {}
  for (const t of STATUS_TABS) {
    if (t.value === 'all') {
      counts[t.value] = count ?? 0
      continue
    }
    const { count: c } = await supabase
      .from('estimate_inquiries')
      .select('*', { count: 'exact', head: true })
      .eq('status', t.value)
    counts[t.value] = c ?? 0
  }

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-12">
      <header className="mb-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">견적·도면 문의</h1>
          <p className="mt-1 text-[13px] text-neutral-500">
            <Link href="/execution-estimate" target="_blank" className="hover:underline">
              /execution-estimate
            </Link>{' '}
            폼으로 접수된 문의 내역.
          </p>
        </div>
      </header>

      {/* 상태 탭 */}
      <nav className="mt-6 flex flex-wrap items-center gap-2 border-b border-neutral-200 pb-3">
        {STATUS_TABS.map((t) => {
          const active = activeStatus === t.value
          return (
            <Link
              key={t.value}
              href={
                t.value === 'all'
                  ? '/admin/estimates'
                  : `/admin/estimates?status=${t.value}`
              }
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition ${
                active
                  ? 'bg-neutral-900 text-white'
                  : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              {t.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  active ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'
                }`}
              >
                {counts[t.value] ?? 0}
              </span>
            </Link>
          )
        })}
      </nav>

      {items.length === 0 ? (
        <p className="mt-6 rounded border border-dashed border-neutral-300 p-12 text-center text-neutral-500">
          접수된 문의가 없습니다.
        </p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          {/* 데스크톱 헤더 */}
          <div className="hidden grid-cols-12 gap-3 border-b border-neutral-200 bg-neutral-50 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 md:grid">
            <div className="col-span-2">접수일</div>
            <div className="col-span-3">업체 / 발주처</div>
            <div className="col-span-2">담당자</div>
            <div className="col-span-2">유형</div>
            <div className="col-span-2">요청사항·제품</div>
            <div className="col-span-1 text-right">상태</div>
          </div>

          <ul className="divide-y divide-neutral-100">
            {items.map((it) => {
              const requests = (it.request_types ?? [])
                .map((v) => REQUEST_LABEL.get(v) ?? v)
                .join(', ')
              return (
                <li key={it.id}>
                  <Link
                    href={`/admin/estimates/${it.id}`}
                    className="grid grid-cols-1 gap-3 px-5 py-4 transition hover:bg-neutral-50 md:grid-cols-12"
                  >
                    <div className="text-[12px] text-neutral-500 md:col-span-2">
                      <span className="font-medium text-neutral-800">
                        {new Date(it.created_at).toLocaleDateString('ko-KR')}
                      </span>
                      <span className="ml-1 text-[11px]">
                        {new Date(it.created_at).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="md:col-span-3">
                      <p className="text-[14px] font-semibold text-neutral-900">
                        {it.company_name || it.client_name}
                      </p>
                      {it.company_name && (
                        <p className="mt-0.5 text-[12px] text-neutral-500">
                          → {it.client_name}
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-[13px] text-neutral-800">{it.contact_name}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-neutral-500">
                        {it.phone}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-100">
                        {ESTIMATE_FORM_TYPE_LABEL[it.form_type] ?? it.form_type}
                      </span>
                    </div>
                    <div className="md:col-span-2">
                      <p className="line-clamp-1 text-[12px] text-neutral-600">
                        {requests || '—'}
                      </p>
                      {it.model_name && (
                        <p className="mt-0.5 text-[11px] text-neutral-400">
                          {it.model_name} · {it.quantity}
                          {it.attachment_path ? ' · 📎' : ''}
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-1 md:text-right">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${
                          STATUS_TONE[it.status]
                        }`}
                      >
                        {ESTIMATE_STATUS_LABEL[it.status]}
                      </span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
