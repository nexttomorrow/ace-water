'use client'

import { useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, EffectFade, Pagination } from 'swiper/modules'
import type { Swiper as SwiperClass } from 'swiper'
import Image from 'next/image'

import 'swiper/css'
import 'swiper/css/effect-fade'

export type HeroSliderItem = {
  key: string
  src: string
  eyebrow?: string
  title: string
}

const AUTOPLAY_DELAY = 5000

export default function HeroSlider({ slides }: { slides: HeroSliderItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const swiperRef = useRef<SwiperClass | null>(null)

  if (slides.length === 0) return null

  const single = slides.length === 1

  return (
    <section className="relative h-[560px] w-full overflow-hidden bg-neutral-950 md:h-[640px]">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={single ? false : { delay: AUTOPLAY_DELAY, disableOnInteraction: false }}
        loop={!single}
        allowTouchMove={!single}
        speed={900}
        onSwiper={(s) => (swiperRef.current = s)}
        onSlideChange={(s) => setActiveIndex(s.realIndex)}
        className="h-full w-full"
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={slide.key} className="relative h-full w-full">
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src={slide.src}
                alt=""
                fill
                priority={i === 0}
                className={`object-cover transition-transform duration-[6000ms] ease-out ${
                  activeIndex === i ? 'scale-105' : 'scale-100'
                }`}
                unoptimized
              />
            </div>
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
                    <span
                      className={`absolute inset-y-0 left-0 bg-white transition-all ease-linear ${
                        activeIndex === i
                          ? 'w-full'
                          : i < activeIndex
                            ? 'w-full opacity-30'
                            : 'w-0'
                      }`}
                      style={
                        activeIndex === i
                          ? { transitionDuration: `${AUTOPLAY_DELAY}ms` }
                          : { transitionDuration: '300ms' }
                      }
                    />
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
