'use client'

import { useEffect, useState } from 'react'
import type { IconNode } from '@/lib/quickMenuIconNode'
import QuickMenuNodeIcon from '@/components/QuickMenuNodeIcon'

export type QuickMenuView = {
  id: number
  title: string
  href: string
  iconNode: IconNode | null
  external: boolean
}

const COLLAPSE_KEY = 'quickMenuCollapsed'

export default function FloatingButtons({ quickMenu }: { quickMenu: QuickMenuView[] }) {
  const [showTop, setShowTop] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // 접힘 상태 복원 (페이지 이동해도 유지) — 마운트 후 다음 프레임에 반영해 hydration 불일치 방지
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === '1')
      } catch {
        /* localStorage 접근 불가 시 무시 */
      }
    })
    return () => cancelAnimationFrame(id)
  }, [])

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev
      try {
        window.localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0')
      } catch {
        /* 무시 */
      }
      return next
    })
  }

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const hasMenu = quickMenu.length > 0

  return (
    <>
      {/* 우측 세로 중앙 - 퀵메뉴 */}
      {hasMenu && (
        <aside
          className="pointer-events-none fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 lg:block"
          aria-label="빠른 메뉴"
        >
          {collapsed ? (
            // 접힌 상태 — 일반적인 원형 펼치기 버튼
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label="퀵메뉴 펼치기"
              title="퀵메뉴 펼치기"
              className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-neutral-200 bg-white/95 text-neutral-700 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur transition hover:bg-neutral-900 hover:text-white"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          ) : (
            <div className="pointer-events-auto overflow-hidden rounded-2xl border border-neutral-200 bg-white/95 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur">
              {/* 접기 핸들 */}
              <button
                type="button"
                onClick={toggleCollapsed}
                aria-label="퀵메뉴 접기"
                title="접기"
                className="flex w-full items-center justify-center border-b border-neutral-100 py-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 15l6-6 6 6" />
                </svg>
              </button>

              <ul className="flex flex-col">
                {quickMenu.map((item) => (
                  <li key={item.id} className="border-b border-neutral-100 last:border-b-0">
                    <a
                      href={item.href}
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noreferrer noopener' : undefined}
                      className="group relative flex w-[88px] flex-col items-center gap-1.5 px-2 py-3.5 text-neutral-700 transition hover:bg-neutral-900 hover:text-white"
                    >
                      <span className="text-neutral-500 transition group-hover:text-white">
                        <QuickMenuNodeIcon node={item.iconNode} />
                      </span>
                      <span className="whitespace-pre-line break-keep text-center text-[0.75rem] font-semibold leading-tight tracking-tight">
                        {item.title}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      )}

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
