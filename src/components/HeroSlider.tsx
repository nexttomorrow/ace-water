'use client'

import { useEffect, useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, EffectFade, Pagination } from 'swiper/modules'
import type { Swiper as SwiperClass } from 'swiper'
import Image from 'next/image'

import { HERO_DURATION_DEFAULT_MS, HERO_TRANSITION_MS } from '@/lib/types'

import 'swiper/css'
import 'swiper/css/effect-fade'

export type HeroSliderItem = {
  key: string
  src: string
  eyebrow?: string
  title: string
  /** 이 슬라이드가 화면에 머무는 시간(ms) */
  duration?: number
}

export default function HeroSlider({ slides }: { slides: HeroSliderItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const swiperRef = useRef<SwiperClass | null>(null)

  if (slides.length === 0) return null

  const single = slides.length === 1
  const durationOf = (i: number) => slides[i]?.duration || HERO_DURATION_DEFAULT_MS

  return (
    <section className="relative h-[560px] w-full overflow-hidden bg-neutral-950 md:h-[640px]">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={
          single
            ? false
            : { delay: durationOf(0), disableOnInteraction: false }
        }
        loop={!single}
        allowTouchMove={!single}
        speed={HERO_TRANSITION_MS}
        onSwiper={(s) => (swiperRef.current = s)}
        onSlideChange={(s) => setActiveIndex(s.realIndex)}
        className="h-full w-full"
      >
        {slides.map((slide, i) => (
          <SwiperSlide
            key={slide.key}
            data-swiper-autoplay={durationOf(i)}
            className="relative h-full w-full"
          >
            <HeroImage
              src={slide.src}
              active={activeIndex === i}
              priority={i === 0}
              duration={durationOf(i)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />
            <div className="relative z-10 mx-auto flex h-full max-w-[1440px] flex-col justify-end px-6 pb-24 md:pb-28">
              {slide.eyebrow && (
                <p
                  className={`mb-3 text-[0.75rem] font-semibold tracking-[0.25em] text-white/80 transition-all duration-700 ${
                    activeIndex === i
                      ? 'translate-y-0 opacity-100 delay-200'
                      : 'translate-y-3 opacity-0'
                  }`}
                >
                  {slide.eyebrow}
                </p>
              )}
              <h2
                className={`max-w-2xl text-[2.125rem] font-extrabold leading-[1.2] text-white md:text-[3rem] transition-all duration-700 ${
                  activeIndex === i
                    ? 'translate-y-0 opacity-100 delay-300'
                    : 'translate-y-4 opacity-0'
                }`}
              >
                {slide.title}
              </h2>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* CONTROLS */}
      {!single && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20">
          <div className="mx-auto flex max-w-[1440px] items-end justify-between px-6 pb-8">
            <div className="pointer-events-auto flex items-center gap-5 text-white">
              <div className="flex items-baseline gap-2 font-mono text-[0.875rem] tracking-widest">
                <span className="text-[1.125rem] font-bold">
                  {String(activeIndex + 1).padStart(2, '0')}
                </span>
                <span className="text-white/40">/</span>
                <span className="text-white/60">
                  {String(slides.length).padStart(2, '0')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {slides.map((s, i) => (
                  <button
                    key={s.key}
                    onClick={() => swiperRef.current?.slideToLoop(i)}
                    aria-label={`슬라이드 ${i + 1}`}
                    className="group relative h-[2px] w-10 overflow-hidden bg-white/25"
                  >
                    {activeIndex === i ? (
                      <ProgressFill duration={durationOf(i)} />
                    ) : (
                      <span
                        className={`absolute inset-y-0 left-0 bg-white ${
                          i < activeIndex ? 'w-full opacity-30' : 'w-0'
                        }`}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="pointer-events-auto flex items-center gap-2">
              <button
                onClick={() => swiperRef.current?.slidePrev()}
                aria-label="이전 슬라이드"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white backdrop-blur-sm transition hover:border-white hover:bg-white hover:text-black"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={() => swiperRef.current?.slideNext()}
                aria-label="다음 슬라이드"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white backdrop-blur-sm transition hover:border-white hover:bg-white hover:text-black"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

/**
 * 배너 이미지 — 슬라이드가 활성화될 때마다 은은하게 확대(Ken Burns).
 * 확대 시간이 슬라이드 표시 시간에 비례하므로, 속도를 바꿔도 효과가 유지됩니다.
 * (활성화 시 매번 scale 1 → 1.05 로 다시 애니메이션)
 */
function HeroImage({
  src,
  active,
  priority,
  duration,
}: {
  src: string
  active: boolean
  priority: boolean
  duration: number
}) {
  const [zoomed, setZoomed] = useState(false)

  useEffect(() => {
    // 다음 프레임에 상태 전환 → 활성화될 때마다 transition 이 새로 발동
    const id = requestAnimationFrame(() => setZoomed(active))
    return () => cancelAnimationFrame(id)
  }, [active])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <Image
        src={src}
        alt=""
        fill
        priority={priority}
        unoptimized
        className="object-cover ease-out will-change-transform"
        style={{
          transform: zoomed ? 'scale(1.05)' : 'scale(1)',
          transitionProperty: 'transform',
          transitionTimingFunction: 'ease-out',
          // 확대는 (표시 시간 + 전환) 동안 천천히, 원위치는 전환 시간 동안 부드럽게
          transitionDuration: `${zoomed ? duration + HERO_TRANSITION_MS : HERO_TRANSITION_MS}ms`,
        }}
      />
    </div>
  )
}

/**
 * 하단 진행바 — 활성 슬라이드일 때만 마운트되어 0 → 100% 로 채워집니다.
 * 활성화될 때마다 새로 마운트되므로 loop 로 되돌아와도 매번 다시 움직입니다.
 */
function ProgressFill({ duration }: { duration: number }) {
  const [filled, setFilled] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setFilled(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <span
      className="absolute inset-y-0 left-0 bg-white"
      style={{
        width: filled ? '100%' : '0%',
        transitionProperty: 'width',
        transitionTimingFunction: 'linear',
        transitionDuration: filled ? `${duration}ms` : '0ms',
      }}
    />
  )
}
