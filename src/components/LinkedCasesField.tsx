'use client'

/**
 * 제품 편집 폼 안에 들어가는 "시공사례 연결" 섹션 (UI only — 자체 form 없음).
 * 부모 ProductForm 의 form action 으로 case_ids 가 함께 제출됨.
 */

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'

export type CaseOption = {
  id: number
  title: string
  imageUrl: string
  modelName: string | null
  siteName: string | null
}

type Props = {
  cases: CaseOption[]
  initialSelectedIds: number[]
  productId?: number
}

export default function LinkedCasesField({
  cases,
  initialSelectedIds,
  productId,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(
    new Set(initialSelectedIds)
  )
  const [search, setSearch] = useState('')

  const filteredCases = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return cases
    return cases.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.modelName?.toLowerCase().includes(q) ?? false) ||
        (c.siteName?.toLowerCase().includes(q) ?? false)
    )
  }, [cases, search])

  const toggle = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const remove = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const casesById = useMemo(() => {
    const m = new Map<number, CaseOption>()
    for (const c of cases) m.set(c.id, c)
    return m
  }, [cases])

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5">
      <header className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-[14px] font-bold text-neutral-900">
            시공사례 연결
            <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-mono text-neutral-600">
              {selectedIds.size}
            </span>
          </h2>
          <p className="mt-0.5 text-[11px] text-neutral-500">
            체크한 시공사례가{' '}
            {productId ? (
              <Link
                href={`/products/${productId}`}
                target="_blank"
                className="font-mono text-blue-600 hover:underline"
              >
                /products/{productId}
              </Link>
            ) : (
              '제품 상세 페이지'
            )}{' '}
            의 &ldquo;시공사례&rdquo; 탭에 노출됩니다.
          </p>
        </div>
        <Link
          href="/admin/gallery/new"
          target="_blank"
          className="rounded border border-neutral-300 bg-white px-3 py-1.5 text-[12px] font-medium text-neutral-700 hover:bg-neutral-100"
        >
          + 시공사례 등록
        </Link>
      </header>

      {/* 선택된 chip — 폼 제출용 hidden inputs 도 이 자리에 함께 렌더 */}
      {selectedIds.size > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {Array.from(selectedIds).map((id) => {
            const c = casesById.get(id)
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 py-1 pl-3 pr-1 text-[12px] font-medium text-blue-700 ring-1 ring-blue-200"
              >
                {c ? c.title : `#${id}`}
                <button
                  type="button"
                  onClick={() => remove(id)}
                  aria-label="제거"
                  className="flex h-5 w-5 items-center justify-center rounded-full text-blue-500 transition hover:bg-blue-100 hover:text-blue-900"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )
          })}
        </div>
      )}

      {/* 검색 */}
      <div className="relative mt-3">
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
          placeholder="시공사례 제목·모델명·현장명으로 검색"
          className="w-full rounded border border-neutral-300 bg-white py-2 pl-9 pr-3 text-[13px] focus:border-neutral-500 focus:outline-none"
        />
      </div>

      {/* 후보 그리드 */}
      <div className="mt-3 max-h-[420px] overflow-y-auto rounded border border-neutral-200 bg-neutral-50/40 p-3">
        {cases.length === 0 ? (
          <p className="px-4 py-12 text-center text-[12px] text-neutral-500">
            등록된 시공사례가 없습니다.{' '}
            <Link
              href="/admin/gallery/new"
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              시공사례 추가
            </Link>
          </p>
        ) : filteredCases.length === 0 ? (
          <p className="px-4 py-12 text-center text-[12px] text-neutral-500">
            검색 결과가 없습니다.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {filteredCases.map((c) => {
              const checked = selectedIds.has(c.id)
              return (
                <li key={c.id}>
                  <label
                    className={`group relative block cursor-pointer overflow-hidden rounded-lg border bg-white transition ${
                      checked
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    {/* 폼 제출용 — name="case_ids" hidden checkbox */}
                    <input
                      type="checkbox"
                      name="case_ids"
                      value={c.id}
                      checked={checked}
                      onChange={() => toggle(c.id)}
                      className="sr-only"
                    />
                    <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                      <Image
                        src={c.imageUrl}
                        alt={c.title}
                        fill
                        unoptimized
                        sizes="200px"
                        className="object-cover"
                      />
                      <span
                        className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 transition ${
                          checked
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-white/80 bg-black/30 text-white opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        {checked && (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          >
                            <path d="M5 12l5 5L20 7" />
                          </svg>
                        )}
                      </span>
                    </div>
                    <div className="px-2.5 py-2">
                      <p className="truncate text-[13px] font-semibold text-neutral-900">
                        {c.title}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-neutral-500">
                        {c.siteName || c.modelName || '—'}
                      </p>
                    </div>
                  </label>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* 명시적 제출 마커 — 액션이 case_ids 가 아예 안 들어왔는지 (필드 미렌더링), 0개 선택했는지(전부 해제) 구분할 수 있도록 */}
      <input type="hidden" name="cases_picker_present" value="1" />
    </section>
  )
}
