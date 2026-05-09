'use client'

/**
 * 견적 폼의 "제품정보" — 모델명·수량을 여러 항목 추가할 수 있는 다중 행 입력기.
 *
 * - 행마다 [모델명][제품 검색 버튼][수량][제거]
 * - 검색 버튼 → ProductSearchModal → 체크한 제품 토큰을 그 행 모델명에 채움
 * - 제출은 hidden input 으로 model_name / quantity 단일 필드에 줄바꿈 합쳐서 전송
 *   (백엔드/PDF 무변경. 어드민 표시만 multi-line text 로 보임)
 */

import { useMemo, useState } from 'react'
import ProductSearchModal from './ProductSearchModal'
import { inputCls } from './fields'
import type { EstimateProductOption } from '@/lib/estimates/products-for-picker'

type Row = { model: string; quantity: string }

type Props = {
  /** 백엔드로 보낼 모델명 필드 이름 (보통 'model_name') */
  modelFieldName: string
  /** 백엔드로 보낼 수량 필드 이름 (보통 'quantity') */
  quantityFieldName: string
  /** 첫 행에 미리 채울 모델명 (제품 상세 → 견적문의 진입 시) */
  initialModel?: string
  /** 첫 행 수량 prefill */
  initialQuantity?: string
  required?: boolean
  options: EstimateProductOption[]
  categories: { id: number; name: string }[]
}

function appendTokens(current: string, tokens: string[]): string {
  if (tokens.length === 0) return current
  const trimmed = current.trim()
  const existing = trimmed.length > 0 ? trimmed.split(/\s*,\s*/).filter(Boolean) : []
  const merged = Array.from(new Set([...existing, ...tokens]))
  return merged.join(', ')
}

export default function ModelItemsField({
  modelFieldName,
  quantityFieldName,
  initialModel = '',
  initialQuantity = '',
  required,
  options,
  categories,
}: Props) {
  const [rows, setRows] = useState<Row[]>([
    { model: initialModel, quantity: initialQuantity },
  ])
  const [searchOpenIdx, setSearchOpenIdx] = useState<number | null>(null)

  const updateRow = (i: number, patch: Partial<Row>) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  }
  const addRow = () => setRows((prev) => [...prev, { model: '', quantity: '' }])
  const removeRow = (i: number) =>
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((_, idx) => idx !== i)))

  // 백엔드 호환 — 단일 필드로 합쳐서 제출 (multi-line)
  const packedModel = useMemo(
    () =>
      rows
        .map((r) => r.model.trim())
        .filter(Boolean)
        .join('\n'),
    [rows]
  )
  const packedQuantity = useMemo(
    () =>
      rows
        .map((r) => r.quantity.trim())
        .filter(Boolean)
        .join('\n'),
    [rows]
  )

  // 모달에서 비활성화할 토큰 — 모든 행의 현재 모델값을 콤마 분리해서 모음
  const allUsedTokens = useMemo(() => {
    const set = new Set<string>()
    for (const r of rows) {
      const tokens = r.model.split(/\s*,\s*/).filter(Boolean)
      for (const t of tokens) set.add(t)
    }
    return set
  }, [rows])

  return (
    <div>
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div
            key={i}
            className="rounded-lg border border-neutral-200 bg-white p-3"
          >
            {/* 모바일: 2 줄로 자연스럽게 wrap. 데스크탑(md+): 한 줄 가로 꽉 차게. */}
            <div className="flex flex-wrap items-stretch gap-2 md:flex-nowrap">
              {/* 모델명 + 검색 — 데스크탑에서 flex-1 로 가로 꽉 채움 */}
              <div className="flex w-full min-w-0 items-stretch gap-2 md:flex-1">
                <input
                  type="text"
                  value={row.model}
                  onChange={(e) => updateRow(i, { model: e.target.value })}
                  placeholder={i === 0 ? 'ex.aw-100' : '모델명'}
                  required={required && i === 0}
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => setSearchOpenIdx(i)}
                  aria-label="제품 검색"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3.5 text-[0.75rem] font-medium text-neutral-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                  검색
                </button>
              </div>

              {/* 수량 + 제거 — 모바일은 한 줄에 함께, 데스크탑은 우측 고정 폭 */}
              <div className="flex w-full items-stretch gap-2 md:w-auto">
                <input
                  type="text"
                  value={row.quantity}
                  onChange={(e) => updateRow(i, { quantity: e.target.value })}
                  placeholder={i === 0 ? 'ex.2대' : '수량'}
                  required={required && i === 0}
                  className={`${inputCls} md:w-[140px]`}
                />
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  disabled={rows.length <= 1}
                  aria-label={`${i + 1}번째 항목 제거`}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center self-stretch rounded-lg border border-neutral-200 bg-white text-neutral-400 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-neutral-200 disabled:hover:bg-white disabled:hover:text-neutral-400"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-dashed border-neutral-300 bg-white px-4 py-2 text-[0.75rem] font-medium text-neutral-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M12 5v14M5 12h14" />
        </svg>
        모델 항목 추가
      </button>

      {/* 폼 제출용 hidden inputs — 줄바꿈으로 합쳐 보냄 (백엔드 필드 단일 유지) */}
      <input type="hidden" name={modelFieldName} value={packedModel} />
      <input type="hidden" name={quantityFieldName} value={packedQuantity} />

      {/* 검색 모달 — 어떤 행이 열었는지 idx 로 추적해서 그 행에만 채움 */}
      <ProductSearchModal
        open={searchOpenIdx !== null}
        onClose={() => setSearchOpenIdx(null)}
        onSubmit={(tokens) => {
          if (searchOpenIdx === null) return
          const idx = searchOpenIdx
          updateRow(idx, { model: appendTokens(rows[idx]?.model ?? '', tokens) })
        }}
        options={options}
        categories={categories}
        disabledTokens={allUsedTokens}
      />
    </div>
  )
}
