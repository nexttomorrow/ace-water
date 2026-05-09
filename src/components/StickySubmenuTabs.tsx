'use client'

/**
 * 서브페이지 배너 안의 탭 메뉴.
 * - 인라인 위치(배너 안)에 항상 노출.
 * - 사용자가 배너를 지나서 스크롤하면 헤더 바로 아래에 흰색 sticky 바로 따라 노출.
 *
 * 사이트 헤더 높이는 데스크탑 116px (top utility 48 + MainNav 68).
 * 모바일에서도 동일한 구조라 동일 값 사용.
 */

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { Category } from '@/lib/types'

const HEADER_HEIGHT_PX = 116

type Tone = 'light' | 'dark'

type Props = {
  items: Category[]
  activeHref: string
  tone: Tone
  className?: string
}

export default function StickySubmenuTabs({
  items,
  activeHref,
  tone,
  className,
}: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const obs = new IntersectionObserver(
      ([entry]) => {
        // 인라인 탭이 헤더 위로 빠져나간 시점부터 sticky 바 노출
        const passed =
          !entry.isIntersecting && entry.boundingClientRect.top < 0
        setStuck(passed)
      },
      {
        // 헤더 높이만큼 위에서 잘라낸 영역을 root 로 간주 → 헤더 아래로 빠져나가면 isIntersecting=false
        rootMargin: `-${HEADER_HEIGHT_PX}px 0px 0px 0px`,
        threshold: 0,
      }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <>
      {/* 인라인 (배너 내부) — 원래 위치 */}
      <div ref={sentinelRef} className={className}>
        <Tabs items={items} activeHref={activeHref} tone={tone} />
      </div>

      {/* sticky 클론 — 배너 지나면 헤더 바로 아래에 고정 */}
      <div
        aria-hidden={!stuck}
        className={`fixed inset-x-0 z-40 border-b border-neutral-200 bg-white/95 shadow-[0_4px_12px_-8px_rgba(0,0,0,0.18)] backdrop-blur transition ${
          stuck
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-2 opacity-0'
        }`}
        style={{ top: HEADER_HEIGHT_PX }}
      >
        <div className="mx-auto max-w-[1440px] overflow-x-auto px-6">
          <Tabs items={items} activeHref={activeHref} tone="dark" />
        </div>
      </div>
    </>
  )
}

function Tabs({
  items,
  activeHref,
  tone,
}: {
  items: Category[]
  activeHref: string
  tone: Tone
}) {
  const isActive = (href: string | null) =>
    !!href && (href === activeHref || activeHref.startsWith(href + '/'))

  const inactiveCls =
    tone === 'light'
      ? 'text-white/70 hover:text-white'
      : 'text-neutral-500 hover:text-neutral-900'
  const activeCls = tone === 'light' ? 'text-white' : 'text-neutral-900'
  const indicatorCls = tone === 'light' ? 'bg-white' : 'bg-neutral-900'

  return (
    <div className="flex flex-nowrap items-center gap-1">
      {items.map((c) => {
        const active = isActive(c.href)
        return (
          <Link
            key={c.id}
            href={c.href || '#'}
            className={`relative whitespace-nowrap px-4 py-3 text-[13px] font-medium transition md:text-[14px] ${
              active ? activeCls : inactiveCls
            }`}
          >
            {c.name}
            {active && (
              <span
                className={`absolute inset-x-3 -bottom-px h-[2px] ${indicatorCls}`}
              />
            )}
          </Link>
        )
      })}
    </div>
  )
}
