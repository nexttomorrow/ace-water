'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { logout } from '@/app/login/actions'
import type { Category } from '@/lib/types'

export type NavTopCategory = Category & {
  tiles: Category[]
  texts: Category[]
  links: Category[]
}

type Props = {
  categories: NavTopCategory[]
  isLoggedIn: boolean
  isAdmin: boolean
  nickname: string | null
  email: string | null
}

export default function MainNav({ categories, isLoggedIn, isAdmin, nickname, email }: Props) {
  const [activeId, setActiveId] = useState<number | null>(null)
  const [displayedId, setDisplayedId] = useState<number | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [expandedMobileId, setExpandedMobileId] = useState<number | null>(null)
  const active = categories.find((c) => c.id === activeId) ?? null
  const displayed = categories.find((c) => c.id === displayedId) ?? null
  const hasMega =
    active && (active.tiles.length > 0 || active.texts.length > 0 || active.links.length > 0)
  const hasDisplayedMega =
    displayed &&
    (displayed.tiles.length > 0 || displayed.texts.length > 0 || displayed.links.length > 0)
  const isPanelOpen = Boolean(hasMega)

  useEffect(() => {
    if (activeId !== null) {
      setDisplayedId(activeId)
      return
    }
    const t = setTimeout(() => setDisplayedId(null), 250)
    return () => clearTimeout(t)
  }, [activeId])

  const imageUrl = (path: string) =>
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/categories/${path}`

  // 상위메뉴 클릭 시 갈 곳: 자식이 있으면 가장 먼저 정렬된 자식의 href, 없으면 자기 href.
  const effectiveHref = (c: NavTopCategory) => {
    const all = [...c.tiles, ...c.texts, ...c.links]
      .filter((ch) => ch.href && ch.href !== '#')
      .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)
    if (all.length > 0) return all[0].href as string
    return c.href || '#'
  }

  return (
    <div
      className="relative border-b border-neutral-200 bg-white"
      onMouseLeave={() => setActiveId(null)}
    >
      <style>{`
        @keyframes slideDownFade {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-down {
          animation: slideDownFade 0.25s ease-out forwards;
        }
      `}</style>

      <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-6">
        <Link href="/" className="shrink-0" onMouseEnter={() => setActiveId(null)}>
          <span className="text-[22px] font-extrabold tracking-tight text-black">ACEWATER</span>
        </Link>

        <nav className="ml-6 hidden flex-1 items-center min-[1022px]:flex">
          {categories.length === 0 ? (
            <div className="px-5 py-3 text-[0.875rem] text-neutral-400">
              {isAdmin ? '메뉴를 추가해주세요' : '메뉴 준비 중'}
            </div>
          ) : (
            <ul className="flex items-center gap-1 text-[1rem] font-medium text-neutral-800">
              {categories.map((c) => {
                const childCount = c.tiles.length + c.texts.length + c.links.length
                const isActive = activeId === c.id
                const dimmed = isAdmin && c.is_active === false
                return (
                  <li key={c.id} onMouseEnter={() => setActiveId(c.id)}>
                    <Link
                      href={effectiveHref(c)}
                      className={`relative block px-5 py-3 transition-colors ${
                        dimmed ? 'text-neutral-400' : isActive ? 'text-black' : 'hover:text-black'
                      }`}
                      title={dimmed ? '비활성 (관리자에게만 보임)' : undefined}
                    >
                      {c.name}
                      {childCount > 0 && (
                        <span
                          className={`absolute bottom-0 left-5 right-5 h-[2px] origin-center bg-blue-600 transition-transform duration-300 ease-out ${
                            isActive ? 'scale-x-100' : 'scale-x-0'
                          }`}
                        />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}

          {isAdmin && (
            <Link
              href="/admin/categories/new"
              onMouseEnter={() => setActiveId(null)}
              className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[12px] font-semibold text-neutral-900 shadow-lg ring-1 ring-neutral-200 transition hover:bg-neutral-50"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
              카테고리 등록
            </Link>
          )}
        </nav>

        <div
          className="flex shrink-0 items-center gap-1 text-neutral-700"
          onMouseEnter={() => setActiveId(null)}
        >
          {/* 햄버거 버튼 (모바일) */}
          <button
            aria-label="메뉴"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-100 min-[1022px]:hidden"
          >
            <div className="relative flex h-6 w-6 items-center justify-center">
              <svg
                width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className={`absolute transition-all duration-300 ${isMobileMenuOpen ? 'scale-0 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'}`}
              >
                <path d="M4 12h16M4 6h16M4 18h16" />
              </svg>
              <svg
                width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className={`absolute transition-all duration-300 ${isMobileMenuOpen ? 'scale-100 rotate-0 opacity-100' : 'scale-0 -rotate-90 opacity-0'}`}
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </div>
          </button>

          <button
            aria-label="검색"
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-100"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </button>

          {isLoggedIn ? (
            <>
              <span className="hidden items-center gap-2 px-3 py-2 text-[0.875rem] text-neutral-700 sm:flex">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
                </svg>
                {nickname ?? email?.split('@')[0]}
              </span>
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-full px-3 py-2 text-[0.875rem] text-neutral-700 hover:bg-neutral-100"
                >
                  로그아웃
                </button>
              </form>
            </>
          ) : null}
        </div>
      </div>

      {/* MOBILE PANEL */}
      {isMobileMenuOpen && (
        <div className="absolute left-0 right-0 top-full z-40 flex max-h-[calc(100vh-68px)] flex-col overflow-y-auto border-t border-neutral-200 bg-white shadow-2xl min-[1022px]:hidden animate-slide-down">
          <ul className="flex flex-col px-6 py-4">
            {categories.length === 0 && (
              <div className="py-4 text-[0.875rem] text-neutral-400">
                {isAdmin ? '메뉴를 추가해주세요' : '메뉴 준비 중'}
              </div>
            )}
            {categories.map((c) => {
              const hasChildren = c.tiles.length > 0 || c.texts.length > 0 || c.links.length > 0
              const isExpanded = expandedMobileId === c.id

              return (
                <li key={c.id} className="border-b border-neutral-100 last:border-none">
                  <div className="flex items-center justify-between py-4">
                    <Link
                      href={effectiveHref(c)}
                      className="text-[1rem] font-bold text-neutral-900"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {c.name}
                    </Link>
                    {hasChildren && (
                      <button
                        onClick={() => setExpandedMobileId(isExpanded ? null : c.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-50 text-neutral-500 transition-colors hover:bg-neutral-100"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {isExpanded && hasChildren && (
                    <div className="mb-4 flex flex-col gap-2 rounded-lg bg-neutral-50 px-4 py-3 text-[0.875rem] text-neutral-700 animate-slide-down">
                      {[...c.texts, ...c.tiles, ...c.links].map((child) => (
                        <Link
                          key={child.id}
                          href={child.href || '#'}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="py-1.5 hover:text-black"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
          <div className="border-t border-neutral-100 bg-neutral-50 px-6 py-6 pb-12">
            {isLoggedIn ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-[0.875rem] font-medium text-neutral-800">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
                  </svg>
                  {nickname ?? email?.split('@')[0]} 님
                </div>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="inline-flex w-fit items-center gap-1 rounded-full bg-neutral-900 px-4 py-2 text-[0.875rem] font-semibold text-white"
                  >
                    관리자 페이지
                  </Link>
                )}
                <form action={logout}>
                  <button
                    type="submit"
                    className="text-[0.875rem] text-neutral-500 hover:text-black hover:underline"
                  >
                    로그아웃
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* MEGA PANEL (Desktop Only) */}
      {displayed && hasDisplayedMega && (
        <div
          className={`absolute left-0 right-0 top-full z-40 hidden overflow-hidden border-t border-neutral-200 bg-white shadow-[0_12px_24px_-12px_rgba(0,0,0,0.15)] transition-[opacity,transform] duration-300 ease-out min-[1022px]:block ${
            isPanelOpen
              ? 'translate-y-0 opacity-100'
              : 'pointer-events-none -translate-y-2 opacity-0'
          }`}
          onMouseEnter={() => setActiveId(displayed.id)}
        >
          <>
            {/* text tabs row (admin-nav style, full-width border) */}
            {displayed.texts.length > 0 && (
              <div className="border-b border-neutral-200">
                <div className="mx-auto max-w-[1440px] px-6">
                  <div className="flex h-12 items-center gap-1 overflow-x-auto">
                    {displayed.texts.map((t) => (
                      <Link
                        key={t.id}
                        href={t.href || '#'}
                        className="relative whitespace-nowrap px-4 py-2 text-[0.875rem] font-medium text-neutral-500 transition hover:text-black"
                      >
                        {t.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {(displayed.tiles.length > 0 || displayed.links.length > 0) && (
              <div className="mx-auto max-w-[1440px] px-6 py-10">
                <div className={displayed.links.length > 0 ? 'grid grid-cols-12 gap-10' : ''}>
                  {/* tile grid */}
                  {displayed.tiles.length > 0 && (
                    <div
                      className={
                        displayed.links.length > 0 ? 'col-span-12 md:col-span-9' : 'w-full'
                      }
                    >
                      <div className="grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7">
                        {displayed.tiles.map((t) => (
                          <Link
                            key={t.id}
                            href={t.href || '#'}
                            className="group flex flex-col items-center text-center"
                          >
                            <div className="flex h-[88px] w-[88px] items-center justify-center overflow-hidden rounded-md bg-neutral-50 transition group-hover:bg-neutral-100">
                              {t.image_path ? (
                                <Image
                                  src={imageUrl(t.image_path)}
                                  alt={t.name}
                                  width={88}
                                  height={88}
                                  className="h-full w-full object-contain"
                                  unoptimized
                                />
                              ) : (
                                <div className="text-[10px] text-neutral-400">no image</div>
                              )}
                            </div>
                            <p className="mt-3 text-[0.875rem] font-medium text-neutral-800 group-hover:text-black">
                              {t.name}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* link list */}
                  {displayed.links.length > 0 && (
                    <div
                      className={
                        displayed.tiles.length > 0
                          ? 'col-span-12 border-t border-neutral-200 pt-6 md:col-span-3 md:border-l md:border-t-0 md:pl-10 md:pt-0'
                          : 'w-full'
                      }
                    >
                      <h4 className="mb-4 text-[0.875rem] font-semibold text-neutral-500">더 알아보기</h4>
                      <ul className="space-y-3">
                        {displayed.links.map((l) => (
                          <li key={l.id}>
                            <Link
                              href={l.href || '#'}
                              className="text-[14px] text-neutral-800 hover:text-black hover:underline"
                            >
                              {l.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        </div>
      )}
    </div>
  )
}
