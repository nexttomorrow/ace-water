'use client'

/**
 * 사이트 전역에서 쓰는 커스텀 Select.
 * - 네이티브 <select> 의 OS 드롭다운 대신 흰 배경 + 그림자의 팝오버 패널.
 * - 클릭/키보드 모두 지원 (↑↓ 이동, Enter 선택, Esc 닫기).
 * - 폼 제출은 hidden text input 으로 처리, required 검증 가능 (보이지 않게 절대 위치).
 *
 * 기본 사용:
 *   <Select name="x" required defaultValue="" options={[{value:'', label:'선택'}, ...]} />
 *
 * 컨트롤드:
 *   <Select value={v} onChange={setV} options={...} />
 */

import { useEffect, useId, useMemo, useRef, useState } from 'react'

export type SelectOption = {
  value: string
  label: string
  disabled?: boolean
}

type Props = {
  name?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
  /** 트리거 추가 클래스 — inputCls 등으로 다른 인풋과 높이 맞출 때 사용 */
  triggerClassName?: string
  /** 팝오버 최대 높이 (px). 기본 280. */
  maxPopoverHeight?: number
  id?: string
}

const baseTriggerCls =
  'flex w-full items-center justify-between rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-left text-[0.875rem] transition hover:border-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400'

export default function Select({
  name,
  value: controlledValue,
  defaultValue,
  onChange,
  options,
  placeholder = '선택',
  required,
  disabled,
  className,
  triggerClassName,
  maxPopoverHeight = 280,
  id,
}: Props) {
  const reactId = useId()
  const listboxId = id ?? `select-listbox-${reactId}`

  const [internal, setInternal] = useState<string>(defaultValue ?? '')
  const value = controlledValue !== undefined ? controlledValue : internal

  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const selectedIdx = useMemo(
    () => options.findIndex((o) => o.value === value),
    [options, value]
  )
  const selected = selectedIdx >= 0 ? options[selectedIdx] : null

  // 외부 클릭 닫기
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  // 키보드
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
        triggerRef.current?.focus()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIdx((i) => nextEnabled(options, i, +1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIdx((i) => nextEnabled(options, i, -1))
        return
      }
      if (e.key === 'Home') {
        e.preventDefault()
        setActiveIdx(nextEnabled(options, -1, +1))
        return
      }
      if (e.key === 'End') {
        e.preventDefault()
        setActiveIdx(nextEnabled(options, options.length, -1))
        return
      }
      if (e.key === 'Enter' || e.key === ' ') {
        if (activeIdx >= 0) {
          e.preventDefault()
          const opt = options[activeIdx]
          if (opt && !opt.disabled) commit(opt)
        }
        return
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, activeIdx, options])

  // 팝오버 열릴 때 active 가 화면에 보이도록
  useEffect(() => {
    if (!open) return
    const ul = listRef.current
    if (!ul) return
    const target =
      activeIdx >= 0 ? (ul.children[activeIdx] as HTMLElement | undefined) : null
    if (target) target.scrollIntoView({ block: 'nearest' })
  }, [open, activeIdx])

  const commit = (opt: SelectOption) => {
    if (controlledValue === undefined) setInternal(opt.value)
    onChange?.(opt.value)
    setOpen(false)
    triggerRef.current?.focus()
  }

  const toggleOpen = () => {
    if (disabled) return
    setOpen((o) => {
      const next = !o
      if (next) setActiveIdx(selectedIdx >= 0 ? selectedIdx : nextEnabled(options, -1, +1))
      return next
    })
  }

  return (
    <div ref={containerRef} className={`relative ${className ?? ''}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleOpen}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        className={`${baseTriggerCls} ${
          selected ? 'text-neutral-900' : 'text-neutral-400'
        } ${triggerClassName ?? ''}`}
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`ml-2 shrink-0 text-neutral-500 transition ${
            open ? 'rotate-180' : ''
          }`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* 폼 제출 + required 검증용 invisible 텍스트 인풋 */}
      {name && (
        <input
          type="text"
          name={name}
          required={required}
          value={value}
          onChange={() => {}}
          tabIndex={-1}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/2 h-px w-full -translate-y-1/2 opacity-0"
        />
      )}

      {/* 팝오버 */}
      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-activedescendant={
            activeIdx >= 0 ? `${listboxId}-opt-${activeIdx}` : undefined
          }
          tabIndex={-1}
          style={{ maxHeight: maxPopoverHeight }}
          className="absolute left-0 right-0 z-50 mt-1.5 overflow-y-auto rounded-lg border border-neutral-200 bg-white py-1 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.16)] ring-1 ring-black/5"
        >
          {options.map((opt, i) => {
            const active = i === activeIdx
            const isSelected = opt.value === value
            return (
              <li
                key={`${opt.value}-${i}`}
                id={`${listboxId}-opt-${i}`}
                role="option"
                aria-selected={isSelected}
                aria-disabled={opt.disabled || undefined}
              >
                <button
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => !opt.disabled && commit(opt)}
                  onMouseEnter={() => !opt.disabled && setActiveIdx(i)}
                  className={`flex w-full items-center justify-between gap-2 px-3.5 py-2 text-left text-[0.875rem] transition ${
                    opt.disabled
                      ? 'cursor-not-allowed text-neutral-300'
                      : isSelected
                        ? 'bg-blue-50/60 font-semibold text-blue-900'
                        : active
                          ? 'bg-neutral-100 text-neutral-900'
                          : 'text-neutral-700'
                  }`}
                >
                  <span className="truncate">
                    {opt.label || (
                      <span className="text-neutral-400">{placeholder}</span>
                    )}
                  </span>
                  {isSelected && !opt.disabled && (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0 text-blue-600"
                    >
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function nextEnabled(options: SelectOption[], from: number, dir: 1 | -1): number {
  const n = options.length
  if (n === 0) return -1
  let i = from
  for (let step = 0; step < n; step++) {
    i = (i + dir + n) % n
    if (!options[i]?.disabled) return i
  }
  return from
}
