import SubPageBanner from '@/components/SubPageBanner'
import CompanyIntro from './CompanyIntro'

export const revalidate = 0

export default function CompanyPage() {
  return (
    <>
      <SubPageBanner href="/about" />
      <CompanyIntro />
    </>
  )
}
