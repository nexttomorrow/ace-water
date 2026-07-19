'use client'

import type { Popup } from '@/lib/types'

/**
 * 팝업 본문 렌더 — 이미지 또는 HTML. link_url 이 있으면 클릭 시 이동.
 * 이미지는 외부/스토리지 임의 URL 이 올 수 있어 next/image 대신 <img> 사용
 * (unoptimized 도메인 설정 불필요, 원본 크기/비율 유지).
 *
 * body_html 은 저장 시 서버 액션에서 sanitize-html 로 정화된 값이므로 여기서 재정화하지 않는다.
 * (클라이언트 번들에 sanitizer 를 싣지 않아 모든 페이지의 로딩 비용을 아낌)
 */
export default function PopupContent({ popup }: { popup: Popup }) {
  const inner =
    popup.content_type === 'html' ? (
      <div
        className="popup-html h-full w-full overflow-auto px-4 py-4 text-[0.9375rem] leading-relaxed text-neutral-800"
        dangerouslySetInnerHTML={{ __html: popup.body_html ?? '' }}
      />
    ) : popup.image_url ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={popup.image_url}
        alt={popup.title}
        // 세로는 자연 비율(h-auto) — 고정 높이가 없어도(autoHeight 슬라이드 포함) 안전
        className="block h-auto w-full object-contain"
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    ) : null

  if (!inner) return null

  if (popup.link_url) {
    return (
      <a
        href={popup.link_url}
        target={popup.open_new_tab ? '_blank' : undefined}
        rel={popup.open_new_tab ? 'noreferrer noopener' : undefined}
        className="block h-full w-full"
        aria-label={popup.title}
      >
        {inner}
      </a>
    )
  }

  return <div className="h-full w-full">{inner}</div>
}
