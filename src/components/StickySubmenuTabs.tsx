'use client'

/**
 * 서브페이지 배너 안의 탭 메뉴.
 * - 인라인 위치(배너 안)에 항상 노출.
 * - 사용자가 인라인 탭을 지나서 스크롤하면 헤더 바로 아래에 흰색 sticky 바로 따라 노출.
 *
 * 헤더 총 높이는 Header 컴포넌트의 [--site-header-h] CSS 변수를 우선 참조.
 * 변수가 없을 경우 데스크탑 기준 fallback (112px) 사용.
 */

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { Category } from '@/lib/types'

const FALLBACK_HEADER_H = 112

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
  const [headerH, setHeaderH] = useState<number>(FALLBACK_HEADER_H)

  useEffect(() => {
    // 헤더 CSS 변수 동적 측정 (반응형 변동 가능)
    const readHeader = () => {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue('--site-header-h')
        .trim()
      const parsed = parseFloat(v)
      if (Number.isFinite(parsed) && parsed > 0) {
        setHeaderH(parsed)
        return
      }
      // 변수가 :root 가 아니라 <header> 에만 있을 수 있어 직접 탐색 폴백
      const headerEl = document.querySelector('header')
      if (headerEl) {
        setHeaderH(headerEl.getBoundingClientRect().height || FALLBACK_HEADER_H)
      }
    }

    readHeader()

    // 스크롤·리사이즈 동기화 — getBoundingClientRect 로 직접 비교 (가장 안정적)
    let ticking = false
    const onScrollOrResize = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const el = sentinelRef.current
        const headerEl = document.querySelector('header')
        const h = headerEl?.getBoundingClientRect().height ?? headerH
        if (h !== headerH) setHeaderH(h)
        if (el) {
          const rect = el.getBoundingClientRect()
          // 인라인 탭의 하단이 헤더 아래로 빠져나가면(=헤더 라인 위로 올라가면) sticky 노출
          setStuck(rect.bottom < h)
        }
        ticking = false
      })
    }

    onScrollOrResize()
    window.addEventListener('scroll', onScrollOrResize, { passive: true })
    window.addEventListener('resize', onScrollOrResize)
    return () => {
      window.removeEventListener('scroll', onScrollOrResize)
      window.removeEventListener('resize', onScrollOrResize)
    }
    // headerH 는 의도적으로 deps 에서 제외 — 내부에서 갱신
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {/* 인라인 (배너 내부) */}
      <div ref={sentinelRef} className={className}>
        <Tabs items={items} activeHref={activeHref} tone={tone} />
      </div>

      {/* sticky 클론 — 배너 지나면 헤더 바로 아래에 고정 */}
      <div
        aria-hidden={!stuck}
        style={{ top: headerH }}
        className={`fixed inset-x-0 z-40 border-b border-neutral-200 bg-white/95 shadow-[0_4px_16px_-10px_rgba(0,0,0,0.18)] backdrop-blur transition duration-200 ${
          stuck
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-2 opacity-0'
        }`}
      >
        <div className="mx-auto max-w-[1440px] overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
      ? 'text-white/85 hover:text-white'
      : 'text-neutral-600 hover:text-neutral-900'
  const activeCls = tone === 'light' ? 'text-white' : 'text-neutral-900'
  const indicatorCls = tone === 'light' ? 'bg-white' : 'bg-neutral-900'

  return (
    <div className="-ml-4 flex flex-nowrap items-center gap-0.5">
      {items.map((c) => {
        const active = isActive(c.href)
        return (
          <Link
            key={c.id}
            href={c.href || '#'}
            className={`relative whitespace-nowrap px-4 py-3 text-[1rem] font-medium transition ${
              active ? activeCls : inactiveCls
            }`}
          >
            {c.name}
            {active && (
              <span
                className={`absolute inset-x-3 -bottom-px h-[2px] rounded-full ${indicatorCls}`}
              />
            )}
          </Link>
        )
      })}
    </div>
  )
}
