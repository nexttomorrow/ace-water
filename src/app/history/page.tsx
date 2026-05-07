import SubPageBanner from '@/components/SubPageBanner'
import HistoryTimeline from './HistoryTimeline'

export const revalidate = 0

export default function HistoryPage() {
  return (
    <>
      <SubPageBanner
        href="/history"
        fallbackTitle="연혁"
        fallbackSubtitle="에이스엔지니어링이 걸어온 길, 그리고 다음 한 걸음"
      />
      <HistoryTimeline />
    </>
  )
}
