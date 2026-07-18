'use client'

import { useEffect, useRef, useState } from 'react'
import {
  CLIENT_LOGO_CARD_HEIGHT,
  CLIENT_LOGO_CARD_WIDTH,
  CLIENT_LOGO_ROWS,
  CLIENT_LOGO_SLIDE_MIN,
} from '@/lib/types'

/** 마퀴 행 하나에 렌더할 로고 (표시에 필요한 값만) */
export type MarqueeLogo = {
  id: number
  name: string
  /** 이미지 public URL */
  src: string
  /** 클릭 시 이동 링크 (없으면 링크 없음) */
  href: string | null
}

/** 카드 한 장이 차지하는 폭 = 카드(200) + 좌우 마진(mx-3 = 12*2) */
const CARD_TOTAL_WIDTH = CLIENT_LOGO_CARD_WIDTH + 24

/** 마퀴 행별 스크롤 방향/속도 — 기존 디자인 유지 (좌/우 번갈아, 속도 차등) */
const ROW_DIRECTIONS: Array<'left' | 'right'> = ['left', 'right', 'left']
const ROW_DURATIONS = [48, 42, 54]

type Layout = {
  rows: MarqueeLogo[][]
  /** true면 각 행을 무한 슬라이드, false면 정적(가운데 정렬)으로 표시 */
  animate: boolean
}

/** items 를 size 개씩 순서대로 잘라 행으로 나눔 (한 줄을 채우고 다음 줄로) */
function chunk(items: MarqueeLogo[], size: number): MarqueeLogo[][] {
  const rows: MarqueeLogo[][] = []
  for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size))
  return rows
}

/** items 를 parts 개 행에 최대한 균등하게 분배 (슬라이드용) */
function splitEven(items: MarqueeLogo[], parts: number): MarqueeLogo[][] {
  const per = Math.ceil(items.length / parts)
  const rows: MarqueeLogo[][] = []
  for (let i = 0; i < items.length; i += per) rows.push(items.slice(i, i + per))
  return rows
}

/**
 * 화면 폭 기준으로 배치를 결정.
 * - 로고가 CLIENT_LOGO_SLIDE_MIN(8) 미만이고 3줄 안에 다 담기면 → 정적 배치
 *   (한 줄에 차는 만큼만, 안 채워도 늘리지 않고 가운데 정렬. 넘치면 다음 줄로).
 * - 8개 이상이거나(요청 정책) 3줄로도 못 담을 만큼 많으면 → 3줄로 나눠 무한 슬라이드.
 */
function computeLayout(logos: MarqueeLogo[], width: number): Layout {
  const perRow = Math.max(1, Math.floor(width / CARD_TOTAL_WIDTH))
  const staticCapacity = perRow * CLIENT_LOGO_ROWS

  const animate = logos.length >= CLIENT_LOGO_SLIDE_MIN || logos.length > staticCapacity
  if (!animate) {
    return { rows: chunk(logos, perRow), animate: false }
  }
  return { rows: splitEven(logos, CLIENT_LOGO_ROWS), animate: true }
}

/** 슬라이드 행이 화면보다 좁아 이음새가 생기지 않도록, perRow 를 초과하도록 세트를 반복 */
function fillOverflow(items: MarqueeLogo[], perRow: number): MarqueeLogo[] {
  if (items.length === 0) return items
  const out = [...items]
  while (out.length <= perRow) out.push(...items)
  return out
}

