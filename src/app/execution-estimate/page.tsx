import SubPageBanner from '@/components/SubPageBanner'
import EstimateForm from './EstimateForm'
import { submitEstimate } from './actions'

export const revalidate = 0

export default async function ExecutionEstimatePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; submitted?: string }>
}) {
  const sp = await searchParams
  const submitted = sp.submitted === '1'

  return (
    <>
      <SubPageBanner
        href="/execution-estimate"
        fallbackTitle="견적·도면 문의"
        fallbackSubtitle="실행견적·설계견적·도면·제작의뢰 — 한 번의 폼으로 빠르게 접수해드립니다"
      />

      <div className="mx-auto max-w-[900px] px-6 py-16 md:py-20">
        {submitted ? (
          <SubmittedNotice />
        ) : (
          <EstimateForm action={submitEstimate} errorMessage={sp.error} />
        )}
      </div>
    </>
  )
}

function SubmittedNotice() {
  return (
    <div className="rounded-2xl border border-blue-100 bg-gradient-to-b from-sky-50 to-white px-6 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M5 12l5 5L20 7" />
        </svg>
      </div>
      <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.4em] text-blue-700">
        Submitted
      </p>
      <h2 className="mt-3 text-[28px] font-extrabold leading-[1.3] tracking-tight md:text-[32px]">
        문의가 정상적으로 접수되었습니다.
      </h2>
      <p className="mx-auto mt-4 max-w-[480px] text-[14px] leading-[1.85] text-neutral-600">
        담당자가 확인 후 영업일 기준 1~2일 내에 회신드리겠습니다. 급하신 경우{' '}
        <a href="tel:0319442903" className="font-semibold text-blue-700 hover:underline">
          031-944-2903
        </a>{' '}
        으로 연락 부탁드립니다.
      </p>
      <a
        href="/execution-estimate"
        className="mt-8 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-[13px] font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
      >
        새 문의 작성
      </a>
    </div>
  )
}
