'use client'

import Link from 'next/link'
import SelectableTable from '@/components/mng/SelectableTable'
import {
  adminBulkDeleteEstimates,
  adminBulkUpdateEstimateStatus,
} from '../actions'
import {
  ESTIMATE_FORM_TYPE_LABEL,
  ESTIMATE_STATUS_LABEL,
  type EstimateStatus,
} from '@/lib/types'

const STATUS_TONE: Record<EstimateStatus, string> = {
  new: 'bg-blue-50 text-blue-700 ring-blue-100',
  in_progress: 'bg-amber-50 text-amber-700 ring-amber-100',
  done: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  archived: 'bg-neutral-100 text-neutral-500 ring-neutral-200',
}

export type EstimateRow = {
  id: number
  created_at: string
  company_name: string | null
  client_name: string
  contact_name: string
  phone: string
  form_type: string
  status: EstimateStatus
  model_name: string
  quantity: string
  attachment_path: string | null
  requests: string[]
}

export default function EstimatesListClient({ rows }: { rows: EstimateRow[] }) {
  const ids = rows.map((r) => r.id)

  return (
    <SelectableTable
      ids={ids}
      onBulkDelete={async (ids) => {
        await adminBulkDeleteEstimates(ids)
      }}
      deleteConfirm="선택한 문의를 정말 삭제하시겠습니까?"
      extraBulkActions={[
        {
          label: '신규로 이동',
          tone: 'neutral',
          onClick: async (ids) => {
            await adminBulkUpdateEstimateStatus(ids, 'new')
          },
        },
        {
          label: '진행중으로 이동',
          tone: 'neutral',
          onClick: async (ids) => {
            await adminBulkUpdateEstimateStatus(ids, 'in_progress')
          },
        },
        {
          label: '완료로 이동',
          tone: 'primary',
          onClick: async (ids) => {
            await adminBulkUpdateEstimateStatus(ids, 'done')
          },
        },
        {
          label: '보관함으로 이동',
          tone: 'neutral',
          onClick: async (ids) => {
            await adminBulkUpdateEstimateStatus(ids, 'archived')
          },
        },
      ]}
    >
      {({ checkboxFor, headerCheckbox }) => (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <div className="hidden grid-cols-[44px_minmax(0,2fr)_minmax(0,3fr)_minmax(0,2fr)_minmax(0,2fr)_minmax(0,2fr)_minmax(0,1fr)] items-center gap-3 border-b border-neutral-200 bg-neutral-50 px-5 py-3 text-[0.75rem] font-semibold uppercase tracking-wider text-neutral-500 md:grid">
            <div>{headerCheckbox}</div>
            <div>접수일</div>
            <div>업체 / 발주처</div>
            <div>담당자</div>
            <div>유형</div>
            <div>요청사항·제품</div>
            <div className="text-right">상태</div>
          </div>
          <ul className="divide-y divide-neutral-100">
            {rows.map((it) => (
              <li
                key={it.id}
                className="grid grid-cols-[44px_minmax(0,1fr)] items-start gap-3 px-5 py-4 transition hover:bg-neutral-50 md:grid-cols-[44px_minmax(0,2fr)_minmax(0,3fr)_minmax(0,2fr)_minmax(0,2fr)_minmax(0,2fr)_minmax(0,1fr)] md:items-center"
              >
                <div className="pt-0.5 md:pt-0">{checkboxFor(it.id)}</div>
                <div className="md:contents">
                  <Link
                    href={`/mng/estimates/${it.id}`}
                    className="contents"
                  >
                    <div className="text-[0.75rem] text-neutral-500">
                      <span className="font-medium text-neutral-800">
                        {new Date(it.created_at).toLocaleDateString('ko-KR')}
                      </span>
                      <span className="ml-1 text-[0.75rem]">
                        {new Date(it.created_at).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div>
                      <p className="text-[0.875rem] font-semibold text-neutral-900">
                        {it.company_name || it.client_name}
                      </p>
                      {it.company_name && (
                        <p className="mt-0.5 text-[0.75rem] text-neutral-500">
                          → {it.client_name}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-[0.875rem] text-neutral-800">
                        {it.contact_name}
                      </p>
                      <p className="mt-0.5 font-mono text-[0.75rem] text-neutral-500">
                        {it.phone}
                      </p>
                    </div>
                    <div>
                      <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[0.75rem] font-semibold text-blue-700 ring-1 ring-blue-100">
                        {ESTIMATE_FORM_TYPE_LABEL[it.form_type] ?? it.form_type}
                      </span>
                    </div>
                    <div>
                      <p className="line-clamp-1 text-[0.75rem] text-neutral-600">
                        {it.requests.join(', ') || '—'}
                      </p>
                      {it.model_name && (
                        <p className="mt-0.5 text-[0.75rem] text-neutral-400">
                          {it.model_name} · {it.quantity}
                          {it.attachment_path ? ' · 📎' : ''}
                        </p>
                      )}
                    </div>
                    <div className="md:text-right">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[0.75rem] font-semibold ring-1 ${
                          STATUS_TONE[it.status]
                        }`}
                      >
                        {ESTIMATE_STATUS_LABEL[it.status]}
                      </span>
                    </div>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </SelectableTable>
  )
}
