"use client";

/**
 * 제품 리스트 카드 — 이미지 캐러셀 (메인 + 추가 이미지) + 도트 + 화살표 + 모바일 스와이프.
 * 카드 전체는 /products/{id} 로 이동. 화살표·도트 클릭은 stopPropagation 으로 네비 막음.
 */

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { PRODUCT_TAG_BY_VALUE } from "@/lib/types";

const BADGE_TONE: Record<string, string> = {
  blue: "bg-blue-600 text-white",
  red: "bg-red-600 text-white",
  amber: "bg-amber-500 text-white",
  neutral: "bg-neutral-900 text-white",
};

const TAG_PRIORITY = ["best", "new", "recommended", "featured"];

function pickPrimaryTag(tags: string[] | undefined) {
  if (!tags || tags.length === 0) return null;
  for (const t of TAG_PRIORITY) {
    if (tags.includes(t)) return PRODUCT_TAG_BY_VALUE[t] ?? null;
  }
  return null;
}

export type CarouselCardItem = {
  id: number;
  name: string;
  modelName: string | null;
  images: string[];
  tags?: string[];
  /** 색상 옵션 — 카드에 작은 스와치로 노출 (최대 4개 + N) */
  colors?: { name: string; hex: string }[];
  /** 구성품 이름 리스트 — 카드에 일부 노출 + "외 N종" */
  componentNames?: string[];
};

export default function ProductCarouselCard({
  item,
}: {
  item: CarouselCardItem;
}) {
  const [active, setActive] = useState(0);
  const total = item.images.length;
  const tag = pickPrimaryTag(item.tags);

  const goPrev = () => setActive((i) => (i - 1 + total) % total);
  const goNext = () => setActive((i) => (i + 1) % total);

  // 모바일 스와이프
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) goPrev();
      else goNext();
    }
  };

  // 단일 이미지면 캐러셀 컨트롤 숨김
  const showControls = total > 1;

  // 컴포넌트 일부만 카드에 노출
  const VISIBLE_COMPONENTS = 3;
  const visibleComponents = (item.componentNames ?? []).slice(
    0,
    VISIBLE_COMPONENTS,
  );
  const hiddenComponentsCount =
    (item.componentNames ?? []).length - visibleComponents.length;

  // 활성 색상 — hover 로 변경
  const [activeColorIdx, setActiveColorIdx] = useState(0);
  const activeColor = item.colors?.[activeColorIdx] ?? item.colors?.[0] ?? null;

  // 견적문의 prefill 토큰 — 제품상세의 버튼과 동일 포맷
  const estimateModel = item.modelName
    ? `${item.modelName} ${item.name}`
    : item.name;

  return (
    <article className="overflow-hidden bg-neutral-100/70 p-5 ring-1 ring-neutral-200/40">
      {/* 클릭 가능한 영역 (이미지 + 제목/색상/구성) — /products/{id} 로 이동 */}
      <Link href={`/products/${item.id}`} className="block">
        {/* 이미지 캐러셀 */}
        <div
          className="relative aspect-[4/3] overflow-hidden select-none touch-pan-y"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* 슬라이드 트랙 */}
          <div
            className="flex h-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${active * 100}%)` }}
          >
            {item.images.map((src, i) => (
              <div
                key={src + i}
                className="relative h-full w-full shrink-0"
                aria-hidden={i !== active}
              >
                <Image
                  src={src}
                  alt={item.name}
                  fill
                  unoptimized
                  draggable={false}
                  className="object-cover"
                  sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>

          {/* 좌상단 태그 배지 */}
          {tag && (
            <span
              className={`pointer-events-none absolute left-3 top-3 z-10 rounded-full px-2.5 py-0.5 text-[0.75rem] font-bold tracking-wider ${
                BADGE_TONE[tag.tone] ?? BADGE_TONE.neutral
              }`}
            >
              {tag.label}
            </span>
          )}

          {/* 도트 인디케이터 — 클릭 또는 모바일 스와이프로만 변경 */}
          {showControls && (
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
              {item.images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`이미지 ${i + 1}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActive(i);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === active
                      ? "w-5 bg-neutral-900"
                      : "w-1.5 bg-neutral-400/70 hover:w-3 hover:bg-neutral-700"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* 텍스트 영역 (카드 컨테이너 내부) */}
        <div className="mt-5">
          <p className="text-[1rem] font-bold leading-[1.4] tracking-tight text-neutral-900 line-clamp-2">
            {item.name}
          </p>
          {item.modelName && (
            <p className="mt-1.5 font-mono text-[0.75rem] tracking-tight text-neutral-500">
              {item.modelName}
            </p>
          )}

          {/* 색상 — Samsung 스타일: 색상명 위 + 스와치 아래 */}
          {item.colors && item.colors.length > 0 && (
            <div className="mt-4">
              <p className="text-[0.75rem] font-medium text-neutral-700">
                {activeColor?.name}
              </p>
              <div className="mt-2 flex items-center gap-1.5">
                {item.colors.map((c, i) => {
                  const isActive = i === activeColorIdx;
                  return (
                    <button
                      key={i}
                      type="button"
                      aria-label={c.name}
                      title={c.name}
                      onMouseEnter={() => setActiveColorIdx(i)}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveColorIdx(i);
                      }}
                      className={`relative h-5 w-5 overflow-hidden rounded-full ring-1 transition ${
                        isActive
                          ? "ring-2 ring-neutral-900 ring-offset-1"
                          : "ring-neutral-300 hover:ring-neutral-500"
                      }`}
                    >
                      <span
                        className="block h-full w-full"
                        style={{ background: c.hex }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 구성품 — 각 이름 노출 */}
          {visibleComponents.length > 0 && (
            <div className="mt-4">
              <p className="text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                구성품
              </p>
              <ul className="mt-1.5 flex flex-wrap gap-1">
                {visibleComponents.map((n, i) => (
                  <li
                    key={i}
                    className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-[0.75rem] text-neutral-700"
                  >
                    {n}
                  </li>
                ))}
                {hiddenComponentsCount > 0 && (
                  <li className="inline-flex items-center text-[0.75rem] text-neutral-500">
                    외 {hiddenComponentsCount}종
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </Link>

      {/* 견적문의 버튼 — 모델명 + 제품명을 prefill */}
      <Link
        href={`/design-estimate?model=${encodeURIComponent(estimateModel)}`}
        className="mt-5 block w-full rounded-full bg-neutral-900 py-3 text-center text-[0.875rem] font-bold text-white transition hover:bg-neutral-700"
      >
        견적문의
      </Link>
    </article>
  );
}
