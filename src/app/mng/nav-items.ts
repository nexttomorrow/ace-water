/**
 * 어드민 네비게이션 구조 (1뎁스: 그룹 / 2뎁스: 페이지).
 *
 * 그룹은 "누가 얼마나 자주 만지는가" 기준으로 묶었습니다.
 *   개요        — 매일 확인만
 *   문의·게시물 — 매일 처리 (견적문의가 실질 메인)
 *   제품        — 카탈로그 운영
 *   시공사례    — 포트폴리오 운영
 *   사이트 구성 — 초기 세팅 후 가끔 (메뉴/디자인 요소)
 *   도구        — 유지보수
 *
 * AdminNav 와 AdminHeader(현재 위치 표시)가 이 배열 하나를 공유합니다.
 */

export type NavItem = {
  label: string
  href: string
  /** IconKey — AdminNavIcon 의 path 맵 키 */
  icon: IconKey
}

export type NavGroup = {
  title: string
  items: NavItem[]
}

export type IconKey =
  | 'dashboard'
  | 'report'
  | 'estimate'
  | 'notice'
  | 'board'
  | 'product'
  | 'filter'
  | 'tag'
  | 'case'
  | 'caseCategory'
  | 'menu'
  | 'logo'
  | 'slide'
  | 'popup'
  | 'quickMenu'
  | 'client'
  | 'certificate'
  | 'optimize'

export const NAV_GROUPS: NavGroup[] = [
  {
    title: '개요',
    items: [
      { label: '대시보드', href: '/mng', icon: 'dashboard' },
      { label: '월별 리포트', href: '/mng/reports', icon: 'report' },
    ],
  },
  {
    title: '문의 · 게시물',
    items: [
      { label: '견적문의', href: '/mng/estimates', icon: 'estimate' },
      { label: '공지사항', href: '/mng/notices', icon: 'notice' },
      { label: '게시판', href: '/mng/board', icon: 'board' },
    ],
  },
  {
    title: '제품',
    items: [
      { label: '제품 목록', href: '/mng/products', icon: 'product' },
      { label: '검색 필터', href: '/mng/filters', icon: 'filter' },
      { label: '태그', href: '/mng/tags', icon: 'tag' },
    ],
  },
  {
    title: '시공사례',
    items: [
      { label: '사례 목록', href: '/mng/gallery', icon: 'case' },
      { label: '사례 분류', href: '/mng/gallery/categories', icon: 'caseCategory' },
    ],
  },
  {
    title: '사이트 구성',
    items: [
      { label: '메뉴 · 카테고리', href: '/mng/categories', icon: 'menu' },
      { label: '사이트 로고', href: '/mng/logo', icon: 'logo' },
      { label: '메인 슬라이드', href: '/mng/hero', icon: 'slide' },
      { label: '팝업', href: '/mng/popups', icon: 'popup' },
      { label: '퀵메뉴', href: '/mng/quick-menu', icon: 'quickMenu' },
      { label: '고객사 로고', href: '/mng/clients', icon: 'client' },
      // 회사소개 페이지의 인증서 섹션
      { label: '인증서', href: '/mng/certifications', icon: 'certificate' },
    ],
  },
  {
    title: '도구',
    items: [{ label: '이미지 최적화', href: '/mng/storage-optimize', icon: 'optimize' }],
  },
]

/**
 * 현재 경로에 맞는 그룹/항목을 찾는다. 활성 표시의 유일한 기준이다.
 *
 * 규칙: 정확히 일치하는 항목이 최우선, 없으면 "접두사가 가장 긴" 항목.
 * 이 한 줄 규칙으로 중첩 경로가 전부 자연스럽게 처리된다.
 *   /mng/gallery            → 사례 목록 (정확)
 *   /mng/gallery/categories → 사례 분류 (정확 — 목록보다 우선)
 *   /mng/gallery/new        → 사례 목록 (접두사)
 * `/mng` 는 모든 경로의 접두사이므로 정확히 일치할 때만 잡히게 제외한다.
 */
export function findActive(pathname: string): { group: NavGroup; item: NavItem } | null {
  let fallback: { group: NavGroup; item: NavItem } | null = null
  let fallbackLen = -1

  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (pathname === item.href) return { group, item }
      if (item.href !== '/mng' && pathname.startsWith(item.href + '/')) {
        if (item.href.length > fallbackLen) {
          fallback = { group, item }
          fallbackLen = item.href.length
        }
      }
    }
  }
  return fallback
}
