"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import AdminNavIcon from "./AdminNavIcon";
import { NAV_GROUPS, findActive } from "./nav-items";

// 메뉴 목록은 nav-items.ts 한 곳에서 관리한다 (AdminHeader 도 같은 배열을 쓴다).

const COLLAPSE_KEY = "acewater:admin-nav-collapsed";
const COLLAPSE_EVENT = "acewater:admin-nav-toggle";

/**
 * 접힘 상태는 localStorage 에 있는 "외부 상태" 라서 useSyncExternalStore 로 읽는다.
 * useEffect + setState 로 복원하면 마운트마다 렌더가 한 번 더 도는(cascading render) 데다
 * 서버 HTML 과도 어긋난다. 서버 스냅샷을 false 로 주면 하이드레이션 불일치도 없다.
 */
function subscribeCollapsed(onChange: () => void) {
  window.addEventListener(COLLAPSE_EVENT, onChange);
  window.addEventListener("storage", onChange); // 다른 탭에서 바꾼 경우
  return () => {
    window.removeEventListener(COLLAPSE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export default function AdminNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = findActive(pathname);

  const collapsed = useSyncExternalStore(
    subscribeCollapsed,
    () => localStorage.getItem(COLLAPSE_KEY) === "1",
    () => false, // 서버 렌더에서는 항상 펼친 상태
  );

  const toggleCollapsed = () => {
    localStorage.setItem(COLLAPSE_KEY, collapsed ? "0" : "1");
    window.dispatchEvent(new Event(COLLAPSE_EVENT));
  };

  // 본문 여백(--admin-nav-w)을 맞추기 위해 DOM 에 반영 — 외부 시스템 동기화라 effect 가 맞다.
  useEffect(() => {
    document.documentElement.dataset.adminNav = collapsed
      ? "collapsed"
      : "expanded";
  }, [collapsed]);

  // 드로어가 열려 있을 때 배경 스크롤 잠금 + ESC 로 닫기
  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      {/* ── 모바일 상단 바 ── */}
      <div className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-neutral-200 bg-white/90 px-4 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="메뉴 열기"
          className="-ml-1 grid h-9 w-9 place-items-center rounded-lg text-neutral-700 hover:bg-neutral-100"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
        <div className="min-w-0">
          <p className="truncate text-[0.6875rem] font-medium text-neutral-400">
            {active?.group.title ?? "어드민"}
          </p>
          <p className="truncate text-[0.9375rem] font-semibold leading-tight">
            {active?.item.label ?? "어드민"}
          </p>
        </div>
      </div>

      {/* ── 모바일 드로어 배경 ── */}
      {open && (
        <button
          type="button"
          aria-label="메뉴 닫기"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-neutral-900/40 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* ── 사이드바 (데스크톱 고정 / 모바일 드로어) ── */}
      <aside
        className={
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-neutral-200 bg-white " +
          "transition-[transform,width] duration-200 ease-out lg:translate-x-0 " +
          // 모바일 드로어는 항상 펼친 너비로 보여준다
          (collapsed ? "w-[17rem] lg:w-[4.5rem]" : "w-[17rem]") +
          (open ? " translate-x-0" : " -translate-x-full")
        }
      >
        {/* 브랜드 */}
        <div
          className={
            "flex h-16 shrink-0 items-center border-b border-neutral-100 " +
            (collapsed
              ? "justify-between px-5 lg:justify-center lg:px-0"
              : "justify-between px-5")
          }
        >
          <Link
            href="/mng"
            onClick={() => setOpen(false)}
            className={
              "flex items-baseline gap-2 " + (collapsed ? "lg:hidden" : "")
            }
          >
            <span className="text-[0.9375rem] font-bold tracking-tight">
              ACEWATER
            </span>
            <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-blue-700">
              Admin
            </span>
          </Link>
          {/* 접힌 상태의 축약 로고 */}
          {collapsed && (
            <Link
              href="/mng"
              className="hidden text-[0.9375rem] font-bold tracking-tight lg:block"
              title="ACEWATER Admin"
            >
              AW
            </Link>
          )}
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="메뉴 닫기"
            className="-mr-1 grid h-8 w-8 place-items-center rounded-lg text-neutral-500 hover:bg-neutral-100 lg:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              className="h-[1.125rem] w-[1.125rem]"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 메뉴 */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="mb-5 last:mb-0">
              {/* 접힌 상태에서는 그룹명 대신 구분선만 — 아이콘 열의 리듬은 유지 */}
              <p
                className={
                  "px-3 pb-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-neutral-400 " +
                  (collapsed ? "lg:hidden" : "")
                }
              >
                {group.title}
              </p>
              {collapsed && (
                <div className="mx-3 mb-1.5 hidden border-t border-neutral-100 lg:block" />
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = active?.item.href === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        // 라우트 변경 effect 대신 클릭 시점에 드로어를 닫는다
                        onClick={() => setOpen(false)}
                        aria-current={isActive ? "page" : undefined}
                        // 접었을 때는 라벨이 안 보이므로 네이티브 툴팁으로 보완
                        title={
                          collapsed
                            ? `${group.title} · ${item.label}`
                            : undefined
                        }
                        className={
                          "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[0.8125rem] transition " +
                          (collapsed ? "lg:justify-center lg:px-0 " : "") +
                          (isActive
                            ? "bg-neutral-900 font-semibold text-white"
                            : "font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900")
                        }
                      >
                        <AdminNavIcon
                          name={item.icon}
                          className={
                            "h-[1.125rem] w-[1.125rem] shrink-0 " +
                            (isActive ? "text-white" : "text-neutral-400")
                          }
                        />
                        <span className={collapsed ? "lg:hidden" : ""}>
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* 하단: 사이트 바로가기 + 접기/펼치기 */}
        <div className="shrink-0 space-y-0.5 border-t border-neutral-100 p-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            title={collapsed ? "사이트 보기" : undefined}
            className={
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[0.8125rem] font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 " +
              (collapsed ? "lg:justify-center lg:px-0" : "")
            }
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[1.125rem] w-[1.125rem] shrink-0 text-neutral-400"
              aria-hidden="true"
            >
              <path d="M15 3h6v6" />
              <path d="M10 14 21 3" />
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            </svg>
            <span className={collapsed ? "lg:hidden" : ""}>사이트 보기</span>
          </a>

          {/* 접기/펼치기 — 데스크톱 전용 (모바일은 드로어라 의미 없음) */}
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "메뉴 펼치기" : "메뉴 접기"}
            title={collapsed ? "메뉴 펼치기" : "메뉴 접기"}
            className={
              "hidden w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[0.8125rem] font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 lg:flex " +
              (collapsed ? "lg:justify-center lg:px-0" : "")
            }
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[1.125rem] w-[1.125rem] shrink-0 text-neutral-400"
              aria-hidden="true"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M9 3v18" />
              {collapsed ? (
                <path d="m14 9 3 3-3 3" />
              ) : (
                <path d="m17 9-3 3 3 3" />
              )}
            </svg>
            <span className={collapsed ? "lg:hidden" : ""}>메뉴 접기</span>
          </button>
        </div>
      </aside>
    </>
  );
}
