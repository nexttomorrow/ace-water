/**
 * 어드민 로딩 스켈레톤.
 *
 * 이게 없으면 Next 는 서버 렌더가 끝날 때까지 화면을 바꾸지 않는다.
 * 링크를 눌러도 아무 반응이 없어 "안 눌렸나?" 하고 다시 누르게 되는 원인.
 * loading.tsx 가 있으면 클릭 즉시 이 화면으로 전환된다.
 */
export default function Loading() {
  return (
    <div className="mx-auto max-w-[1440px] animate-pulse px-6 py-12">
      <div className="mb-8">
        <div className="h-3 w-20 rounded bg-neutral-200" />
        <div className="mt-3 h-7 w-48 rounded bg-neutral-200" />
        <div className="mt-2 h-4 w-80 rounded bg-neutral-100" />
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl border border-neutral-200 bg-white" />
        ))}
      </div>
      <div className="space-y-2 rounded-xl border border-neutral-200 bg-white p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 rounded bg-neutral-100" />
        ))}
      </div>
    </div>
  )
}
