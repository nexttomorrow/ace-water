'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { POPUP_MOBILE_BREAKPOINT, type Popup } from '@/lib/types'
import { getHiddenPopupIds, hidePopupFor } from '@/lib/popupStorage'
import { selectVisiblePopups, groupPopups, popupIds } from '@/lib/popupFilters'
import LayerPopup from './LayerPopup'

/** 일반 팝업 새 창 기본 크기 (width/height 미지정 시) */
const GENERAL_DEFAULT_WIDTH = 400
const GENERAL_DEFAULT_HEIGHT = 500

/**
 * 일반(general) 팝업을 브라우저 새 창으로 연다 — 레이어 팝업과 달리 페이지 안에
 * 딤드/오버레이로 뜨지 않고, 지정 좌표(pos_x/pos_y)·크기(width/height)의 별도 창으로 뜬다.
 * 창 본체는 /popup/[id] 라우트가 독립 HTML 로 그리며, 닫기/다시 보지 않기도 그 안에서 처리된다.
 * 창 이름을 팝업별로 고정해 재호출 시 새 창이 중복 생성되지 않도록 한다.
 * 브라우저 팝업 차단에 걸리면 null 을 반환하며(무시), 이는 새 창 팝업의 본질적 한계다.
 */
function openGeneralPopup(p: Popup): void {
  const width = typeof p.width === 'number' && p.width > 0 ? p.width : GENERAL_DEFAULT_WIDTH
  const height = typeof p.height === 'number' && p.height > 0 ? p.height : GENERAL_DEFAULT_HEIGHT
  const left = typeof p.pos_x === 'number' ? p.pos_x : 40
  const top = typeof p.pos_y === 'number' ? p.pos_y : 40
  const features = `popup=yes,width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
  window.open(`/popup/${p.id}`, `acewater-popup-${p.id}`, features)
}

/**
 * 팝업 통합 컨테이너 — 서버에서 받은 팝업 목록에 대해
 * (기기 판별 + 오늘하루/일주일/세션 닫기 + 노출기간 + 상한3)을 적용하고 유형별로 렌더.
 *
 * 기기/스토리지 정보는 클라이언트에서만 확정되므로, 마운트 전에는 아무것도 렌더하지 않아
 * hydration 불일치와 잘못된 깜빡임을 방지한다.
 *
 * 레이어 팝업은 페이지 안에 딤드+중앙 모달로 렌더하고,
 * 일반 팝업은 window.open 으로 브라우저 새 창을 띄운다.
 */
export default function PopupSystem({ popups }: { popups: Popup[] }) {
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  // '다시 보지 않기'로 숨긴 팝업 (localStorage, 24h/168h 지속)
  const [hiddenIds, setHiddenIds] = useState<Set<number>>(() => new Set())
  // 그냥 '닫기'로 닫은 팝업 — 메모리 상태라 새로고침하면 다시 노출됨
  const [dismissedIds, setDismissedIds] = useState<Set<number>>(() => new Set())
  // 노출기간 판정 기준 시각 — 마운트 시점 1회 고정 (초 단위 오차 무의미)
  const [now] = useState(() => Date.now())

  useEffect(() => {
    if (popups.length === 0) return

    const mq = window.matchMedia(`(max-width: ${POPUP_MOBILE_BREAKPOINT - 0.02}px)`)
    const onDeviceChange = () => setIsMobile(mq.matches)
    mq.addEventListener('change', onDeviceChange)

    // 초기 상태 반영은 다음 프레임에 (effect 본문 동기 setState 회피)
    const raf = requestAnimationFrame(() => {
      setHiddenIds(getHiddenPopupIds())
      setIsMobile(mq.matches)
      setMounted(true)
    })

    return () => {
      cancelAnimationFrame(raf)
      mq.removeEventListener('change', onDeviceChange)
    }
  }, [popups.length])

  const visible = useMemo(() => {
    if (!mounted) return []
    // closedIds 자리에 메모리 상태(dismissedIds) 전달 — 새로고침 시 초기화
    return selectVisiblePopups(popups, { now, isMobile, hiddenIds, closedIds: dismissedIds })
  }, [mounted, popups, now, isMobile, hiddenIds, dismissedIds])

  const grouped = useMemo(() => groupPopups(visible), [visible])

  // 일반 팝업 → 브라우저 새 창으로 오픈. 이미 연 팝업은 다시 열지 않는다(재렌더 안전).
  const openedRef = useRef<Set<number>>(new Set())
  useEffect(() => {
    if (!mounted) return
    for (const p of grouped.general) {
      if (openedRef.current.has(p.id)) continue
      openedRef.current.add(p.id)
      openGeneralPopup(p)
    }
  }, [mounted, grouped.general])

  // 그냥 닫기 — 이번 화면에서만 숨김(메모리). 새로고침하면 다시 뜸.
  const handleClose = (ids: number[]) => {
    setDismissedIds((prev) => {
      const next = new Set(prev)
      for (const id of ids) next.add(id)
      return next
    })
  }

  // 다시 보지 않기 — hours 만큼 localStorage 에 지속 숨김
  const handleHide = (ids: number[], hours: number) => {
    if (hours <= 0) return handleClose(ids)
    let next: Set<number> | null = null
    for (const id of ids) next = hidePopupFor(id, hours)
    if (next) setHiddenIds(new Set(next))
  }

  // 일반 팝업은 새 창(window.open)으로 뜨므로 페이지 안에서는 레이어 팝업만 렌더한다.
  if (!mounted || grouped.layer.length === 0) return null

  return (
    <LayerPopup
      popups={grouped.layer}
      onClose={() => handleClose(popupIds(grouped.layer))}
      onHide={(hours) => handleHide(popupIds(grouped.layer), hours)}
    />
  )
}
