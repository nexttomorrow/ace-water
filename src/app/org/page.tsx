import SubPageBanner from '@/components/SubPageBanner'
import OrgChart from './OrgChart'

export const revalidate = 0

export default function OrgPage() {
  return (
    <>
      <SubPageBanner
        href="/org"
        fallbackTitle="조직도"
        fallbackSubtitle=""
      />
      <OrgChart />
    </>
  )
}
