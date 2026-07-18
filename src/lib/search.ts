/**
 * 통합검색 공용 타입/메타 — API 라우트(/api/search)와 SearchOverlay 컴포넌트가 공유.
 * (서버 전용 import 없음 — 클라이언트에서도 안전하게 사용)
 */

export type SearchType = 'product' | 'case' | 'notice' | 'resource' | 'post'

export type SearchResult = {
  type: SearchType
  id: number
  title: string
  /** 부제(모델명/현장명 등) — 없으면 생략 */
  subtitle?: string | null
  /** 이동 경로 */
  href: string
  /** 썸네일 URL — 없으면 유형 아이콘으로 대체 */
  imageUrl?: string | null
}

export type SearchResponse = {
  q: string
  results: SearchResult[]
  /** 유형별 총 매칭 수 (필터 칩에 표시) */
  counts: Partial<Record<SearchType, number>>
}

/** 유형 노출 순서 (전체 검색 시 그룹 순서) */
export const SEARCH_TYPE_ORDER: SearchType[] = ['product', 'case', 'notice', 'resource', 'post']

export const SEARCH_TYPE_LABEL: Record<SearchType, string> = {
  product: '제품',
  case: '시공사례',
  notice: '공지사항',
  resource: '자료실',
  post: '게시판',
}

/** 최소 검색어 길이 */
export const SEARCH_MIN_LENGTH = 2

// ───────────── 상세검색 옵션 ─────────────

/** 정렬 기준 */
export type SortField = 'relevance' | 'date' | 'name'
/** 정렬 방향 */
export type SortDir = 'asc' | 'desc'
/** 기간 필터 */
export type SearchPeriod = 'all' | '1w' | '1m' | '3m' | '1y'
/** 결과 보기 방식 */
export type SearchView = 'list' | 'gallery'

export const SEARCH_SORTS: { value: SortField; label: string }[] = [
  { value: 'relevance', label: '관련도순' },
  { value: 'date', label: '등록일순' },
  { value: 'name', label: '이름순' },
]

export const SEARCH_PERIODS: { value: SearchPeriod; label: string }[] = [
  { value: 'all', label: '전체 기간' },
  { value: '1w', label: '최근 1주' },
  { value: '1m', label: '최근 1개월' },
  { value: '3m', label: '최근 3개월' },
  { value: '1y', label: '최근 1년' },
]

/** 기간값 → 기준일(며칠 전). 'all' 은 제한 없음(null) */
export const SEARCH_PERIOD_DAYS: Record<Exclude<SearchPeriod, 'all'>, number> = {
  '1w': 7,
  '1m': 30,
  '3m': 90,
  '1y': 365,
}
