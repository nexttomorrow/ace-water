'use client'

import { usePathname } from 'next/navigation'
import { logout } from '@/app/login/actions'
import { findActive } from './nav-items'

/**
 * 데스크톱 상단 바 — 현재 위치(그룹 › 페이지)와 로그아웃.
 * 페이지 자체의 h1 은 그대로 두고, 여기서는 "어디에 있는지" 만 얇게 표시합니다.
 */
export default function AdminHeader() {
  const pathname = usePathname()
  const active = findActive(pathname)

  return (
    <header className="sticky top-0 z-30 hidden h-14 items-center justify-between border-b border-neutral-200 bg-white/90 px-8 backdrop-blur lg:flex">
      <nav aria-label="현재 위치" className="flex items-center gap-2 text-[0.8125rem]">
        <span className="text-neutral-400">{active?.group.title ?? '어드민'}</span>
        {active && (
          <>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5 text-neutral-300"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
            <span className="font-semibold text-neutral-900">{active.item.label}</span>
          </>
        )}
      </nav>

      <form action={logout}>
        <button
          type="submit"
          className="rounded-lg px-3 py-1.5 text-[0.8125rem] font-medium text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
        >
          로그아웃
        </button>
      </form>
    </header>
  )
}
