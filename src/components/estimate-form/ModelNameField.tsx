'use client'

/**
 * 견적 폼의 "모델명" 입력 필드.
 * - 기본은 일반 텍스트 input
 * - 우측 "제품 검색" 버튼 → ProductSearchModal 오픈 → 선택 시 입력값에 콤마로 추가
 */

import { useState } from 'react'
import ProductSearchModal from './ProductSearchModal'
import { inputCls } from './fields'
import type { EstimateProductOption } from '@/lib/estimates/products-for-picker'

type Props = {
  name: string
  required?: boolean
  placeholder?: string
  defaultValue?: string
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

export default function ModelNameField({
  name,
  required,
  placeholder,
  defaultValue,
  options,
  categories,
}: Props) {
  const [value, setValue] = useState(defaultValue ?? '')
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="flex items-stretch gap-2">
        <input
          type="text"
          name={name}
          required={required}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className={inputCls}
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3.5 text-[12px] font-medium text-neutral-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          aria-label="제품 검색"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          제품 검색
        </button>
      </div>
      <p className="mt-1 text-[11px] text-neutral-500">
        직접 입력하거나, 등록된 제품을 검색해서 추가할 수 있습니다.
      </p>

      <ProductSearchModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={(tokens) => setValue((prev) => appendTokens(prev, tokens))}
        options={options}
        categories={categories}
      />
    </>
  )
}
