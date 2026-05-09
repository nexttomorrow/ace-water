'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

type Props = {
  title: string
  description: string | null
  modelName: string | null
  siteName: string | null
  clientName: string | null
  productLinks: { href: string; name: string }[]
  images: string[]
  categoryName: string | null
  /** 이전/다음 시공사례 링크 — 좌우 화살표가 사진이 아닌 사례를 이동시킴 */
  prevHref: string | null
  nextHref: string | null
}

const VISIBLE_THUMBS = 6 // 썸네일 row 에 보일 최대 개수 (마지막 한 칸은 +N 더보기 자리)

export default function CaseDetail({
  title,
  description,
  modelName,
  siteName,
  clientName,
  productLinks,
  images,
  categoryName,
  prevHref,
  nextHref,
}: Props) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  // ESC 로 라이트박스 닫기 + 좌우 키 네비
  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowRight')
        setActiveIdx((i) => (i + 1) % images.length)
      if (e.key === 'ArrowLeft')
        setActiveIdx((i) => (i - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [lightboxOpen, images.length])

  const total = images.length
  const showOverflow = total > VISIBLE_THUMBS
  const visible = showOverflow ? images.slice(0, VISIBLE_THUMBS - 1) : images
  const overflowCount = total - (VISIBLE_THUMBS - 1)

  // 슬라이드 좌우 — 끝에 도달하면 반대쪽으로 무한 루프
  const goPrev = () => setActiveIdx((i) => (i - 1 + total) % total)
  const goNext = () => setActiveIdx((i) => (i + 1) % total)

  // 모바일 스와이프 + 클릭(라이트박스) 분리
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const swipedRef = useRef(false)

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    swipedRef.current = false
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current
    touchStart.current = null
    if (!start) return
    const dx = e.changedTouches[0].clientX - start.x
    const dy = e.changedTouches[0].clientY - start.y
    // 가로 변위가 50px 이상이고 세로보다 클 때만 스와이프로 인정
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      swipedRef.current = true
      if (dx > 0) goPrev()
      else goNext()
    }
  }
  const onContainerClick = () => {
    if (swipedRef.current) {
      swipedRef.current = false
      return
    }
    setLightboxOpen(true)
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-12">
        {/* 이미지 영역 */}
        <div className="md:col-span-7">
          <div
            className="group relative aspect-[4/3] cursor-zoom-in select-none overflow-hidden rounded-xl bg-neutral-100 touch-pan-y"
            onClick={onContainerClick}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {/* 슬라이드 트랙 */}
            <div
              className="flex h-full transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${activeIdx * 100}%)` }}
            >
              {images.map((src, i) => (
                <div
                  key={src + i}
                  className="relative h-full w-full shrink-0"
                  aria-hidden={i !== activeIdx}
                >
                  <Image
                    src={src}
                    alt={`${title} 이미지 ${i + 1}`}
                    fill
                    priority={i === 0}
                    unoptimized
                    draggable={false}
                    className="object-cover"
                    sizes="(min-width: 768px) 66vw, 100vw"
                  />
                </div>
              ))}
            </div>

            {/* prev/next 화살표 — 이전/다음 "사례" 로 이동 (이미지 변경 X) */}
            {prevHref && (
              <Link
                href={prevHref}
                aria-label="이전 사례"
                onClick={(e) => e.stopPropagation()}
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/95 text-neutral-900 shadow-md ring-1 ring-black/5 transition hover:bg-white md:left-4 md:h-11 md:w-11 md:opacity-0 md:group-hover:opacity-100"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </Link>
            )}
            {nextHref && (
              <Link
                href={nextHref}
                aria-label="다음 사례"
                onClick={(e) => e.stopPropagation()}
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/95 text-neutral-900 shadow-md ring-1 ring-black/5 transition hover:bg-white md:right-4 md:h-11 md:w-11 md:opacity-0 md:group-hover:opacity-100"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            )}

            {/* 좌하단 카운터 */}
            {total > 1 && (
              <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[0.75rem] font-medium text-white backdrop-blur md:bottom-4 md:left-4">
                {activeIdx + 1} / {total}
              </div>
            )}

            {/* 우상단 확대 아이콘 */}
            <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/55 p-2 text-white opacity-0 backdrop-blur transition group-hover:opacity-100 md:right-4 md:top-4">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5M11 8v6M8 11h6" />
              </svg>
            </span>
          </div>

          {/* 썸네일 strip */}
          {total > 1 && (
            <div className="mt-3 grid grid-cols-6 gap-2">
              {visible.map((src, i) => {
                const isActive = i === activeIdx
                return (
                  <button
                    type="button"
                    key={src + i}
                    onClick={() => setActiveIdx(i)}
                    className={`relative aspect-square overflow-hidden rounded transition duration-200 ${
                      isActive
                        ? 'opacity-100'
                        : 'opacity-40 grayscale hover:opacity-80 hover:grayscale-0'
                    }`}
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="120px"
                    />
                  </button>
                )
              })}
              {showOverflow && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveIdx(VISIBLE_THUMBS - 1)
                    setLightboxOpen(true)
                  }}
                  className="relative aspect-square overflow-hidden rounded bg-neutral-200 transition hover:bg-neutral-300"
                >
                  <Image
                    src={images[VISIBLE_THUMBS - 1]}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover opacity-50"
                    sizes="120px"
                  />
                  <span className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <span className="text-[1rem] font-bold leading-none">
                      +{overflowCount}
                    </span>
                    <span className="mt-1 text-[0.75rem] font-medium tracking-wide">
                      더보기
                    </span>
                  </span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* 사이드바 */}
        <aside className="md:col-span-5">
          <div className="md:sticky md:top-24">
            {categoryName && (
              <p className="text-[0.875rem] font-semibold uppercase tracking-[0.3em] text-blue-700">
                {categoryName}
              </p>
            )}

            <h1 className="mt-1 text-[1.5rem] font-extrabold leading-[1.3] tracking-tight md:text-[1.75rem]">
              {modelName || title}
            </h1>

            {modelName && modelName !== title && (
              <p className="mt-2 text-[0.875rem] text-neutral-500">{title}</p>
            )}

            <div className="mt-7 space-y-4 border-t border-neutral-200 pt-7 text-[0.875rem]">
              <Field label="현장명" value={siteName} />
              <Field label="발주처" value={clientName} />
            </div>

            {description && (
              <div className="mt-7 border-t border-neutral-200 pt-7">
                <p className="text-[0.75rem] font-semibold uppercase tracking-[0.3em] text-neutral-500">
                  Description
                </p>
                <p className="mt-3 whitespace-pre-line text-[0.875rem] leading-[1.85] text-neutral-700">
                  {description}
                </p>
              </div>
            )}

            {productLinks.length > 0 && (
              <div className="mt-8 border-t border-neutral-200 pt-7">
                <p className="text-[0.875rem] font-bold text-neutral-900">관련 제품</p>
                <ul className="mt-3 space-y-1.5">
                  {productLinks.map((p) => (
                    <li key={p.href}>
                      <Link
                        href={p.href}
                        className="group inline-flex items-center gap-1.5 text-[0.875rem] font-medium text-neutral-700 transition hover:text-blue-700"
                      >
                        <span>{p.name}</span>
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-neutral-400 transition group-hover:translate-x-0.5 group-hover:text-blue-700"
                        >
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA — 제품 보러가기 (관련 제품 1개면 그 제품으로, 아니면 전체 카탈로그로) */}
            <Link
              href={productLinks.length === 1 ? productLinks[0].href : '/products'}
              className="group mt-7 inline-flex w-full items-center justify-between gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3.5 text-[0.875rem] font-bold text-white shadow-[0_18px_36px_-18px_rgba(37,99,235,0.5)] transition hover:shadow-[0_22px_40px_-18px_rgba(37,99,235,0.6)]"
            >
              <span>제품 보러가기</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="transition-transform group-hover:translate-x-0.5"
              >
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/construction-cases"
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-neutral-200 bg-white px-6 py-3 text-[0.875rem] font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              목록으로
            </Link>
          </div>
        </aside>
      </div>

      {/* 라이트박스 */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setLightboxOpen(false)
            }}
            aria-label="닫기"
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {total > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveIdx((i) => (i - 1 + images.length) % images.length)
                }}
                aria-label="이전"
                className="absolute left-5 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveIdx((i) => (i + 1) % images.length)
                }}
                aria-label="다음"
                className="absolute right-5 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </>
          )}

          <div
            className="relative h-full max-h-[85vh] w-full max-w-[1100px]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[activeIdx]}
              alt={title}
              fill
              unoptimized
              priority
              className="object-contain"
              sizes="100vw"
            />
          </div>

          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[0.75rem] tracking-[0.3em] text-white/70">
            {activeIdx + 1} / {total}
          </p>
        </div>
      )}
    </>
  )
}

function Field({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return (
    <div className="flex items-baseline gap-4">
      <span className="w-16 shrink-0 text-[0.75rem] font-medium uppercase tracking-[0.2em] text-neutral-400">
        {label}
      </span>
      <span className="flex-1 text-[0.875rem] text-neutral-800">{value}</span>
    </div>
  )
}
