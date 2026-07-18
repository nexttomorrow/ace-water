'use client'

import type { CSSProperties } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import PopupContent from './PopupContent'
import { POPUP_DISMISS_HOURS, POPUP_DISMISS_LABEL, type Popup } from '@/lib/types'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

/**
 * 팝업 공통 프레임 — 카드(크기) + 다중 팝업 슬라이드 + 하단 컨트롤 바.
 * 레이어/일반 래퍼가 위치만 잡고 본체는 이 프레임을 공유한다.
 *
 * 크기는 항상 반응형: 지정 px 이 있어도 뷰포트를 넘지 않도록 min(px, vw/vh) 로 자동 축소.
 * 하단 컨트롤은 프레임에 담긴 팝업 그룹 전체에 적용(닫기 항상 / 다시 보지 않기는 옵션).
 */
export default function PopupFrame({
  popups,
  onClose,
  onHide,
  className = '',
}: {
  popups: Popup[]
  onClose: () => void
  /** 다시 보지 않기 — hours 만큼 숨김 */
  onHide: (hours: number) => void
  className?: string
}) {
  if (popups.length === 0) return null

  const first = popups[0]
  const multi = popups.length > 1
  const hasFixedHeight = typeof first.height === 'number' && first.height > 0
  const hasFixedWidth = typeof first.width === 'number' && first.width > 0

  // 지정 px 이 있어도 화면을 넘지 않도록 min() 으로 반응형 축소
  const cardStyle: CSSProperties = {
    width: hasFixedWidth ? `min(${first.width}px, calc(100vw - 24px))` : undefined,
  }
  const bodyStyle: CSSProperties = {
    height: hasFixedHeight ? `min(${first.height}px, calc(100vh - 96px))` : undefined,
  }

  const dismiss = first.dismiss_option
  const dismissHours = dismiss === 'none' ? 0 : POPUP_DISMISS_HOURS[dismiss]

  return (
    <div
      className={`pointer-events-auto flex max-h-[90vh] max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-lg bg-white shadow-2xl ring-1 ring-black/5 ${className}`}
      style={cardStyle}
      role="dialog"
      aria-label={first.title}
    >
      <div className="relative min-h-0 flex-1 overflow-hidden bg-neutral-50" style={bodyStyle}>
        {multi ? (
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            loop
            autoHeight={!hasFixedHeight}
            className="popup-swiper h-full w-full"
          >
            {popups.map((p) => (
              <SwiperSlide key={p.id} className="h-full w-full">
                <PopupContent popup={p} />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <PopupContent popup={first} />
        )}
      </div>

      {/* 컨트롤 바 */}
      <div className="flex items-center justify-between border-t border-neutral-200 bg-white px-3 py-2 text-[0.8125rem]">
        {dismiss !== 'none' ? (
          <button
            type="button"
            onClick={() => onHide(dismissHours)}
            className="rounded px-1.5 py-1 text-neutral-500 transition hover:text-neutral-900"
          >
            {POPUP_DISMISS_LABEL[dismiss]}
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1 rounded px-1.5 py-1 font-medium text-neutral-900 transition hover:text-black"
          aria-label="닫기"
        >
          닫기
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
