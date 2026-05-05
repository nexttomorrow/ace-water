import Link from "next/link";

const columns = [
  {
    title: "회사소개",
    links: ["연혁", "조직도", "오시는길"],
  },
  {
    title: "제품안내",
    links: [
      "음수대",
      "세정대",
      "세족대",
      "차양",
      "대용량정수기",
      "샤워기/코인샤워기",
    ],
  },
  {
    title: "견적/도면문의",
    links: ["실행견적 문의", "설계견적 문의", "도면요청", "제작의뢰"],
  },
  {
    title: "시공사례",
    links: ["시공사례"],
  },
  {
    title: "자료실",
    links: ["공지사항", "자료실", "Q&A"],
  },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-neutral-200 bg-neutral-50 text-neutral-700">
      {/* Top quick links bar */}
      <div className="border-b border-neutral-200">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-6 py-5 text-[13px]">
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
            <span className="text-[12px]">팔로우</span>
            {["F", "X", "Y", "I"].map((c) => (
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
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 text-[13px] font-bold text-black">
                {col.title}
              </h3>
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
              <p className="font-semibold text-neutral-700">에이스엔지니어링</p>
              <p>
                대표: 구종철 &nbsp;|&nbsp; 주소: 경기도 파주시 탄현면 방촌로
                449-58
              </p>
              <p>사업자등록번호: 111-24-75831</p>
              <p>
                T. 031-944-2903 &nbsp;|&nbsp; F. 031-944-2901 &nbsp;|&nbsp; E.
                acewater@acewater.net
              </p>
              <p className="pt-2 text-neutral-400">
                © {new Date().getFullYear()} 에이스엔지니어링. All rights
                reserved.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-neutral-500">
              <Link href="#" className="hover:underline">
                이용약관
              </Link>
              <Link
                href="#"
                className="font-semibold text-neutral-700 hover:underline"
              >
                개인정보처리방침
              </Link>
              <Link href="#" className="hover:underline">
                법적고지
              </Link>
              <Link href="#" className="hover:underline">
                사이트맵
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
