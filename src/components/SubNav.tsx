'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { NavTopCategory } from './MainNav'

export default function SubNav({ tops }: { tops: NavTopCategory[] }) {
  const pathname = usePathname()

  if (pathname === '/' || pathname.startsWith('/admin')) return null

  const matches = (href: string | null | undefined) =>
    !!href && href !== '#' && (pathname === href || pathname.startsWith(href + '/'))

  let activeGroup: NavTopCategory | null = null
  for (const top of tops) {
    const children = [...top.tiles, ...top.texts, ...top.links]
    if (matches(top.href) || children.some((c) => matches(c.href))) {
      activeGroup = top
      break
    }
  }

  if (!activeGroup) return null

  const tabs = [...activeGroup.tiles, ...activeGroup.texts, ...activeGroup.links].filter(
    (c) => c.href && c.href !== '#'
  )
  if (tabs.length === 0) return null

  return (
    <nav className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-[1440px] px-6">
        <div className="flex h-12 items-center gap-1 overflow-x-auto">
          <span className="mr-3 shrink-0 text-[13px] font-bold text-neutral-900">
            {activeGroup.name}
          </span>
          {tabs.map((c) => {
            const active = matches(c.href)
            return (
              <Link
                key={c.id}
                href={c.href || '#'}
                className={
                  'relative whitespace-nowrap px-4 py-2 text-[13px] font-medium transition ' +
                  (active ? 'text-black' : 'text-neutral-500 hover:text-black')
                }
              >
                {c.name}
                {active && (
                  <span className="absolute inset-x-3 -bottom-px h-[2px] bg-black" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
