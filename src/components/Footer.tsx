import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { applyProductCategoryHrefs } from '@/lib/products'
import type { Category } from '@/lib/types'

export default async function Footer() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true })

  const cats = applyProductCategoryHrefs((data ?? []) as Category[])
  const columns = cats
    .filter((c) => c.parent_id === null)
    .map((top) => ({
      id: top.id,
      title: top.name,
      href: top.href,
      children: cats.filter((c) => c.parent_id === top.id),
    }))

  return (
    <footer className="mt-20 border-t border-neutral-200 bg-neutral-50 text-neutral-700">
      {/* Top quick links bar — 추후 사용 예정으로 임시 숨김 */}
      {/* <div className="border-b border-neutral-200">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-6 py-5 text-[14px]">
          <div className="flex flex-wrap items-center gap-5">
            <Link href="#" className="font-medium text-black hover:underline">
              고객센터
            </Link>
            <span className="text-neutral-300">|</span>
            <Link href="#" className="hover:underline">
              매장 찾기
            </Link>
            <span className="text-neutral-300">|</span>
            <Link href="#" className="hover:underline">
              제품 등록
            </Link>
            <span className="text-neutral-300">|</span>
            <Link href="#" className="hover:underline">
              서비스 예약
            </Link>
          </div>
          <div className="flex items-center gap-3 text-neutral-500">
            <span className="text-[14px]">팔로우</span>
            {['F', 'X', 'Y', 'I'].map((c) => (
              <Link
                key={c}
                href="#"
                aria-label={`SNS ${c}`}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-[12px] font-semibold hover:border-black hover:text-black"
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
      </div> */}

      {/* Multi-column links — built from categories */}
      {columns.length > 0 && (
        <div className="mx-auto max-w-[1440px] px-6 py-12">
          <div
            className="grid gap-10"
            style={{
              gridTemplateColumns: `repeat(auto-fit, minmax(160px, 1fr))`,
            }}
          >
            {columns.map((col) => (
              <div key={col.id}>
                <h3 className="mb-4 text-[0.875rem] font-bold text-black">
                  {col.href ? (
                    <Link href={col.href} className="hover:underline">
                      {col.title}
                    </Link>
                  ) : (
                    col.title
                  )}
                </h3>
                {col.children.length > 0 && (
                  <ul className="space-y-2.5 text-[0.875rem] text-neutral-600">
                    {col.children.map((child) => (
                      <li key={child.id}>
                        <Link
                          href={child.href || '#'}
                          className="hover:text-black hover:underline"
                        >
                          {child.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom company info */}
      <div className="border-t border-neutral-200">
        <div className="mx-auto max-w-[1440px] px-6 py-8">
          <div className="flex flex-col gap-4 text-[0.875rem] leading-6 text-neutral-500 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <p className="font-semibold text-neutral-700">에이스엔지니어링</p>
              <p>
                대표: 구종철 &nbsp;|&nbsp; 주소: 경기도 파주시 탄현면 방촌로 449-58
              </p>
              <p>사업자등록번호: 111-24-75831</p>
              <p>
                T. 031-944-2903 &nbsp;|&nbsp; F. 031-944-2901 &nbsp;|&nbsp; E.
                acewater@acewater.net
              </p>
              <p className="pt-2 text-neutral-400">
                © {new Date().getFullYear()} 에이스엔지니어링. All rights reserved.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-neutral-500">
              <Link href="/terms" className="hover:underline">
                이용약관
              </Link>
              <Link
                href="/privacy"
                className="font-semibold text-neutral-700 hover:underline"
              >
                개인정보처리방침
              </Link>
              {/* <Link href="#" className="hover:underline">
                법적고지
              </Link>
              <Link href="#" className="hover:underline">
                사이트맵
              </Link> */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
