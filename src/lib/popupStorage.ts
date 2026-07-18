/**
 * 팝업 "오늘 하루 보지 않기" 상태 관리 (클라이언트 전용).
 *
 * 설계 노트
 * - 저장소: localStorage 단일 키 하나에 { [popupId]: 만료 epoch(ms) } 맵으로 보관.
 *   → 팝업이 많아도 파싱/직렬화는 1회, 개별 키 스캔 불필요.
 * - 지정 시간(오늘 하루=24h / 일주일=168h) 뒤 자동 만료. localStorage 는 자동 만료가 없으므로
 *   만료 시각을 값으로 저장하고, 읽을 때 만료분을 정리(prune)해 맵이 무한정 커지지 않게 함.
 * - SSR 안전: window 접근을 모두 가드. 서버에서는 "숨긴 팝업 없음"으로 취급.
 */

const STORAGE_KEY = 'acewater:popup-hidden'

type HiddenMap = Record<string, number>

const hasWindow = (): boolean => typeof window !== 'undefined'

function readMap(): HiddenMap {
  if (!hasWindow()) return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as HiddenMap
  } catch {
    // 파싱 실패(손상/구버전 등) → 빈 상태로 간주
    return {}
  }
}

function writeMap(map: HiddenMap): void {
  if (!hasWindow()) return
  try {
    // 빈 맵이면 키 자체를 제거해 깔끔하게 유지
    if (Object.keys(map).length === 0) {
      window.localStorage.removeItem(STORAGE_KEY)
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
    }
  } catch {
    // 용량 초과/프라이빗 모드 등 — 조용히 무시
  }
}

/**
 * 만료되지 않은 "숨김" 팝업 id 집합을 반환.
 * 읽는 김에 만료된 항목은 정리(prune)해 저장소를 가볍게 유지한다.
 */
export function getHiddenPopupIds(now: number = Date.now()): Set<number> {
  const map = readMap()
  const live = new Set<number>()
  let changed = false

  for (const key in map) {
    const expiry = map[key]
    if (typeof expiry === 'number' && expiry > now) {
      const id = Number(key)
      if (Number.isFinite(id)) live.add(id)
    } else {
      // 만료 or 손상된 값 → 제거 대상
      delete map[key]
      changed = true
    }
  }

  if (changed) writeMap(map)
  return live
}

/** 특정 팝업이 현재 숨김 상태인지 여부 */
export function isPopupHidden(id: number, now: number = Date.now()): boolean {
  const map = readMap()
  const expiry = map[String(id)]
  return typeof expiry === 'number' && expiry > now
}

/**
 * "다시 보지 않기" — 지금부터 hours 시간 동안 해당 팝업을 숨긴다.
 * (오늘 하루=24, 일주일=168 등 호출부에서 기간 지정)
 * @returns 갱신된 숨김 id 집합 (컴포넌트 상태 갱신에 바로 활용 가능)
 */
export function hidePopupFor(
  id: number,
  hours: number,
  now: number = Date.now()
): Set<number> {
  const map = readMap()
  // 읽는 김에 만료분 정리
  for (const key in map) {
    if (!(typeof map[key] === 'number' && map[key] > now)) delete map[key]
  }
  map[String(id)] = now + hours * 60 * 60 * 1000
  writeMap(map)

  const live = new Set<number>()
  for (const key in map) {
    const numId = Number(key)
    if (Number.isFinite(numId)) live.add(numId)
  }
  return live
}

/** 특정 팝업의 숨김 상태를 즉시 해제 (테스트/관리용) */
export function clearHiddenPopup(id: number): void {
  const map = readMap()
  if (String(id) in map) {
    delete map[String(id)]
    writeMap(map)
  }
}

/** 모든 숨김 상태 초기화 */
export function clearAllHiddenPopups(): void {
  writeMap({})
}
