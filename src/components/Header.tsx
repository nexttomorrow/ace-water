import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import MainNav, { type NavTopCategory } from './MainNav'
import NoticeTicker, { type TickerNotice } from './NoticeTicker'
import { applyProductCategoryHrefs } from '@/lib/products'
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

  // build tree (제품안내 자식들의 href를 자동으로 /products?category={id} 로 매핑)
  const cats = applyProductCategoryHrefs((catData ?? []) as Category[])
  const tops: NavTopCategory[] = cats
    .filter((c) => c.parent_id === null)
    .map((top) => ({
      ...top,
      tiles: cats.filter((c) => c.parent_id === top.id && c.display_type === 'tile'),
      texts: cats.filter((c) => c.parent_id === top.id && c.display_type === 'text'),
      links: cats.filter((c) => c.parent_id === top.id && c.display_type === 'link'),
    }))

  // 최신 공지 5개 (테이블이 없거나 비어있어도 안전하게 처리)
  const { data: noticeData } = await supabase
    .from('notices')
    .select('id, title')
    .order('created_at', { ascending: false })
    .limit(5)
  const tickerNotices: TickerNotice[] = (noticeData ?? []) as TickerNotice[]

  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* Top utility bar */}
      <div className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto flex h-12 max-w-[1440px] items-center justify-between gap-5 px-6 text-[14px] text-neutral-600">
          <div className="min-w-0 max-w-[520px] flex-1">
            <NoticeTicker notices={tickerNotices} />
          </div>
          <div className="flex shrink-0 items-center gap-5">
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
            <Link href="/board" className="hover:text-black">게시판</Link>
            <span className="text-neutral-300">|</span>
            <Link href="/as" className="hover:text-black">AS센터</Link>
            <span className="text-neutral-300">|</span>
            <Link href="/business" className="hover:text-black">비즈니스 문의</Link>
          </div>
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
