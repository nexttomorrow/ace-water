'use client'

import { useMemo, useState } from 'react'
import { DynamicIcon, iconNames, type IconName } from 'lucide-react/dynamic'
import { SUGGESTED_ICONS } from '@/lib/quickMenuIcons'

const MAX_RESULTS = 72

/**
 * lucide 아이콘 검색 피커 (controlled).
 * 검색어가 없으면 추천 아이콘을, 있으면 이름으로 필터해 보여줍니다.
 */
export default function QuickMenuIconPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (name: string) => void
}) {
  const [query, setQuery] = useState('')

  const nameSet = useMemo(() => new Set(iconNames as string[]), [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/\s+/g, '-')
    if (!q) {
      const suggested = SUGGESTED_ICONS.filter((n) => nameSet.has(n))
      // 선택된 아이콘이 추천 목록에 없으면 맨 앞에 노출
      if (value && !suggested.includes(value) && nameSet.has(value)) {
        return [value, ...suggested].slice(0, MAX_RESULTS)
      }
      return suggested.slice(0, MAX_RESULTS)
    }
    const matched: string[] = []
    for (const n of iconNames as string[]) {
      if (n.includes(q)) {
        matched.push(n)
        if (matched.length >= MAX_RESULTS) break
      }
    }
    return matched
  }, [query, nameSet, value])

  return (
    <div className="mt-1 rounded border border-neutral-300 bg-white p-2">
      <div className="relative">
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          placeholder="아이콘 검색 (영문 — 예: phone, map, star)"
          className="w-full rounded border border-neutral-200 bg-neutral-50 py-2 pl-8 pr-3 text-sm focus:border-neutral-400 focus:outline-none"
        />
      </div>

      {results.length === 0 ? (
        <p className="px-1 py-6 text-center text-[0.8125rem] text-neutral-400">
          검색 결과가 없어요. 다른 영문 키워드로 찾아보세요.
        </p>
      ) : (
        <div className="mt-2 grid max-h-52 grid-cols-6 gap-1 overflow-y-auto sm:grid-cols-9">
          {results.map((name) => {
            const active = name === value
            return (
              <button
                key={name}
                type="button"
                onClick={() => onChange(name)}
                title={name}
                aria-label={name}
                aria-pressed={active}
                className={`flex aspect-square items-center justify-center rounded transition ${
                  active
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
              >
                <DynamicIcon
                  name={name as IconName}
                  className="h-5 w-5"
                  strokeWidth={1.6}
                  fallback={() => <span className="inline-block h-5 w-5" />}
                />
              </button>
            )
          })}
        </div>
      )}
      {query.trim() && results.length >= MAX_RESULTS && (
        <p className="mt-1 px-1 text-[0.6875rem] text-neutral-400">
          결과가 많아요. 검색어를 더 구체적으로 입력하면 정확해져요.
        </p>
      )}
    </div>
  )
}
