'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  SEARCH_MIN_LENGTH,
  SEARCH_PERIODS,
  SEARCH_SORTS,
  SEARCH_TYPE_LABEL,
  SEARCH_TYPE_ORDER,
  type SearchPeriod,
  type SearchResponse,
  type SearchResult,
  type SearchType,
  type SearchView,
  type SortDir,
  type SortField,
} from '@/lib/search'

type Filter = SearchType | 'all'

/** 유형별 아이콘 (썸네일 없는 결과의 대체 표시) */
function TypeIcon({ type, size = 18 }: { type: SearchType; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  switch (type) {
    case 'product':
      return (
        <svg {...common}>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
        </svg>
      )
    case 'case':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
        </svg>
      )
    case 'notice':
      return (
        <svg {...common}>
          <path d="M3 11l18-5v12L3 14v-3z" />
          <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
        </svg>
      )
    case 'resource':
      return (
        <svg {...common}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3" />
        </svg>
      )
    case 'post':
      return (
        <svg {...common}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )
  }
}

/** 제목에서 검색어와 일치하는 부분을 강조 */
function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>
  const idx = text.toLowerCase().indexOf(q.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-blue-100 text-blue-800">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  )
}

export default function SearchOverlay({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [data, setData] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  // 상세검색 옵션
  const [view, setView] = useState<SearchView>('list')
  const [sort, setSort] = useState<SortField>('relevance')
  const [dir, setDir] = useState<SortDir>('desc')
  const [period, setPeriod] = useState<SearchPeriod>('all')
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // 마운트 시 인풋 포커스 + body 스크롤 잠금
  useEffect(() => {
    inputRef.current?.focus()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  // 입력 디바운스 (220ms)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 220)
    return () => clearTimeout(t)
  }, [query])

  // 검색 요청 (검색어/필터/정렬/기간 변화 시, 이전 요청 취소)
  useEffect(() => {
    if (debounced.length < SEARCH_MIN_LENGTH) return
    const ctrl = new AbortController()
    const params = new URLSearchParams({ q: debounced, sort, dir, period })
    if (filter !== 'all') params.set('type', filter)

    fetch(`/api/search?${params.toString()}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((json: SearchResponse) => {
        setData(json)
        setActiveIndex(0)
        setLoading(false)
      })
      .catch((e) => {
        if (e?.name !== 'AbortError') setLoading(false)
      })
    return () => ctrl.abort()
  }, [debounced, filter, sort, dir, period])

  const hasQuery = debounced.length >= SEARCH_MIN_LENGTH

  // 옵션 변경 시 즉시 로딩 표시(effect 내 동기 setState 회피)
  const markLoading = () => {
    if (hasQuery) setLoading(true)
  }

  const onQueryChange = (v: string) => {
    setQuery(v)
    if (v.trim().length < SEARCH_MIN_LENGTH) {
      setData(null)
      setLoading(false)
    } else {
      setLoading(true)
    }
  }

  const clearQuery = () => {
    setQuery('')
    setData(null)
    setLoading(false)
    inputRef.current?.focus()
  }

  const results: SearchResult[] = useMemo(() => data?.results ?? [], [data])
  const counts = data?.counts ?? {}

  const go = useCallback(
    (href: string) => {
      onClose()
      router.push(href)
    },
    [onClose, router]
  )

  // 키보드 내비게이션
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      const r = results[activeIndex]
      if (r) {
        e.preventDefault()
        go(r.href)
      }
    }
  }

  // 활성 항목이 보이도록 스크롤
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${activeIndex}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const grouped = filter === 'all'
  const filterChips: Filter[] = ['all', ...SEARCH_TYPE_ORDER]
  const showEmptyPrompt = !hasQuery
  const showNoResults = !loading && hasQuery && results.length === 0

  // 유형 순서대로 렌더하며 각 결과에 전역 인덱스 부여
  let runningIndex = -1

  const renderRow = (r: SearchResult) => {
    runningIndex += 1
    const idx = runningIndex
    const isActive = idx === activeIndex
    return (
      <button
        key={`${r.type}-${r.id}`}
        type="button"
        data-idx={idx}
        onMouseEnter={() => setActiveIndex(idx)}
        onClick={() => go(r.href)}
        className={
          'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ' +
          (isActive ? 'bg-neutral-100' : 'hover:bg-neutral-50')
        }
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-100 text-neutral-400">
          {r.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={r.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
          ) : (
            <TypeIcon type={r.type} />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.9375rem] font-medium text-neutral-900">
            <Highlight text={r.title} q={debounced} />
          </span>
          {r.subtitle && (
            <span className="mt-0.5 block truncate text-[0.8125rem] text-neutral-500">{r.subtitle}</span>
          )}
        </span>
      </button>
    )
  }

  const renderCard = (r: SearchResult) => {
    runningIndex += 1
    const idx = runningIndex
    const isActive = idx === activeIndex
    return (
      <button
        key={`${r.type}-${r.id}`}
        type="button"
        data-idx={idx}
        onMouseEnter={() => setActiveIndex(idx)}
        onClick={() => go(r.href)}
        className={
          'group flex flex-col rounded-xl p-1.5 text-left transition ' +
          (isActive ? 'bg-neutral-100 ring-2 ring-neutral-900' : 'hover:bg-neutral-50')
        }
      >
        <span className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-neutral-100 text-neutral-300">
          {r.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={r.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
          ) : (
            <TypeIcon type={r.type} size={30} />
          )}
          <span className="absolute left-1.5 top-1.5 rounded bg-black/55 px-1.5 py-0.5 text-[0.625rem] font-medium text-white">
            {SEARCH_TYPE_LABEL[r.type]}
          </span>
        </span>
        <span className="mt-1.5 block truncate px-0.5 text-[0.8125rem] font-medium text-neutral-900">
          <Highlight text={r.title} q={debounced} />
        </span>
        {r.subtitle && (
          <span className="block truncate px-0.5 text-[0.75rem] text-neutral-500">{r.subtitle}</span>
        )}
      </button>
    )
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex justify-center px-4 pt-[8vh] sm:pt-[10vh]"
      role="dialog"
      aria-modal="true"
      aria-label="통합검색"
      onKeyDown={onKeyDown}
    >
      {/* 배경 */}
      <button
        type="button"
        aria-label="검색 닫기"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-neutral-900/40 backdrop-blur-sm"
      />

      {/* 패널 */}
      <div className="relative z-10 flex max-h-[84vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        {/* 검색 입력 */}
        <div className="flex items-center gap-3 border-b border-neutral-100 px-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-neutral-400">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="제품, 시공사례, 공지 등 검색어를 입력하세요"
            className="h-14 flex-1 bg-transparent text-[1.0625rem] text-neutral-900 outline-none placeholder:text-neutral-400"
            aria-label="검색어"
          />
          {loading && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="animate-spin text-neutral-400">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          )}
          {query && !loading && (
            <button type="button" onClick={clearQuery} aria-label="지우기" className="shrink-0 rounded-full p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
          <kbd className="hidden shrink-0 rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[0.6875rem] font-medium text-neutral-400 sm:inline">
            ESC
          </kbd>
        </div>

        {/* 카테고리(유형) 필터 칩 */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-neutral-100 px-3 py-2.5">
          {filterChips.map((f) => {
            const isActive = filter === f
            const label = f === 'all' ? '전체' : SEARCH_TYPE_LABEL[f]
            const count = f === 'all' ? undefined : counts[f]
            return (
              <button
                key={f}
                type="button"
                onClick={() => {
                  setFilter(f)
                  markLoading()
                }}
                className={
                  'inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[0.8125rem] font-medium transition ' +
                  (isActive ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200')
                }
              >
                {label}
                {typeof count === 'number' && count > 0 && (
                  <span className={'rounded-full px-1 text-[0.6875rem] tabular-nums ' + (isActive ? 'text-white/70' : 'text-neutral-400')}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* 컨트롤 바 — 상세검색 토글 / 정렬 / 방향 / 보기 방식 */}
        <div className="flex items-center justify-between gap-2 border-b border-neutral-100 px-3 py-2">
          <button
            type="button"
            onClick={() => setAdvancedOpen((v) => !v)}
            className={
              'inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[0.8125rem] font-medium transition ' +
              (advancedOpen || period !== 'all'
                ? 'text-neutral-900'
                : 'text-neutral-500 hover:text-neutral-900')
            }
            aria-expanded={advancedOpen}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
            </svg>
            상세검색
            {period !== 'all' && <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={'transition ' + (advancedOpen ? 'rotate-180' : '')}>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          <div className="flex items-center gap-1.5">
            {/* 정렬 기준 */}
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as SortField)
                markLoading()
              }}
              aria-label="정렬 기준"
              className="rounded-lg border border-neutral-200 bg-white py-1 pl-2 pr-1 text-[0.8125rem] text-neutral-700 outline-none transition hover:border-neutral-300 focus:border-neutral-400"
            >
              {SEARCH_SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            {/* 오름/내림차순 (관련도순 제외) */}
            {sort !== 'relevance' && (
              <button
                type="button"
                onClick={() => {
                  setDir((d) => (d === 'asc' ? 'desc' : 'asc'))
                  markLoading()
                }}
                aria-label={dir === 'asc' ? '오름차순' : '내림차순'}
                title={dir === 'asc' ? '오름차순' : '내림차순'}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition hover:border-neutral-300 hover:text-neutral-900"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {dir === 'asc' ? <path d="M12 19V5M6 11l6-6 6 6" /> : <path d="M12 5v14M6 13l6 6 6-6" />}
                </svg>
              </button>
            )}

            <span className="mx-0.5 h-4 w-px bg-neutral-200" />

            {/* 보기 방식 (목록/갤러리) */}
            <div className="flex rounded-lg border border-neutral-200 p-0.5">
              <button
                type="button"
                onClick={() => setView('list')}
                aria-label="목록 보기"
                aria-pressed={view === 'list'}
                className={'flex h-6 w-6 items-center justify-center rounded transition ' + (view === 'list' ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:text-neutral-900')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setView('gallery')}
                aria-label="갤러리 보기"
                aria-pressed={view === 'gallery'}
                className={'flex h-6 w-6 items-center justify-center rounded transition ' + (view === 'gallery' ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:text-neutral-900')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 상세검색 패널 — 기간 */}
        {advancedOpen && (
          <div className="border-b border-neutral-100 bg-neutral-50/60 px-3 py-2.5">
            <p className="mb-1.5 text-[0.75rem] font-semibold tracking-wide text-neutral-400">등록 기간</p>
            <div className="flex gap-1.5 overflow-x-auto">
              {SEARCH_PERIODS.map((p) => {
                const isActive = period === p.value
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => {
                      setPeriod(p.value)
                      markLoading()
                    }}
                    className={
                      'shrink-0 rounded-full px-3 py-1 text-[0.8125rem] font-medium transition ' +
                      (isActive ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600 ring-1 ring-neutral-200 hover:bg-neutral-100')
                    }
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* 결과 */}
        <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
          {showEmptyPrompt && (
            <p className="px-3 py-10 text-center text-[0.875rem] text-neutral-400">
              두 글자 이상 입력하면 사이트 전체에서 검색합니다.
            </p>
          )}

          {showNoResults && (
            <p className="px-3 py-10 text-center text-[0.875rem] text-neutral-500">
              &lsquo;{debounced}&rsquo; 에 대한 검색 결과가 없습니다.
            </p>
          )}

          {!showEmptyPrompt &&
            SEARCH_TYPE_ORDER.map((type) => {
              const rows = results.filter((r) => r.type === type)
              if (rows.length === 0) return null
              return (
                <div key={type} className="mb-1">
                  {grouped && (
                    <div className="flex items-center justify-between px-3 pb-1 pt-2">
                      <span className="text-[0.75rem] font-semibold tracking-wide text-neutral-400">
                        {SEARCH_TYPE_LABEL[type]}
                      </span>
                      {typeof counts[type] === 'number' && counts[type]! > rows.length && (
                        <span className="text-[0.6875rem] text-neutral-300">
                          {rows.length} / {counts[type]}
                        </span>
                      )}
                    </div>
                  )}
                  {view === 'gallery' ? (
                    <div className="grid grid-cols-2 gap-1.5 px-1 sm:grid-cols-3 md:grid-cols-4">
                      {rows.map(renderCard)}
                    </div>
                  ) : (
                    rows.map(renderRow)
                  )}
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
