/**
 * 공개 사이트 공통 로딩 스켈레톤.
 * 헤더/푸터는 루트 레이아웃에 남고 본문만 이 화면으로 교체되므로,
 * 링크 클릭 즉시 반응이 보인다.
 */
export default function Loading() {
  return (
    <div className="mx-auto max-w-[1440px] animate-pulse px-6 py-16">
      <div className="h-3 w-24 rounded bg-neutral-200" />
      <div className="mt-4 h-9 w-72 max-w-full rounded bg-neutral-200" />
      <div className="mt-3 h-4 w-96 max-w-full rounded bg-neutral-100" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[4/3] rounded-xl bg-neutral-100" />
            <div className="mt-3 h-4 w-3/4 rounded bg-neutral-100" />
            <div className="mt-2 h-3 w-1/2 rounded bg-neutral-100" />
          </div>
        ))}
      </div>
    </div>
  )
}
