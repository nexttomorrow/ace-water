import Link from 'next/link'

const columns = [
  {
    title: '쇼핑',
    links: ['신제품', '갤러리', '베스트', '이벤트', '기획전', '멤버십'],
  },
  {
    title: '고객지원',
    links: ['고객센터', '제품 문의', '서비스 센터', '다운로드', 'FAQ', '공지사항'],
  },
  {
    title: '회사',
    links: ['회사 소개', '비전', '지속가능경영', '채용', '뉴스룸', '투자정보'],
  },
  {
    title: '법적 고지',
    links: ['이용약관', '개인정보처리방침', '청소년보호정책', '이메일무단수집거부', '쿠키정책', '사이트맵'],
  },
]

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-neutral-200 bg-neutral-50 text-neutral-700">
      {/* Top quick links bar */}
      <div className="border-b border-neutral-200">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-6 py-5 text-[13px]">
          <div className="flex flex-wrap items-center gap-5">
            <Link href="#" className="font-medium text-black hover:underline">고객센터</Link>
            <span className="text-neutral-300">|</span>
            <Link href="#" className="hover:underline">매장 찾기</Link>
            <span className="text-neutral-300">|</span>
            <Link href="#" className="hover:underline">제품 등록</Link>
            <span className="text-neutral-300">|</span>
            <Link href="#" className="hover:underline">서비스 예약</Link>
          </div>
          <div className="flex items-center gap-3 text-neutral-500">
            <span className="text-[12px]">팔로우</span>
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
      </div>

      {/* Multi-column links */}
      <div className="mx-auto max-w-[1440px] px-6 py-12">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 text-[13px] font-bold text-black">{col.title}</h3>
              <ul className="space-y-2.5 text-[13px] text-neutral-600">
                {col.links.map((label) => (
                  <li key={label}>
                    <Link href="#" className="hover:text-black hover:underline">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom company info */}
      <div className="border-t border-neutral-200">
        <div className="mx-auto max-w-[1440px] px-6 py-8">
          <div className="flex flex-col gap-4 text-[12px] leading-6 text-neutral-500 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <p className="font-semibold text-neutral-700">JASPERAGC</p>
              <p>
                대표이사: 홍길동 &nbsp;|&nbsp; 주소: 서울특별시 강남구 테헤란로 000, 0층
              </p>
              <p>
                사업자등록번호: 000-00-00000 &nbsp;|&nbsp; 통신판매업 신고: 제 0000-서울강남-00000 호
              </p>
              <p>고객센터: 0000-0000 (평일 09:00 ~ 18:00)</p>
              <p className="pt-2 text-neutral-400">
                © {new Date().getFullYear()} JASPERAGC. All rights reserved.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-neutral-500">
              <Link href="#" className="hover:underline">이용약관</Link>
              <Link href="#" className="font-semibold text-neutral-700 hover:underline">개인정보처리방침</Link>
              <Link href="#" className="hover:underline">법적고지</Link>
              <Link href="#" className="hover:underline">사이트맵</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
