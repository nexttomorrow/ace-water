/**
 * 팝업 노출 필터 — 순수 함수 (서버/클라이언트/테스트 공용, 부수효과 없음).
 *
 * 노출 조건: 사용중 + 노출기간 내 + 기기 일치 + '오늘 하루/세션 닫기' 대상 아님.
 * 이후 노출순서(sort_order)로 정렬 → 화면당 최대 POPUP_MAX_VISIBLE(3)개로 제한.
 */

import { POPUP_MAX_VISIBLE, type Popup } from './types'

export type PopupVisibilityCtx = {
  /** 기준 시각 (epoch ms) */
  now: number
  /** 현재 뷰포트가 모바일인지 */
  isMobile: boolean
  /** '오늘 하루 보지 않기'로 숨긴 id (24h) */
  hiddenIds: Set<number>
  /** 이번 세션에서 닫은 id */
  closedIds: Set<number>
}

/** 노출 기간 내인지 */
export function isWithinSchedule(popup: Popup, now: number): boolean {
  const start = Date.parse(popup.starts_at)
  const end = Date.parse(popup.ends_at)
  if (Number.isNaN(start) || Number.isNaN(end)) return false
  return now >= start && now <= end
}

/** 현재 기기에서 노출 대상인지 (반응형 — device 기준) */
export function isDeviceEligible(popup: Popup, isMobile: boolean): boolean {
  switch (popup.device) {
    case 'pc':
      return !isMobile
    case 'mobile':
      return isMobile
    default:
      return true // 'all'
  }
}

/**
 * 노출할 팝업을 선별 → 정렬 → 상한 적용.
 * 단일 순회로 필터링한 뒤 정렬/슬라이스 (불필요한 중간 배열 최소화).
 */
export function selectVisiblePopups(popups: Popup[], ctx: PopupVisibilityCtx): Popup[] {
  const { now, isMobile, hiddenIds, closedIds } = ctx

  const eligible: Popup[] = []
  for (const p of popups) {
    if (!p.is_active) continue
    if (hiddenIds.has(p.id) || closedIds.has(p.id)) continue
    if (!isWithinSchedule(p, now)) continue
    if (!isDeviceEligible(p, isMobile)) continue
    eligible.push(p)
  }

  // 노출순서 오름차순, 동률이면 id 오름차순으로 결정적 정렬
  eligible.sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)

  return eligible.length > POPUP_MAX_VISIBLE ? eligible.slice(0, POPUP_MAX_VISIBLE) : eligible
}

export type GroupedPopups = {
  layer: Popup[]
  general: Popup[]
}

/** 유형별로 그룹화 — 레이어(중앙 모달, 슬라이드) / 일반(좌표별 개별 배치) */
export function groupPopups(popups: Popup[]): GroupedPopups {
  const grouped: GroupedPopups = { layer: [], general: [] }
  for (const p of popups) {
    if (p.popup_type === 'general') grouped.general.push(p)
    else grouped.layer.push(p)
  }
  return grouped
}

/** 팝업 배열 → id 배열 (닫기/숨김 핸들러 인자용) */
export function popupIds(popups: Popup[]): number[] {
  return popups.map((p) => p.id)
}
