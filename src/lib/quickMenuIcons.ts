/**
 * 퀵메뉴 아이콘 헬퍼 (순수 모듈 — 서버/클라이언트 공용).
 *
 * 아이콘은 lucide-react 이름(kebab-case, 예: "phone", "map-pin")을 그대로 저장합니다.
 * 실제 렌더/검색은 <QuickMenuIcon> / <QuickMenuIconPicker> (lucide-react/dynamic) 에서 처리.
 */

export const DEFAULT_QUICK_MENU_ICON = 'link'

/** 구버전(큐레이션 세트) 키 → lucide 이름 매핑. 이미 시드된 데이터 호환용. */
const LEGACY_ALIAS: Record<string, string> = {
  estimate: 'file-text',
  doc: 'square-pen',
  home: 'building-2',
  catalog: 'book-open',
  chat: 'message-circle',
  map: 'map-pin',
  cart: 'shopping-cart',
  shield: 'shield-check',
}

/** 저장/표시용 아이콘 키 정규화. 빈 값은 기본 아이콘으로. */
export function normalizeIconKey(value: unknown): string {
  const k = String(value ?? '').trim()
  if (!k) return DEFAULT_QUICK_MENU_ICON
  return LEGACY_ALIAS[k] ?? k
}

/**
 * 검색 없이 처음 보여줄 추천 아이콘 (회사 사이트 퀵메뉴에서 자주 쓰는 것들).
 * 전부 유효한 lucide 이름 — 피커에서 실제 존재하는 것만 걸러 표시합니다.
 */
export const SUGGESTED_ICONS = [
  'file-text', 'square-pen', 'pen-line', 'wrench', 'headphones', 'phone',
  'mail', 'message-circle', 'send', 'map-pin', 'map', 'navigation',
  'building-2', 'house', 'store', 'book-open', 'calendar', 'clock',
  'shopping-cart', 'package', 'truck', 'credit-card', 'tag', 'gift',
  'star', 'heart', 'bell', 'user', 'users', 'camera', 'image', 'video',
  'play', 'instagram', 'youtube', 'facebook', 'globe', 'external-link',
  'download', 'shield-check', 'circle-help', 'info', 'link',
]
