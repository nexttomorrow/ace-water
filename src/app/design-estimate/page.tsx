import SubPageBanner from '@/components/SubPageBanner'
import SubmittedNotice from '@/components/estimate-form/SubmittedNotice'
import DesignEstimateForm from './DesignEstimateForm'
import { submitDesignEstimate } from './actions'

export const revalidate = 0

export default async function DesignEstimatePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; submitted?: string }>
}) {
  const sp = await searchParams
  const submitted = sp.submitted === '1'

  return (
    <>
      <SubPageBanner
        href="/design-estimate"
        fallbackTitle="실행견적 문의"
        fallbackSubtitle="현장 정보와 모델·수량을 알려주시면 빠르게 견적을 회신드립니다"
      />

      <div className="mx-auto max-w-[900px] px-6 py-16 md:py-20">
        {submitted ? (
          <SubmittedNotice retryHref="/design-estimate" />
        ) : (
          <DesignEstimateForm
            action={submitDesignEstimate}
            errorMessage={sp.error}
          />
        )}
      </div>
    </>
  )
}
