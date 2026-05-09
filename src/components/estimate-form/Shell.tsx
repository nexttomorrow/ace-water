"use client";

import ContactInfoBox from "@/components/ContactInfoBox";
import PrivacyAgreementBox from "@/components/PrivacyAgreementBox";

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
  action: (formData: FormData) => Promise<void>;
  errorMessage?: string;
  children: React.ReactNode;
};

export default function EstimateShell({
  action,
  errorMessage,
  children,
}: Props) {
  return (
    <form action={action} className="flex flex-col gap-12">
      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {errorMessage}
        </div>
      )}

      <p className="-mb-6 text-right text-[12px] text-red-600">
        <span aria-hidden>*</span>표시는 필수 기입란입니다.
      </p>

      {children}

      {/* 하단 동의 및 안내 (묶음) */}
      <div className="flex flex-col gap-3 border-t border-neutral-100 pt-8">
        <PrivacyAgreementBox />
        <ContactInfoBox />
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
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </form>
  );
}
