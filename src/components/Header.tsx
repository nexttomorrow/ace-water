import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import MainNav, { type NavTopCategory } from './MainNav'
import type { Category } from '@/lib/types'

export default async function Header() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isAdmin = false
  let nickname: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, nickname')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.role === 'admin'
    nickname = profile?.nickname ?? null
  }

  // admin은 비활성 카테고리도 본다
  let categoryQuery = supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true })
  if (!isAdmin) categoryQuery = categoryQuery.eq('is_active', true)
  const { data: catData } = await categoryQuery

  // build tree
  const cats = (catData ?? []) as Category[]
  const tops: NavTopCategory[] = cats
    .filter((c) => c.parent_id === null)
    .map((top) => ({
      ...top,
      tiles: cats.filter((c) => c.parent_id === top.id && c.display_type === 'tile'),
      links: cats.filter((c) => c.parent_id === top.id && c.display_type === 'link'),
    }))

  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* Top utility bar */}
      <div className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto flex h-8 max-w-[1440px] items-center justify-end gap-5 px-6 text-[12px] text-neutral-600">
          {isAdmin && (
            <>
              <Link
                href="/admin"
                className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-3 py-1 text-[11px] font-semibold text-white hover:bg-black"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6z" />
                </svg>
                관리자
              </Link>
              <span className="text-neutral-300">|</span>
            </>
          )}
          <Link href="#" className="hover:text-black">공지사항</Link>
          <span className="text-neutral-300">|</span>
          <Link href="/board" className="hover:text-black">게시판</Link>
          <span className="text-neutral-300">|</span>
          <Link href="#" className="hover:text-black">고객지원</Link>
          <span className="text-neutral-300">|</span>
          <Link href="#" className="hover:text-black">비즈니스</Link>
        </div>
      </div>

      <MainNav
        categories={tops}
        isLoggedIn={!!user}
        isAdmin={isAdmin}
        nickname={nickname}
        email={user?.email ?? null}
      />
    </header>
  )
}
