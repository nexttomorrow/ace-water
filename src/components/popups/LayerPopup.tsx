'use client'

import PopupFrame from './PopupFrame'
import type { Popup } from '@/lib/types'

/**
 * 레이어 팝업 — 배경 딤드(어둡게) + 화면 중앙 고정.
 * 다중 팝업은 하나의 모달 안에서 슬라이드로 전환.
 */
export default function LayerPopup({
  popups,
  onClose,
  onHide,
}: {
  popups: Popup[]
  onClose: () => void
  onHide: (hours: number) => void
}) {
  if (popups.length === 0) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3">
      {/* 딤드 배경 — 클릭 시 닫기 */}
      <button
        type="button"
        aria-label="팝업 닫기"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/60"
      />
      <div className="relative z-[71]">
        <PopupFrame popups={popups} onClose={onClose} onHide={onHide} />
      </div>
    </div>
  )
}
