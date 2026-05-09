'use client'

/**
 * 제품 색상 옵션 편집기 (admin ProductForm 용).
 * 동적 행: 색상명 + 색상값 (HTML color picker)
 * 폼 제출 시 colors_present=1 마커 + color_name[] / color_hex[] 배열로 전송
 */

import { useState } from 'react'
import type { ProductColor } from '@/lib/types'

type Props = {
  initial?: ProductColor[]
}

export default function ColorsField({ initial }: Props) {
  const [rows, setRows] = useState<ProductColor[]>(
    initial && initial.length > 0 ? initial : []
  )

  const update = (i: number, patch: Partial<ProductColor>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))

  const add = () => setRows((prev) => [...prev, { name: '', hex: '#000000' }])
  const remove = (i: number) =>
    setRows((prev) => prev.filter((_, idx) => idx !== i))

  return (
    <div>
      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50/50 p-4 text-center text-[0.75rem] text-neutral-500">
          등록된 색상이 없습니다. 아래 <strong>+ 색상 추가</strong> 버튼으로 등록하세요.
        </p>
      ) : (
        <div className="space-y-2">
          {rows.map((row, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white p-2.5"
            >
              {/* 색상 미리보기 + 컬러 피커 */}
              <label className="relative inline-block h-9 w-9 shrink-0 cursor-pointer overflow-hidden rounded-full border border-neutral-200 ring-1 ring-neutral-200/60 hover:ring-blue-300">
                <span
                  className="block h-full w-full"
                  style={{ background: row.hex }}
                  aria-hidden
                />
                <input
                  type="color"
                  value={normalizeHex(row.hex)}
                  onChange={(e) => update(i, { hex: e.target.value })}
                  className="absolute inset-0 cursor-pointer opacity-0"
                  aria-label="색상 선택"
                />
              </label>

              {/* 색상명 */}
              <input
                type="text"
                placeholder="색상명 (예: 코발트 바이올렛)"
                value={row.name}
                onChange={(e) => update(i, { name: e.target.value })}
                className="flex-1 rounded border border-neutral-300 bg-white px-3 py-2 text-[0.875rem] focus:border-blue-500 focus:outline-none"
              />

              {/* hex 직접 입력 */}
              <input
                type="text"
                placeholder="#RRGGBB"
                value={row.hex}
                onChange={(e) => update(i, { hex: e.target.value })}
                className="w-28 rounded border border-neutral-300 bg-white px-3 py-2 font-mono text-[0.75rem] focus:border-blue-500 focus:outline-none"
              />

              <button
                type="button"
                onClick={() => remove(i)}
                aria-label="이 색상 제거"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-400 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={add}
        className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-dashed border-neutral-300 bg-white px-4 py-2 text-[0.75rem] font-medium text-neutral-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M12 5v14M5 12h14" />
        </svg>
        색상 추가
      </button>

      {/* 폼 제출 마커 + 행별 hidden inputs */}
      <input type="hidden" name="colors_present" value="1" />
      {rows.map((r, i) => (
        <div key={i}>
          <input type="hidden" name="color_name" value={r.name} />
          <input type="hidden" name="color_hex" value={r.hex} />
        </div>
      ))}
    </div>
  )
}

function normalizeHex(value: string): string {
  // <input type="color"> 는 정확히 #RRGGBB 만 허용
  const v = (value ?? '').trim()
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v
  return '#000000'
}
