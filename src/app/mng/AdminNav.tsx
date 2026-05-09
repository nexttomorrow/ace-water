"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "대시보드", href: "/mng" },
  { label: "월별 리포트", href: "/mng/reports" },
  { label: "메인 슬라이드", href: "/mng/hero" },
  { label: "카테고리 관리", href: "/mng/categories" },
  { label: "제품 관리", href: "/mng/products" },
  { label: "필터 관리", href: "/mng/filters" },
  { label: "태그 관리", href: "/mng/tags" },
  { label: "시공사례", href: "/mng/gallery" },
  { label: "견적문의", href: "/mng/estimates" },
  { label: "공지사항", href: "/mng/notices" },
  { label: "게시판", href: "/mng/board" },
  { label: "이미지 최적화", href: "/mng/storage-optimize" },
];

export default function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/mng") return pathname === "/mng";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-[1440px] px-6">
        <div className="flex h-12 items-center gap-1 overflow-x-auto">
          {tabs.map((t) => {
            const active = isActive(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={
                  "relative whitespace-nowrap px-4 py-2 text-[0.875rem] font-medium transition " +
                  (active ? "text-black" : "text-neutral-500 hover:text-black")
                }
              >
                {t.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-px h-[2px] bg-black" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