function LogoCard({ logo }: { logo: MarqueeLogo }) {
  const card = (
    <div
      className="group/logo relative mx-3 flex h-[84px] w-[200px] shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-white opacity-60 grayscale transition duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.03] hover:opacity-100 hover:grayscale-0 hover:border-neutral-300 hover:shadow-md hover:shadow-neutral-300/40"
      title={logo.name}
    >
      {/* 이상한 비율의 이미지도 카드(200×84)를 꽉 채우도록 object-cover 로 크롭 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logo.src}
        alt={logo.name}
        width={CLIENT_LOGO_CARD_WIDTH}
        height={CLIENT_LOGO_CARD_HEIGHT}
        className="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
        draggable={false}
      />
      {/* 마우스 올리면 타이틀(이름) 표시 */}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/75 to-transparent px-2 pb-1.5 pt-5 text-center text-[0.75rem] font-semibold text-white opacity-0 transition-opacity duration-300 group-hover/logo:opacity-100">
        {logo.name}
      </span>
    </div>
  )

  if (logo.href) {
    return (
      <a
        href={logo.href}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={logo.name}
        className="shrink-0"
      >
        {card}
      </a>
    )
  }
  return card
}

/** 정적 행 — 슬라이드 없이 가운데 정렬. 화면 안에 다 들어가는 경우. */
function StaticRow({ items }: { items: MarqueeLogo[] }) {
  if (items.length === 0) return null
  return (
    <div className="flex flex-wrap items-center justify-center py-2">
      {items.map((logo) => (
        <LogoCard key={logo.id} logo={logo} />
      ))}
    </div>
  )
}

/** 슬라이드 행 — 무한 스크롤 (마우스오버 시 정지). 화면을 넘칠 만큼 로고가 많은 경우. */
function MarqueeRow({
  items,
  direction,
  duration,
  perRow,
}: {
  items: MarqueeLogo[]
  direction: 'left' | 'right'
  duration: number
  perRow: number
}) {
  const filled = fillOverflow(items, perRow)
  if (filled.length === 0) return null
  const animationName = direction === 'left' ? 'aw-marquee-left' : 'aw-marquee-right'
  // 앞뒤 동일 세트 2벌 → 0%~-50% 애니메이션이 이음새 없이 반복
  const track = [...filled, ...filled]
  return (
    <div
      className="group/row relative overflow-hidden py-2"
      style={{
        WebkitMaskImage:
          'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
        maskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
      }}
    >
      <div
        className="flex w-max group-hover/row:[animation-play-state:paused]"
        style={{ animation: `${animationName} ${duration}s linear infinite` }}
      >
        {track.map((logo, i) => (
          <LogoCard key={`${logo.id}-${i}`} logo={logo} />
        ))}
      </div>
    </div>
  )
}

/**
 * 고객사 로고 마퀴 — 어드민에서 등록한 로고를 노출.
 * 로고가 화면 폭을 넘칠 만큼 많아지면 최대 3줄로 나눠 좌/우 무한 슬라이드하고,
 * 그전에는 한 줄에 차는 만큼만 놓고(넘치면 다음 줄로, 최대 3줄) 정적으로 가운데 정렬한다.
 * 마우스오버 시 슬라이드 정지 + 로고 강조(컬러/부양) 인터랙션은 그대로 유지.
 */
export default function ClientsMarquee({ logos }: { logos: MarqueeLogo[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => setWidth(el.clientWidth)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  if (logos.length === 0) return null

  // 폭 측정 전(초기 렌더/SSR): 늘리지 않고 가운데 정렬로만 노출 (레이아웃 시프트 최소화)
  const layout: Layout =
    width > 0 ? computeLayout(logos, width) : { rows: [logos], animate: false }
  const perRow = Math.max(1, Math.floor(width / CARD_TOTAL_WIDTH))

  return (
    <div ref={containerRef} className="space-y-3">
      {layout.animate && (
        <style>{`
          @keyframes aw-marquee-left {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
          @keyframes aw-marquee-right {
            from { transform: translateX(-50%); }
            to { transform: translateX(0); }
          }
        `}</style>
      )}
      {layout.rows.map((rowItems, i) =>
        layout.animate ? (
          <MarqueeRow
            key={i}
            items={rowItems}
            direction={ROW_DIRECTIONS[i % ROW_DIRECTIONS.length]}
            duration={ROW_DURATIONS[i % ROW_DURATIONS.length]}
            perRow={perRow}
          />
        ) : (
          <StaticRow key={i} items={rowItems} />
        )
      )}
    </div>
  )
}
