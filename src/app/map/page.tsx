import SubPageBanner from '@/components/SubPageBanner'
import LocationContent from './LocationContent'

export const revalidate = 0

export default function MapPage() {
  return (
    <>
      <SubPageBanner
        href="/map"
        fallbackTitle="오시는 길"
        fallbackSubtitle="에이스엔지니어링이 자리한 자리, 직접 만나러 와주세요"
      />
      <LocationContent />
    </>
  )
}
