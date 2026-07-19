'use client' // 에러 바운더리는 반드시 클라이언트 컴포넌트

/**
 * 어드민 전용 에러 바운더리.
 *
 * 프로덕션에서는 Next 가 에러 메시지를 감추고 `digest`(해시)만 넘겨줍니다.
 * 그 digest 를 화면에 보여줘야 Vercel 로그에서 같은 값을 찾아 원인을 특정할 수 있습니다.
 */

import { useEffect } from 'react'
import Link from 'next/link'

export default function AdminError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error('[mng] page error:', error)
  }, [error])

  return (
    <div className="mx-auto max-w-lg px-6 py-20 text-center">
      <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-600">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <path d="M12 8v5" />
          <circle cx="12" cy="16.5" r="0.5" fill="currentColor" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      </div>

      <h2 className="text-[1.125rem] font-bold tracking-tight text-neutral-900">
        페이지를 불러오지 못했어요
      </h2>
      <p className="mt-2 text-[0.875rem] leading-relaxed text-neutral-500">
        일시적인 오류일 수 있어요. 다시 시도해보고, 계속 같은 화면이 나오면 아래 오류
        코드를 알려주세요.
      </p>

      {error.digest && (
        <p className="mt-4 inline-block rounded bg-neutral-100 px-3 py-1.5 font-mono text-[0.75rem] text-neutral-600">
          오류 코드: {error.digest}
        </p>
      )}

      <div className="mt-7 flex justify-center gap-2">
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="rounded bg-neutral-900 px-4 py-2 text-[0.875rem] font-medium text-white transition hover:bg-neutral-700"
        >
          다시 시도
        </button>
        <Link
          href="/mng"
          className="rounded border border-neutral-300 bg-white px-4 py-2 text-[0.875rem] transition hover:bg-neutral-100"
        >
          대시보드로
        </Link>
      </div>
    </div>
  )
}
