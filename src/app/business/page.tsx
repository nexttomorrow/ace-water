import SubPageBanner from '@/components/SubPageBanner'
import BusinessContent from './BusinessContent'

export const metadata = {
  title: '비즈니스 문의 | ACEWATER',
}

export default function BusinessPage() {
  return (
    <>
      <SubPageBanner
        href="/business"
        fallbackTitle="비즈니스 문의"
        fallbackSubtitle="ACEWATER와 함께하는 신뢰의 비즈니스 파트너십"
      />
      <BusinessContent />
    </>
  )
}
