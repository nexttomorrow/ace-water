'use client'

import { useState } from 'react'
import { TAG_TONE_BADGE_CLS, type Tag } from '@/lib/types'

type Props = {
  /** 어드민이 선택할 수 있는 태그 풀 */
  options: Pick<Tag, 'value' | 'label' | 'tone'>[]
  /** form 에 제출될 input name */
  name: string
  /** 초기 선택값 (value 배열) */
  initial?: string[]
  /** 라벨 위 helper 텍스트 */
  hint?: string
}

export default function TagPicker({ options, name, initial = [], hint }: Props) {
  const [selected, setSelected] = useState<string[]>(initial)

  const toggle = (v: string) =>
    setSelected((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]))

  if (options.length === 0) {
    return (
      <p className="rounded border border-dashed border-neutral-300 bg-neutral-50 px-3 py-2 text-[0.75rem] text-neutral-500">
        선택 가능한 태그가 없습니다.{' '}
        <a href="/mng/tags" className="text-blue-600 hover:underline">
          /mng/tags
        </a>{' '}
        에서 먼저 등록해주세요.
      </p>
    )
  }

  return (
    <div>
      {hint && <p className="mb-2 text-[0.6875rem] text-neutral-500">{hint}</p>}
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const checked = selected.includes(opt.value)
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`inline-flex items-center rounded-full px-3 py-1.5 text-[0.75rem] font-bold tracking-wider transition ${
                checked
                  ? TAG_TONE_BADGE_CLS[opt.tone]
                  : 'border border-neutral-200 bg-white text-neutral-500 hover:border-neutral-400 hover:text-neutral-900'
              }`}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
      {/* form 제출용 hidden inputs */}
      {selected.map((v) => (
        <input key={v} type="hidden" name={name} value={v} />
      ))}
    </div>
  )
}
