'use client'

/**
 * 제품안내 페이지 상단의 핀형 드롭다운 필터 바.
 * - URL 파라미터로 상태 보관 (filter_<key>=v1,v2 형식)
 * - 자동 적용: 옵션 클릭 즉시 router.push (서버에서 다시 필터링)
 * - 전체 해제 버튼
 *
 * 필터 정의는 어드민의 product_filters 테이블에서 카테고리별로 관리.
 */

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { ProductFilter } from '@/lib/types'

type Props = {
  filters: ProductFilter[]
  /** 검색 결과 총 개수 */
  totalCount: number
  /** 현재 활성 카테고리 id (없으면 null) */
  activeCategoryId: number | null
}

const PARAM_PREFIX = 'f_'

export default function ProductFilterBar({
  filters,
  totalCount,
  activeCategoryId,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [openKey, setOpenKey] = useState<string | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // 외부 클릭 시 닫기
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapperRef.current) return
      if (!wrapperRef.current.contains(e.target as Node)) setOpenKey(null)
    }
    if (openKey !== null) {
      document.addEventListener('mousedown', onDocClick)
      return () => document.removeEventListener('mousedown', onDocClick)
    }
  }, [openKey])

  const getSelected = (key: string): string[] => {
    const raw = searchParams.get(`${PARAM_PREFIX}${key}`)
    if (!raw) return []
    return raw.split(',').filter(Boolean)
  }

  const buildHref = (next: Record<string, string[]>): string => {
    const params = new URLSearchParams(searchParams.toString())

    // 페이지는 1로 리셋
    params.delete('page')

    // 우리가 관리하는 필터 파라미터만 갱신, 다른 파라미터는 유지
    for (const f of filters) params.delete(`${PARAM_PREFIX}${f.key}`)
    for (const [k, vals] of Object.entries(next)) {
      if (vals.length > 0) params.set(`${PARAM_PREFIX}${k}`, vals.join(','))
    }

    const qs = params.toString()
    return qs ? `?${qs}` : '?'
  }

  const allCurrent = (): Record<string, string[]> => {
    const out: Record<string, string[]> = {}
    for (const f of filters) {
      const arr = getSelected(f.key)
      if (arr.length > 0) out[f.key] = arr
    }
    return out
  }

  const toggleOption = (key: string, value: string) => {
    const current = allCurrent()
    const cur = current[key] ?? []
    const nextVals = cur.includes(value)
      ? cur.filter((v) => v !== value)
      : [...cur, value]
    const next = { ...current, [key]: nextVals }
    router.push(buildHref(next), { scroll: false })
  }

  const clearAll = () => {
    router.push(buildHref({}), { scroll: false })
  }

  // 활성 칩 (펼친 적용 필터들)
  const activeChips: { filter: ProductFilter; option: { value: string; label: string } }[] = []
  for (const f of filters) {
    for (const v of getSelected(f.key)) {
      const opt = f.options.find((o) => o.value === v)
      if (opt) activeChips.push({ filter: f, option: opt })
    }
  }
  const hasActive = activeChips.length > 0

  if (filters.length === 0) return null

  return (
    <div ref={wrapperRef} className="border-b border-neutral-200 pb-5">
      {/* 필터 카운트 + 정렬(추후) */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[14px] text-neutral-700">
          <span className="font-bold text-neutral-900">필터</span>
          <span className="mx-3 text-neutral-300">|</span>
          <span className="text-neutral-500">{totalCount}개 결과</span>
        </p>
        {hasActive && (
          <button
            type="button"
            onClick={clearAll}
            className="rounded-full border border-neutral-300 px-3.5 py-1.5 text-[12px] font-medium text-neutral-700 transition hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
          >
            전체 해제
          </button>
        )}
      </div>

      {/* 핀 드롭다운 행 */}
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => {
          const selected = getSelected(f.key)
          const isOpen = openKey === f.key
          const showActive = selected.length > 0
          return (
            <div key={f.id} className="relative">
              <button
                type="button"
                onClick={() => setOpenKey(isOpen ? null : f.key)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[13px] font-medium transition ${
                  showActive
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500'
                }`}
              >
                <span>{f.label}</span>
                {showActive && (
                  <span
                    className={`inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                      showActive ? 'bg-white text-neutral-900' : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    {selected.length}
                  </span>
                )}
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  className={`transition ${isOpen ? 'rotate-180' : ''}`}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {isOpen && (
                <div className="absolute left-0 top-full z-30 mt-2 min-w-[220px] rounded-lg border border-neutral-200 bg-white p-3 shadow-lg">
                  <ul className="max-h-[300px] space-y-1 overflow-y-auto">
                    {f.options.map((o) => {
                      const checked = selected.includes(o.value)
                      const isColor = f.key === 'color'
                      // 색상 필터의 옵션 라벨에는 hex 가 자동으로 같이 들어옴 (page.tsx 가 옵션을 합성)
                      const swatch =
                        isColor && 'hex' in o
                          ? (o as unknown as { hex?: string }).hex
                          : undefined
                      return (
                        <li key={o.value}>
                          <label
                            className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition ${
                              checked
                                ? 'bg-blue-50 text-blue-900'
                                : 'text-neutral-700 hover:bg-neutral-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleOption(f.key, o.value)}
                              className="h-4 w-4 cursor-pointer accent-blue-600"
                            />
                            {swatch && (
                              <span
                                aria-hidden
                                className="inline-block h-4 w-4 shrink-0 rounded-full ring-1 ring-neutral-300"
                                style={{ background: swatch }}
                              />
                            )}
                            {o.label}
                          </label>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 적용된 필터 칩 (있을 때만) */}
      {hasActive && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {activeChips.map(({ filter, option }) => (
            <button
              key={`${filter.key}:${option.value}`}
              type="button"
              onClick={() => toggleOption(filter.key, option.value)}
              className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-[12px] font-medium text-neutral-800 transition hover:bg-neutral-200"
            >
              <span className="text-neutral-500">{filter.label}</span>
              <span className="text-neutral-400">·</span>
              <span>{option.label}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {/* category context (debug용 placeholder, 보이지 않음) */}
      <input type="hidden" value={activeCategoryId ?? ''} aria-hidden readOnly />
    </div>
  )
}
