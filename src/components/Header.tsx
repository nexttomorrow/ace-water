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
    // CSS 변수 --site-header-h 로 헤더 총 높이를 노출 → StickySubmenuTabs 등 스크롤 동기화 컴포넌트가 참조.
    // 모바일: top utility 36 + main nav 64 = 100
    // 데스크탑: top utility 40 + main nav 72 = 112
    // CSS 변수 --site-header-h = utility(40 desktop / 36 mobile) + nav(72/64) + ticker(32)
    //   모바일: 36 + 64 + 32 = 132 (티커 있을 때) / 100 (없을 때)
    //   데스크탑: 40 + 72 + 32 = 144 (티커 있을 때) / 112 (없을 때)
    <header
      className={`sticky top-0 z-50 overflow-x-clip bg-white ${
        tickerNotices.length > 0
          ? '[--site-header-h:132px] md:[--site-header-h:144px]'
          : '[--site-header-h:100px] md:[--site-header-h:112px]'
      }`}
    >
      {/* Top utility bar — 링크만 (티커는 하단 스트립으로 분리) */}
      <div className="border-b border-neutral-200/80 bg-neutral-50">
        <div className="mx-auto flex h-9 max-w-[1440px] items-center justify-end gap-3 px-6 text-[0.75rem] text-neutral-600 md:h-10 md:gap-4">
          {isAdmin && (
            <>
              <Link
                href="/mng"
                className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-2.5 py-0.5 text-[0.75rem] font-semibold text-white hover:bg-black"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6z" />
                </svg>
                관리자
              </Link>
              <span aria-hidden className="text-neutral-300">|</span>
            </>
          )}
          <Link href="/board" className="transition hover:text-neutral-900">
            게시판
          </Link>
          <span aria-hidden className="text-neutral-300">|</span>
          <Link href="/as" className="transition hover:text-neutral-900">
            AS센터
          </Link>
          <span aria-hidden className="text-neutral-300">|</span>
          <Link href="/business" className="transition hover:text-neutral-900">
            비즈니스 문의
          </Link>
        </div>
      </div>

      <MainNav
        categories={tops}
        isLoggedIn={!!user}
        isAdmin={isAdmin}
        nickname={nickname}
        email={user?.email ?? null}
      />

      {/* 공지 티커 — 메인 nav 아래 풀폭 스트립 */}
      {tickerNotices.length > 0 && (
        <div className="border-t border-neutral-100 bg-neutral-50/60">
          <div className="mx-auto flex h-8 max-w-[1440px] items-center px-6">
            <NoticeTicker notices={tickerNotices} />
          </div>
        </div>
      )}
    </header>
  )
}
