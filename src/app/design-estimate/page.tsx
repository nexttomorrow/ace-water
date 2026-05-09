import SubPageBanner from '@/components/SubPageBanner'
import SubmittedNotice from '@/components/estimate-form/SubmittedNotice'
import DesignEstimateForm from './DesignEstimateForm'
import { submitDesignEstimate } from './actions'
import { fetchEstimateProductPicker } from '@/lib/estimates/products-for-picker'

export const revalidate = 0

export default async function DesignEstimatePage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string
    submitted?: string
    /** 제품 상세 페이지의 견적문의 버튼이 보내는 모델명 prefill */
    model?: string
    /** 도면문의로 진입한 경우 1 (도면 요청 체크박스 자동 on) */
    drawing?: string
  }>
}) {
  const sp = await searchParams
  const submitted = sp.submitted === '1'

  // 제품 검색 모달용 데이터 (활성 제품 + 카테고리)
  const { categories, options } = submitted
    ? { categories: [], options: [] }
    : await fetchEstimateProductPicker()

  return (
    <>
      <SubPageBanner
        href="/design-estimate"
        fallbackTitle="실행견적 문의"
        fallbackSubtitle=""
      />

      <div className="mx-auto max-w-[900px] px-6 py-16 md:py-20">
        {submitted ? (
          <SubmittedNotice retryHref="/design-estimate" />
        ) : (
          <DesignEstimateForm
            action={submitDesignEstimate}
            errorMessage={sp.error}
            initialModelName={sp.model ?? ''}
            initialDrawingChecked={sp.drawing === '1'}
            productOptions={options}
            productCategories={categories}
          />
        )}
      </div>
    </>
  )
}
