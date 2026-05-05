import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import MainNav, { type NavTopCategory } from './MainNav'
import type { Category } from '@/lib/types'

export default async function Header() {
  const supabase = await createClient()

  const [{ data: userResult }, { data: catData }] = await Promise.all([
    supabase.auth.getUser().then((r) => ({ data: r.data })),
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true }),
  ])

  const user = userResult.user

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
          <Link href="/gallery" className="hover:text-black">갤러리</Link>
          <span className="text-neutral-300">|</span>
          <Link href="/board" className="hover:text-black">게시판</Link>
          <span className="text-neutral-300">|</span>
          <Link href="#" className="hover:text-black">고객지원</Link>
          <span className="text-neutral-300">|</span>
          <Link href="#" className="hover:text-black">비즈니스</Link>
          <span className="text-neutral-300">|</span>
          <Link href="#" className="hover:text-black">한국 / 한국어</Link>
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
