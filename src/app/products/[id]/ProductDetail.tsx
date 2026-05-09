'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { Product } from '@/lib/types'

type ComponentTag = {
  name: string
  targetId: number | null
  targetName: string | null
  quantity: number | null
}

function withQuantity(name: string, quantity: number | null): string {
  if (!quantity || quantity <= 1) return name
  return `${name} × ${quantity}`
}

type LinkedCase = {
  id: number
  title: string
  siteName: string | null
  imageUrl: string
}

type Props = {
  product: Product
  categoryName: string | null
  images: string[]
  componentTags: ComponentTag[]
  specSheetUrl: string | null
  linkedCases: LinkedCase[]
}

const VISIBLE_THUMBS = 6

export default function ProductDetail({
  product,
  categoryName,
  images,
  componentTags,
  specSheetUrl,
  linkedCases,
}: Props) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [tab, setTab] = useState<'detail' | 'cases'>('detail')

  const total = images.length
  const showOverflow = total > VISIBLE_THUMBS
  const visibleThumbs = showOverflow ? images.slice(0, VISIBLE_THUMBS - 1) : images
  const overflowCount = total - (VISIBLE_THUMBS - 1)

  const goPrev = () => setActiveIdx((i) => (i - 1 + total) % total)
  const goNext = () => setActiveIdx((i) => (i + 1) % total)

  // 모바일 스와이프
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current
    touchStart.current = null
    if (!start) return
    const dx = e.changedTouches[0].clientX - start.x
    const dy = e.changedTouches[0].clientY - start.y
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) goPrev()
      else goNext()
    }
  }

  const scrollToDetail = () => {
    setTab('detail')
    requestAnimationFrame(() => {
      document.getElementById('product-tabs')?.scrollIntoView({ behavior: 'smooth' })
    })
  }

  // 키보드 좌우 화살표로 이미지 변경 (선택적)
  useEffect(() => {
    if (total <= 1) return
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
        return
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total])

  return (
    <>
      <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-12">
        {/* LEFT — 이미지 갤러리 */}
        <div className="md:col-span-7">
          <div
            className="group relative aspect-[4/3] select-none overflow-hidden rounded-2xl bg-neutral-100"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div
              className="flex h-full transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${activeIdx * 100}%)` }}
            >
              {images.map((src, i) => (
                <div key={src + i} className="relative h-full w-full shrink-0">
                  <Image
                    src={src}
                    alt={`${product.name} 이미지 ${i + 1}`}
                    fill
                    priority={i === 0}
                    unoptimized
                    draggable={false}
                    className="object-cover"
                    sizes="(min-width: 768px) 60vw, 100vw"
                  />
                </div>
              ))}
            </div>

            {total > 1 && (
              <>
                <button
                  type="button"
                  aria-label="이전 이미지"
                  onClick={goPrev}
                  className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-neutral-900 shadow-md ring-1 ring-black/5 transition hover:bg-white md:left-4 md:h-11 md:w-11 md:opacity-0 md:group-hover:opacity-100"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="다음 이미지"
                  onClick={goNext}
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-neutral-900 shadow-md ring-1 ring-black/5 transition hover:bg-white md:right-4 md:h-11 md:w-11 md:opacity-0 md:group-hover:opacity-100"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>

                <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[0.75rem] font-medium text-white backdrop-blur md:bottom-4 md:left-4">
                  {activeIdx + 1} / {total}
                </div>
              </>
            )}
          </div>

          {total > 1 && (
            <div className="mt-3 grid grid-cols-6 gap-2">
              {visibleThumbs.map((src, i) => {
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
                    <Image src={src} alt="" fill unoptimized className="object-cover" sizes="120px" />
                  </button>
                )
              })}
              {showOverflow && (
                <button
                  type="button"
                  onClick={() => setActiveIdx(VISIBLE_THUMBS - 1)}
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
                    <span className="text-[1rem] font-bold leading-none">+{overflowCount}</span>
                    <span className="mt-1 text-[0.75rem] font-medium tracking-wide">더보기</span>
                  </span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* RIGHT — 스펙 사이드바 */}
        <aside className="md:col-span-5">
          <div className="md:sticky md:top-24">
            {categoryName && (
              <p className="text-[0.875rem] font-semibold uppercase tracking-[0.3em] text-blue-700">
                {categoryName}
              </p>
            )}

            {product.model_name && (
              <h1 className="mt-2 text-[1.625rem] font-extrabold leading-[1.2] tracking-tight md:text-[1.875rem]">
                {product.model_name}
              </h1>
            )}
            <p className="mt-1 text-[1rem] text-neutral-500">{product.name}</p>

            <button
              type="button"
              onClick={scrollToDetail}
              className="mt-3 inline-flex items-center gap-1 text-[0.875rem] font-medium text-neutral-700 underline-offset-4 hover:text-blue-700 hover:underline"
            >
              <span className="text-rose-500">*</span>
              상세정보 자세히보기 (클릭)
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            <div className="mt-7 space-y-5 border-t border-neutral-200 pt-6">
              <SpecRow label="시공타입" text={product.install_type} />
              <SpecRow label="사이즈" text={formatSize(product)} />
              <SpecRow label="소재" text={product.material} />
              {componentTags.length > 0 && (
                <div>
                  <p className="text-[0.875rem] font-bold text-neutral-900">구성품</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {componentTags.map((t, i) => {
                      const baseCls =
                        'inline-flex items-center rounded-full px-3 py-1 text-[0.75rem] font-medium transition'
                      const display = withQuantity(t.name, t.quantity)
                      if (t.targetId) {
                        return (
                          <Link
                            key={i}
                            href={`/products/${t.targetId}`}
                            className={`${baseCls} border border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-600 hover:bg-blue-600 hover:text-white`}
                          >
                            {display}
                          </Link>
                        )
                      }
                      return (
                        <span
                          key={i}
                          className={`${baseCls} border border-neutral-200 bg-white text-neutral-700`}
                        >
                          {display}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
              <SpecRow label="별도설비 (추가 가능)" text={product.extras_text} />

              {/* 색상 옵션 */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <p className="text-[0.875rem] font-bold text-neutral-900">색상</p>
                  <ColorSwatches colors={product.colors} />
                </div>
              )}
            </div>

            {/* Action buttons — 모델명을 견적·도면 문의 폼에 자동 prefill */}
            <div className="mt-7 grid grid-cols-2 gap-2">
              <Link
                href={`/design-estimate?model=${encodeURIComponent(
                  product.model_name
                    ? `${product.model_name} ${product.name}`
                    : product.name
                )}`}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-[0.875rem] font-bold text-white shadow-[0_18px_36px_-18px_rgba(37,99,235,0.5)] hover:shadow-[0_22px_40px_-18px_rgba(37,99,235,0.6)]"
              >
                견적문의
              </Link>
              <Link
                href={`/design-estimate?model=${encodeURIComponent(
                  product.model_name
                    ? `${product.model_name} ${product.name}`
                    : product.name
                )}&drawing=1`}
                className="inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white px-4 py-3 text-[0.875rem] font-bold text-neutral-900 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                도면문의
              </Link>
              <a
                href={specSheetUrl ?? '#'}
                target={specSheetUrl ? '_blank' : undefined}
                rel="noreferrer"
                aria-disabled={!specSheetUrl}
                className={`inline-flex items-center justify-center rounded-full border px-4 py-3 text-[0.875rem] font-bold transition ${
                  specSheetUrl
                    ? 'border-neutral-200 bg-white text-neutral-900 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white'
                    : 'pointer-events-none border-neutral-200 bg-neutral-50 text-neutral-400'
                }`}
              >
                시방서 다운
              </a>
              <Link
                href={
                  product.category_id
                    ? `/products?category=${product.category_id}`
                    : '/products'
                }
                className="inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white px-4 py-3 text-[0.875rem] font-bold text-neutral-900 transition hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
              >
                목록으로
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* TABS */}
      <div id="product-tabs" className="mt-16 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <TabButton
            label="상세정보"
            active={tab === 'detail'}
            onClick={() => setTab('detail')}
          />
          <TabButton
            label={`시공사례${linkedCases.length > 0 ? ` (${linkedCases.length})` : ''}`}
            active={tab === 'cases'}
            onClick={() => setTab('cases')}
          />
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="py-10">
        {tab === 'detail' ? (
          <DetailTabContent
            product={product}
            mainImage={images[0] ?? null}
            componentTags={componentTags}
          />
        ) : (
          <CasesTabContent linkedCases={linkedCases} />
        )}
      </div>
    </>
  )
}

function ColorSwatches({ colors }: { colors: { name: string; hex: string }[] }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const active = colors[activeIdx] ?? colors[0]
  return (
    <div className="mt-2">
      <p className="text-[0.875rem] font-medium text-neutral-700">{active?.name}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {colors.map((c, i) => {
          const isActive = i === activeIdx
          return (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIdx(i)}
              onMouseEnter={() => setActiveIdx(i)}
              aria-label={c.name}
              title={c.name}
              className={`relative h-9 w-9 overflow-hidden rounded-full ring-2 transition ${
                isActive
                  ? 'ring-neutral-900 ring-offset-2'
                  : 'ring-neutral-200 hover:ring-neutral-400'
              }`}
            >
              <span className="block h-full w-full" style={{ background: c.hex }} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * W × D × H (mm) + 넓이/부피 자동 표기 + size_text(보조 메모) 합쳐서 반환.
 * 셋 다 비어있고 size_text 도 없으면 null → SpecRow/SpecListRow 가 자동으로 행을 숨김.
 */
function formatSize(product: Product): string | null {
  const w = product.size_w ?? 0
  const d = product.size_d ?? 0
  const h = product.size_h ?? 0
  const fmt = (n: number) =>
    n.toLocaleString('ko-KR', { maximumFractionDigits: 4 })

  const lines: string[] = []
  if (w || d || h) {
    lines.push(
      `W ${w ? fmt(w) : '?'} × D ${d ? fmt(d) : '?'} × H ${h ? fmt(h) : '?'} mm`
    )
    if (w && d) {
      const areaM2 = (w * d) / 1_000_000
      lines.push(`넓이 ${fmt(areaM2)} m²`)
    }
    if (w && d && h) {
      const volL = (w * d * h) / 1_000_000
      lines.push(`부피 ${fmt(volL)} L`)
    }
  }
  if (product.size_text && product.size_text.trim()) {
    lines.push(product.size_text)
  }
  return lines.length > 0 ? lines.join('\n') : null
}

function SpecRow({ label, text }: { label: string; text: string | null }) {
  if (!text || !text.trim()) return null
  return (
    <div>
      <p className="text-[0.875rem] font-bold text-neutral-900">{label}</p>
      <div className="mt-1 space-y-0.5 text-[0.875rem] leading-relaxed text-neutral-700">
        {text.split('\n').map((line, i) => {
          const trimmed = line.trim()
          if (trimmed.startsWith('*')) {
            return (
              <p key={i} className="text-[0.875rem] text-rose-600">
                {trimmed}
              </p>
            )
          }
          return <p key={i}>{line}</p>
        })}
      </div>
    </div>
  )
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative px-6 py-3 text-[1rem] font-semibold transition ${
        active ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-700'
      }`}
    >
      {label}
      {active && (
        <span className="absolute inset-x-2 -bottom-px h-[2px] bg-neutral-900" />
      )}
    </button>
  )
}

function DetailTabContent({
  product,
  mainImage,
  componentTags,
}: {
  product: Product
  mainImage: string | null
  componentTags: ComponentTag[]
}) {
  const hasDescription = product.description && product.description.trim() !== '<p></p>' && product.description.trim() !== ''
  return (
    <div className="space-y-12">
      {/* 큰 대표 이미지 */}
      {mainImage && (
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-neutral-100">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            unoptimized
            className="object-cover"
            sizes="(min-width: 768px) 80vw, 100vw"
          />
        </div>
      )}

      {/* 제품사양 표 */}
      <section>
        <h3 className="mb-6 text-center text-[1.125rem] font-bold tracking-tight">제품사양</h3>
        <dl className="mx-auto max-w-3xl divide-y divide-neutral-200 border-y border-neutral-200">
          <SpecListRow label="모델명" text={product.model_name} />
          <SpecListRow label="제품명" text={product.name} />
          <SpecListRow label="시공타입" text={product.install_type} />
          <SpecListRow label="사이즈" text={formatSize(product)} />
          <SpecListRow label="소재" text={product.material} />
          {componentTags.length > 0 && (
            <div className="grid grid-cols-12 gap-3 px-4 py-4">
              <dt className="col-span-12 text-[0.875rem] font-bold text-neutral-900 md:col-span-3">
                구성품
              </dt>
              <dd className="col-span-12 md:col-span-9">
                <div className="flex flex-wrap gap-1.5">
                  {componentTags.map((t, i) => {
                    const display = withQuantity(t.name, t.quantity)
                    return t.targetId ? (
                      <Link
                        key={i}
                        href={`/products/${t.targetId}`}
                        className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[0.75rem] font-medium text-blue-700 transition hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                      >
                        {display}
                      </Link>
                    ) : (
                      <span
                        key={i}
                        className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-[0.75rem] font-medium text-neutral-700"
                      >
                        {display}
                      </span>
                    )
                  })}
                </div>
              </dd>
            </div>
          )}
          <SpecListRow label="별도설비 (추가항목)" text={product.extras_text} />
          {product.colors && product.colors.length > 0 && (
            <div className="grid grid-cols-12 gap-3 px-4 py-4">
              <dt className="col-span-12 text-[0.875rem] font-bold text-neutral-900 md:col-span-3">
                색상
              </dt>
              <dd className="col-span-12 md:col-span-9">
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[0.75rem] text-neutral-700"
                      title={c.name}
                    >
                      <span
                        className="block h-4 w-4 rounded-full ring-1 ring-neutral-300"
                        style={{ background: c.hex }}
                      />
                      {c.name}
                    </span>
                  ))}
                </div>
              </dd>
            </div>
          )}
        </dl>
      </section>

      {/* 부가 설명 (rich html) */}
      {hasDescription && (
        <section className="mx-auto max-w-3xl">
          <div
            className="prose prose-neutral max-w-none [&_img]:rounded-lg [&_table]:border [&_table]:border-collapse [&_th]:border [&_th]:border-neutral-300 [&_th]:bg-neutral-100 [&_th]:px-2 [&_th]:py-1 [&_td]:border [&_td]:border-neutral-300 [&_td]:px-2 [&_td]:py-1"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </section>
      )}
    </div>
  )
}

function SpecListRow({ label, text }: { label: string; text: string | null }) {
  if (!text || !text.trim()) return null
  return (
    <div className="grid grid-cols-12 gap-3 px-4 py-4">
      <dt className="col-span-12 text-[0.875rem] font-bold text-neutral-900 md:col-span-3">
        {label}
      </dt>
      <dd className="col-span-12 space-y-0.5 text-[0.875rem] leading-relaxed text-neutral-700 md:col-span-9">
        {text.split('\n').map((line, i) => {
          const trimmed = line.trim()
          if (trimmed.startsWith('*')) {
            return (
              <p key={i} className="text-[0.875rem] font-medium text-rose-600">
                {trimmed}
              </p>
            )
          }
          return <p key={i}>{line}</p>
        })}
      </dd>
    </div>
  )
}

function CasesTabContent({ linkedCases }: { linkedCases: LinkedCase[] }) {
  if (linkedCases.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 p-12 text-center text-neutral-500">
        <svg className="mx-auto mb-3 h-10 w-10 text-neutral-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 16l5-5 4 4 3-3 6 6" />
        </svg>
        <p className="text-[0.875rem]">이 제품과 연결된 시공사례가 아직 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
      {linkedCases.map((c) => (
        <Link key={c.id} href={`/construction-cases/${c.id}`} className="group block">
          <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-neutral-100">
            <Image
              src={c.imageUrl}
              alt={c.title}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              unoptimized
              sizes="(min-width: 768px) 25vw, 50vw"
            />
          </div>
          <div className="mt-4">
            <p className="truncate text-[1rem] font-semibold text-neutral-900 transition group-hover:text-blue-700">
              {c.title}
            </p>
            {c.siteName && (
              <p className="mt-1 truncate text-[0.75rem] text-neutral-500">{c.siteName}</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
