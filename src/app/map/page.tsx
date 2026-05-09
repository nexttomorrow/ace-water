import SubPageBanner from '@/components/SubPageBanner'
import LocationContent from './LocationContent'

export const revalidate = 0

export default function MapPage() {
  return (
    <>
      <SubPageBanner
        href="/map"
        fallbackTitle="오시는 길"
        fallbackSubtitle=""
      />
      <LocationContent />
    </>
  )
}
