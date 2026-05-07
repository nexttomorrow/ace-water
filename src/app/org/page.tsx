import SubPageBanner from '@/components/SubPageBanner'
import OrgChart from './OrgChart'

export const revalidate = 0

export default function OrgPage() {
  return (
    <>
      <SubPageBanner
        href="/org"
        fallbackTitle="조직도"
        fallbackSubtitle="사람과 기능이 만나, 더 나은 환경을 만들어 갑니다"
      />
      <OrgChart />
    </>
  )
}
