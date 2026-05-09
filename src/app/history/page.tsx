import SubPageBanner from '@/components/SubPageBanner'
import HistoryTimeline from './HistoryTimeline'

export const revalidate = 0

export default function HistoryPage() {
  return (
    <>
      <SubPageBanner
        href="/history"
        fallbackTitle="연혁"
        fallbackSubtitle=""
      />
      <HistoryTimeline />
    </>
  )
}
