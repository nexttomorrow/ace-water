import SubPageBanner from '@/components/SubPageBanner'
import CompanyIntro from './CompanyIntro'

export const revalidate = 0

export default function CompanyPage() {
  return (
    <>
      <SubPageBanner
        href="/about"
        fallbackTitle="회사소개"
        fallbackSubtitle="에이스엔지니어링의 환경·산업디자인 전문 브랜드, 에이스워터를 소개합니다"
      />
      <CompanyIntro />
    </>
  )
}
