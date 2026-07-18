'use client'

/**
 * 히어로 슬라이드 표시 시간(속도) 입력 — 레인지 슬라이더 + 프리셋.
 *
 * 값은 hidden input(`name`)에 ms 단위로 담겨 서버 액션으로 전송됩니다.
 * UI 는 초 단위로 보여주되, 슬라이더 step 은 0.5초.
 */

import { useState } from 'react'
import {
  HERO_DURATION_DEFAULT_MS,
  HERO_DURATION_MIN_MS,
  HERO_DURATION_MAX_MS,
} from '@/lib/types'

const STEP_MS = 500

const PRESETS: { label: string; ms: number }[] = [
  { label: '빠르게', ms: 3000 },
  { label: '보통', ms: 5000 },
  { label: '느리게', ms: 8000 },
]

function fmtSeconds(ms: number): string {
  const s = ms / 1000
  return Number.isInteger(s) ? `${s}` : s.toFixed(1)
}

export default function HeroDurationField({
  name = 'duration_ms',
  defaultValueMs = HERO_DURATION_DEFAULT_MS,
}: {
  name?: string
  defaultValueMs?: number
}) {
  const [ms, setMs] = useState(() => {
    const v = Math.round(defaultValueMs)
    if (!Number.isFinite(v)) return HERO_DURATION_DEFAULT_MS
    return Math.min(HERO_DURATION_MAX_MS, Math.max(HERO_DURATION_MIN_MS, v))
  })

  return (
    <div className="mt-1 rounded border border-neutral-300 bg-white px-3 py-3">
      <input type="hidden" name={name} value={ms} />

      <div className="flex items-baseline justify-between">
        <span className="text-[0.8125rem] text-neutral-600">한 장이 머무는 시간</span>
        <span className="font-mono text-[0.9375rem] font-semibold text-neutral-900">
          {fmtSeconds(ms)}초
        </span>
      </div>

      <input
        type="range"
        min={HERO_DURATION_MIN_MS}
        max={HERO_DURATION_MAX_MS}
        step={STEP_MS}
        value={ms}
        onChange={(e) => setMs(Number(e.currentTarget.value))}
        aria-label="슬라이드 표시 시간(초)"
        className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-neutral-900"
      />

      <div className="mt-1 flex justify-between text-[0.6875rem] text-neutral-400">
        <span>빠름 {fmtSeconds(HERO_DURATION_MIN_MS)}초</span>
        <span>느림 {fmtSeconds(HERO_DURATION_MAX_MS)}초</span>
      </div>

      <div className="mt-2.5 flex gap-1.5">
        {PRESETS.map((p) => {
          const active = p.ms === ms
          return (
            <button
              key={p.ms}
              type="button"
              onClick={() => setMs(p.ms)}
              className={`flex-1 rounded border px-2 py-1.5 text-[0.75rem] font-medium transition ${
                active
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {p.label}
              <span className={active ? 'text-white/70' : 'text-neutral-400'}>
                {' '}
                {fmtSeconds(p.ms)}초
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
