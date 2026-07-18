'use client'

import { useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import ProductCard, { type ProductCardItem } from './ProductCard'

import 'swiper/css'
import 'swiper/css/pagination'

/**
 * 제품 카드 슬라이더 — 메인 Best Seller / New Product 섹션용.
 *
 * 표시 개수(desktopPerView)보다 상품이 많으면 좌우 화살표 + 페이지네이션(하단 점)으로
 * 넘겨볼 수 있는 슬라이드로, 그 이하이면 슬라이드가 불필요하므로 기존 그리드 그대로 렌더한다.
 * 모바일은 2개, 데스크톱(≥768px)은 desktopPerView 개를 한 화면에 노출.
 *
 * 화살표는 히어로 슬라이더와 동일한 스타일(반투명 원형, 호버 시 흰색 채움)로 통일.
 */
export default function ProductSlider({
  items,
  desktopPerView,
  gridClassName,
}: {
  items: ProductCardItem[]
  desktopPerView: number
  gridClassName: string
}) {
  const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null)
  const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null)

  // 화면에 다 들어가면 슬라이드 없이 그리드
  if (items.length <= desktopPerView) {
    return (
      <div className={gridClassName}>
        {items.map((p) => (
          <ProductCard key={p.id} item={p} />
        ))}
      </div>
    )
  }

  return (
    <div className="product-slider relative">
      <Swiper
        modules={[Navigation, Pagination]}
        navigation={{ prevEl, nextEl }}
        pagination={{ clickable: true }}
        slidesPerView={2}
        slidesPerGroup={2}
        spaceBetween={20}
        breakpoints={{
          768: { slidesPerView: desktopPerView, slidesPerGroup: desktopPerView, spaceBetween: 28 },
        }}
      >
        {items.map((p) => (
          <SwiperSlide key={p.id} className="!h-auto">
            <ProductCard item={p} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 좌우 화살표 — 히어로 슬라이더와 동일 스타일. 이미지(정사각) 세로 중앙에 위치 */}
      <button
        ref={setPrevEl}
        type="button"
        aria-label="이전 슬라이드"
        className="ps-nav absolute left-2 top-[calc(50%-49px)] z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 text-white backdrop-blur-sm transition hover:border-white hover:bg-white hover:text-black"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 6l-6 6 6 6" />
        </svg>
      </button>
      <button
        ref={setNextEl}
        type="button"
        aria-label="다음 슬라이드"
        className="ps-nav absolute right-2 top-[calc(50%-49px)] z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 text-white backdrop-blur-sm transition hover:border-white hover:bg-white hover:text-black"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>

      <style jsx global>{`
        .product-slider .swiper {
          /* 하단 페이지네이션 점이 카드 아래 놓이도록 여백 확보 */
          padding-bottom: 2.5rem;
        }

        /* 호버(색/배경/테두리)만 트랜지션 — opacity 는 즉시 반영되게 제외 */
        .product-slider .ps-nav {
          transition-property: color, background-color, border-color;
        }
        /* 양 끝에서 비활성 화살표 숨김 */
        .product-slider .ps-nav.swiper-button-disabled {
          opacity: 0;
          pointer-events: none;
        }

        /* ─ 페이지네이션 점 ─ 카드 아래 가운데 */
        .product-slider .swiper-pagination {
          bottom: 0;
        }
        .product-slider .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: #d1d5db;
          opacity: 1;
          transition:
            width 200ms ease,
            background 200ms ease;
        }
        .product-slider .swiper-pagination-bullet-active {
          width: 22px;
          border-radius: 9999px;
          background: #111827;
        }
      `}</style>
    </div>
  )
}
