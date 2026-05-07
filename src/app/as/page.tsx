import SubPageBanner from '@/components/SubPageBanner'
import AsContent from './AsContent'

export const metadata = {
  title: 'AS센터 | ACEWATER',
}

export default function AsPage() {
  return (
    <>
      <SubPageBanner
        href="/as"
        fallbackTitle="AS센터"
        fallbackSubtitle="설치 이후의 신뢰까지, ACEWATER가 끝까지 책임집니다"
      />
      <AsContent />
    </>
  )
}
