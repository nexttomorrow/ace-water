'use client'

/**
 * 견적 폼의 "제품명" 입력에서 호출되는 검색 모달.
 * - 카테고리 필터 + 검색 + 멀티 체크박스
 * - "추가" 클릭 시 선택된 제품의 fillToken 들을 콤마로 join 하여 부모에 콜백
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import type { EstimateProductOption } from '@/lib/estimates/products-for-picker'

type Category = { id: number; name: string }

type Props = {
  open: boolean
  onClose: () => void
  /** 선택 결과 토큰들 (모델명 우선) → 부모가 input value 에 합쳐 넣음 */
  onSubmit: (tokens: string[]) => void
  options: EstimateProductOption[]
  categories: Category[]
  /** 이미 다른 행에 추가된 fillToken 들 — 같은 토큰의 항목은 클릭 비활성 + "이미 추가됨" 표시 */
  disabledTokens?: Iterable<string>
}

export default function ProductSearchModal({
  open,
  onClose,
  onSubmit,
  options,
  categories,
  disabledTokens,
}: Props) {
  const disabledSet = useMemo(
    () => new Set(disabledTokens ?? []),
    [disabledTokens]
  )
  const [search, setSearch] = useState('')
  const [activeCatId, setActiveCatId] = useState<number | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLabel, setPreviewLabel] = useState<string>('')
  const dialogRef = useRef<HTMLDivElement>(null)

  // 모달 열릴 때마다 상태 초기화 + body scroll lock
  useEffect(() => {
    if (!open) return
    setSearch('')
    setActiveCatId(null)
    setSelectedIds(new Set())
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // ESC 로 닫기 (preview 가 열려있으면 preview 만 먼저 닫기)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (previewUrl) {
        setPreviewUrl(null)
      } else {
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, previewUrl])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return options.filter((p) => {
      if (activeCatId !== null && p.categoryId !== activeCatId) return false
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        (p.modelName?.toLowerCase().includes(q) ?? false) ||
        (p.categoryName?.toLowerCase().includes(q) ?? false)
      )
    })
  }, [options, search, activeCatId])

  // 카테고리별로 그룹
  const grouped = useMemo(() => {
    const map = new Map<string, EstimateProductOption[]>()
    for (const p of filtered) {
      const key = p.categoryName ?? '(미분류)'
      const arr = map.get(key) ?? []
      arr.push(p)
      map.set(key, arr)
    }
    return Array.from(map.entries())
  }, [filtered])

  const toggle = (id: number) => {
    const opt = options.find((o) => o.id === id)
    if (opt && disabledSet.has(opt.fillToken)) return // 이미 추가된 항목은 토글 불가
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSubmit = () => {
    const byId = new Map(options.map((o) => [o.id, o]))
    const tokens = Array.from(selectedIds)
      .map((id) => byId.get(id)?.fillToken)
      .filter((v): v is string => !!v && v.length > 0)
    onSubmit(tokens)
    onClose()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className="flex h-[88vh] max-h-[760px] w-full max-w-[520px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* 헤더 */}
        <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <p className="text-[0.75rem] font-semibold uppercase tracking-[0.3em] text-blue-700">
              Search Products
            </p>
            <h2 className="mt-0.5 text-[1.125rem] font-bold tracking-tight">
              제품 검색
              <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-[0.75rem] font-mono text-neutral-600">
                {selectedIds.size}
              </span>
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* 검색 + 카테고리 탭 */}
        <div className="border-b border-neutral-100 px-6 py-4">
          <div className="relative">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="제품명·모델명·카테고리로 검색"
              className="w-full rounded-lg border border-neutral-300 bg-white py-2.5 pl-10 pr-3 text-[0.875rem] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              autoFocus
            />
          </div>

          {categories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              <CategoryPill
                active={activeCatId === null}
                label="전체"
                onClick={() => setActiveCatId(null)}
              />
              {categories.map((c) => (
                <CategoryPill
                  key={c.id}
                  active={activeCatId === c.id}
                  label={c.name}
                  onClick={() => setActiveCatId(c.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {options.length === 0 ? (
            <p className="px-4 py-12 text-center text-[0.875rem] text-neutral-500">
              등록된 제품이 없습니다.
            </p>
          ) : grouped.length === 0 ? (
            <p className="px-4 py-12 text-center text-[0.875rem] text-neutral-500">
              검색 결과가 없습니다.
            </p>
          ) : (
            <div className="space-y-5">
              {grouped.map(([groupName, items]) => (
                <div key={groupName}>
                  <p className="mb-2 text-[0.75rem] font-semibold uppercase tracking-[0.3em] text-neutral-500">
                    {groupName}
                  </p>
                  <ul className="space-y-1">
                    {items.map((p) => {
                      const checked = selectedIds.has(p.id)
                      const alreadyAdded = disabledSet.has(p.fillToken)
                      return (
                        <li key={p.id}>
                          <label
                            className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-[0.875rem] transition ${
                              alreadyAdded
                                ? 'cursor-not-allowed border-transparent bg-neutral-50 opacity-50'
                                : checked
                                  ? 'cursor-pointer border-blue-300 bg-blue-50/60'
                                  : 'cursor-pointer border-transparent bg-neutral-50 hover:border-neutral-200 hover:bg-white'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={alreadyAdded}
                              onChange={() => toggle(p.id)}
                              className="h-4 w-4 shrink-0 cursor-pointer accent-blue-600 disabled:cursor-not-allowed"
                            />

                            {/* 썸네일 — 클릭하면 라이트박스 (비활성된 항목도 미리보기는 가능) */}
                            {p.imageUrl ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setPreviewUrl(p.imageUrl)
                                  setPreviewLabel(p.label)
                                }}
                                aria-label={`${p.label} 크게 보기`}
                                className="relative h-12 w-12 shrink-0 cursor-zoom-in overflow-hidden rounded-md bg-neutral-100 ring-1 ring-neutral-200 transition hover:ring-blue-300"
                              >
                                <Image
                                  src={p.imageUrl}
                                  alt={p.label}
                                  fill
                                  unoptimized
                                  sizes="48px"
                                  className="object-cover"
                                />
                              </button>
                            ) : (
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-[0.75rem] text-neutral-400 ring-1 ring-neutral-200">
                                no img
                              </div>
                            )}

                            <span className="min-w-0 flex-1">
                              {p.modelName && (
                                <span className="block truncate font-mono text-[0.75rem] text-neutral-500">
                                  {p.modelName}
                                </span>
                              )}
                              <span className="block truncate text-[0.875rem] font-semibold text-neutral-900">
                                {p.name}
                              </span>
                              <span className="mt-0.5 flex flex-wrap items-center gap-1">
                                {p.categoryName && (
                                  <span className="inline-block rounded-full bg-white px-1.5 py-0.5 text-[0.75rem] font-medium text-neutral-500 ring-1 ring-neutral-200">
                                    {p.categoryName}
                                  </span>
                                )}
                                {alreadyAdded && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-neutral-200 px-1.5 py-0.5 text-[0.75rem] font-semibold text-neutral-700">
                                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                      <path d="M5 12l5 5L20 7" />
                                    </svg>
                                    이미 추가됨
                                  </span>
                                )}
                              </span>
                            </span>
                          </label>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 하단 액션 */}
        <footer className="flex items-center justify-between gap-3 border-t border-neutral-200 px-6 py-4">
          <p className="text-[0.75rem] text-neutral-500">
            {selectedIds.size > 0
              ? `${selectedIds.size}개 선택됨 — 모델명 입력에 자동으로 추가됩니다.`
              : '여러 개 체크하면 콤마로 합쳐 입력됩니다.'}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-[0.875rem] font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={selectedIds.size === 0}
              className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2 text-[0.875rem] font-bold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              추가
            </button>
          </div>
        </footer>
      </div>

      {/* 썸네일 클릭 시 라이트박스 */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-6 backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation()
            setPreviewUrl(null)
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setPreviewUrl(null)
            }}
            aria-label="크게보기 닫기"
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <div
            className="relative h-full max-h-[80vh] w-full max-w-[760px]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={previewUrl}
              alt={previewLabel}
              fill
              unoptimized
              priority
              className="object-contain"
              sizes="100vw"
            />
          </div>
          {previewLabel && (
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-[0.75rem] font-medium text-white backdrop-blur">
              {previewLabel}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function CategoryPill({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-3 py-1 text-[0.75rem] font-medium transition ${
        active
          ? 'bg-neutral-900 text-white'
          : 'border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100'
      }`}
    >
      {label}
    </button>
  )
}
