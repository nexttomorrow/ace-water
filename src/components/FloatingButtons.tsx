'use client'

import { useEffect, useState } from 'react'

type MenuItem = {
  label: string
  href: string
  icon: React.ReactNode
  /** true 면 새 탭으로 (외부 링크) */
  external?: boolean
  /** href 가 없는 placeholder (예: 카탈로그 PDF 미첨부) */
  comingSoon?: boolean
}

const iconClass = 'h-5 w-5'
const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const MENU_ITEMS: MenuItem[] = [
  {
    label: '견적문의',
    href: '/design-estimate',
    icon: (
      <svg viewBox="0 0 24 24" className={iconClass} {...stroke}>
        <path d="M4 4h13l3 3v13H4z" />
        <path d="M8 9h8M8 13h8M8 17h5" />
      </svg>
    ),
  },
  {
    // TODO: PDF 파일 업로드 후 href 를 해당 PDF 경로로 교체.
    //       예: '/catalog/acewater-2026.pdf' + external: true (새 탭)
    label: '카탈로그',
    href: '#',
    comingSoon: true,
    icon: (
      <svg viewBox="0 0 24 24" className={iconClass} {...stroke}>
        <path d="M4 5a2 2 0 0 1 2-2h6v18H6a2 2 0 0 1-2-2z" />
        <path d="M20 5a2 2 0 0 0-2-2h-6v18h6a2 2 0 0 0 2-2z" />
      </svg>
    ),
  },
  {
    label: 'AS센터',
    href: '/as',
    icon: (
      <svg viewBox="0 0 24 24" className={iconClass} {...stroke}>
        <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-2.5z" />
      </svg>
    ),
  },
  {
    label: 'BLOG',
    href: 'https://blog.naver.com/aw5000',
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" className={iconClass} {...stroke}>
        <path d="M4 5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
        <path d="M14 3v6h6" />
      </svg>
    ),
  },
  {
    label: '에이스아트',
    href: 'https://www.ace-art.net/',
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" className={iconClass} {...stroke}>
        <path d="M3 12L12 4l9 8" />
        <path d="M5 11v9h14v-9" />
        <path d="M10 20v-5h4v5" />
      </svg>
    ),
  },
]

export default function FloatingButtons() {
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <>
      {/* 우측 세로 중앙 - 퀵메뉴 */}
      <aside
        className="pointer-events-none fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 lg:block"
        aria-label="빠른 메뉴"
      >
        <ul className="pointer-events-auto flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white/95 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur">
          {MENU_ITEMS.map((item) => {
            const baseCls =
              'group relative flex w-[88px] flex-col items-center gap-1.5 px-2 py-3.5 text-neutral-700 transition'
            const interactiveCls = 'hover:bg-neutral-900 hover:text-white'
            const disabledCls = 'cursor-not-allowed opacity-60'
            return (
              <li key={item.label} className="border-b border-neutral-100 last:border-b-0">
                {item.comingSoon ? (
                  <button
                    type="button"
                    aria-label={`${item.label} (준비중)`}
                    title="준비중"
                    disabled
                    className={`${baseCls} ${disabledCls}`}
                  >
                    <span className="text-neutral-400">{item.icon}</span>
                    <span className="whitespace-nowrap text-[0.75rem] font-semibold tracking-tight">
                      {item.label}
                    </span>
                    <span className="absolute right-1.5 top-1.5 rounded-full bg-neutral-100 px-1.5 py-0.5 text-[0.75rem] font-medium text-neutral-500">
                      준비중
                    </span>
                  </button>
                ) : (
                  <a
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noreferrer noopener' : undefined}
                    className={`${baseCls} ${interactiveCls}`}
                  >
                    <span className="text-neutral-500 transition group-hover:text-white">
                      {item.icon}
                    </span>
                    <span className="whitespace-nowrap text-[0.75rem] font-semibold tracking-tight">
                      {item.label}
                    </span>
                  </a>
                )}
              </li>
            )
          })}
        </ul>
      </aside>

      {/* 우측 하단 - 탑버튼 */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="맨 위로 이동"
        className={`fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-black hover:shadow-xl ${
          showTop
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-2 opacity-0'
        }`}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 19V5" />
          <path d="m6 11 6-6 6 6" />
        </svg>
      </button>
    </>
  )
}
