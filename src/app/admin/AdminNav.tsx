'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { label: '대시보드', href: '/admin' },
  { label: '메인 슬라이드', href: '/admin/hero' },
  { label: '카테고리', href: '/admin/categories' },
  { label: '서브페이지 배너', href: '/admin/subpages' },
  { label: '제품', href: '/admin/products' },
  { label: '시공사례', href: '/admin/gallery' },
  { label: '견적문의', href: '/admin/estimates' },
  { label: '게시판', href: '/admin/board' },
]

export default function AdminNav() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <nav className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-[1440px] px-6">
        <div className="flex h-12 items-center gap-1 overflow-x-auto">
          {tabs.map((t) => {
            const active = isActive(t.href)
            return (
              <Link
                key={t.href}
                href={t.href}
                className={
                  'relative whitespace-nowrap px-4 py-2 text-[13px] font-medium transition ' +
                  (active
                    ? 'text-black'
                    : 'text-neutral-500 hover:text-black')
                }
              >
                {t.label}
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
