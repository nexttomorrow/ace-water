'use client'

/**
 * 견적 문의 폼의 공통 외피.
 * - 상단: 인트로(전화/이메일 안내)
 * - 에러 메시지
 * - 자식: 각 폼만의 섹션들 (직접 컴포지션)
 * - 하단: 개인정보 동의 체크 + 제출 버튼 + 안내문
 *
 * 폼이 4~5개 더 추가되어도 외피는 동일, 안만 다르게 컴포지션.
 */

type Props = {
  action: (formData: FormData) => Promise<void>
  errorMessage?: string
  children: React.ReactNode
}

export default function EstimateShell({ action, errorMessage, children }: Props) {
  return (
    <form action={action} className="flex flex-col gap-12">
      {/* 인트로 */}
      <header className="text-center">
        <p className="mx-auto max-w-[560px] text-[13px] leading-[1.85] text-neutral-600 md:text-[14px]">
          기타 문의는{' '}
          <a href="tel:0319442903" className="font-semibold text-neutral-900 hover:underline">
            031-944-2903
          </a>{' '}
          (평일 09–17시 / 점심 12–13시 제외) 또는{' '}
          <a
            href="mailto:acewater@acewater.net"
            className="font-semibold text-neutral-900 hover:underline"
          >
            acewater@acewater.net
          </a>{' '}
          로 가능합니다.
        </p>
      </header>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {errorMessage}
        </div>
      )}

      <p className="-mb-6 text-right text-[12px] text-red-600">
        <span aria-hidden>*</span>표시는 필수 기입란입니다.
      </p>

      {children}

      {/* 개인정보 동의 */}
      <div className="flex items-center justify-center gap-2 border-t border-neutral-100 pt-8 text-[13px]">
        <label className="inline-flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            name="privacy_agreed"
            required
            className="h-4 w-4 cursor-pointer accent-blue-600"
          />
          <span className="text-neutral-700">
            <span className="font-semibold text-red-600">(필수)</span> 개인정보 취급 처리 방침에
            동의합니다.
          </span>
        </label>
      </div>

      <p className="-mt-6 text-center text-[12px] text-neutral-500">
        빠른 시일 내에 회신드리도록 하겠습니다.
      </p>

      {/* 제출 */}
      <div className="flex justify-center">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-10 py-3.5 text-[14px] font-bold text-white shadow-[0_18px_36px_-18px_rgba(37,99,235,0.5)] transition hover:shadow-[0_22px_40px_-18px_rgba(37,99,235,0.6)]"
        >
          제출하기
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </form>
  )
}
