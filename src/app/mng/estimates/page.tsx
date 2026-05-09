import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  ESTIMATE_REQUEST_TYPES,
  type EstimateInquiry,
  type EstimateStatus,
} from '@/lib/types'
import EstimatesListClient from './EstimatesListClient'

export const revalidate = 0

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

  // 클라이언트로 넘길 직렬화 가능한 형태
  const rows = items.map((it) => ({
    id: it.id,
    created_at: it.created_at,
    company_name: it.company_name,
    client_name: it.client_name,
    contact_name: it.contact_name,
    phone: it.phone,
    form_type: it.form_type,
    status: it.status,
    model_name: it.model_name,
    quantity: it.quantity,
    attachment_path: it.attachment_path,
    requests: (it.request_types ?? []).map((v) => REQUEST_LABEL.get(v) ?? v),
  }))

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-12">
      <header className="mb-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">견적·도면 문의</h1>
          <p className="mt-1 text-[0.875rem] text-neutral-500">
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
                  ? '/mng/estimates'
                  : `/mng/estimates?status=${t.value}`
              }
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[0.75rem] font-medium transition ${
                active
                  ? 'bg-neutral-900 text-white'
                  : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              {t.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[0.75rem] ${
                  active ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'
                }`}
              >
                {counts[t.value] ?? 0}
              </span>
            </Link>
          )
        })}
      </nav>

      {rows.length === 0 ? (
        <p className="mt-6 rounded border border-dashed border-neutral-300 p-12 text-center text-neutral-500">
          접수된 문의가 없습니다.
        </p>
      ) : (
        <div className="mt-6">
          <EstimatesListClient rows={rows} />
        </div>
      )}
    </div>
  )
}
