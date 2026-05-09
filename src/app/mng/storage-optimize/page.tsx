import StorageOptimizer from './StorageOptimizer'

export const metadata = {
  title: '이미지 최적화 | ACEWATER 관리',
}

export default function StorageOptimizePage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">기존 이미지 일괄 최적화</h1>
        <p className="mt-1 text-[0.875rem] leading-relaxed text-neutral-500">
          이미 등록된 모든 스토리지 이미지를 한 번에 리사이즈 + WEBP 재인코딩 합니다. 같은
          path 에 덮어쓰기 때문에 기존 페이지 URL 은 그대로 유지돼요. 처리 결과가 원본보다
          크면 자동으로 건너뜁니다(원본 보존).
        </p>
        <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-[0.75rem] leading-[1.6] text-amber-800 ring-1 ring-amber-100">
          ⚠ 처리는 브라우저에서 한 장씩 진행됩니다. 탭을 닫지 말고 끝날 때까지 기다려주세요. (보통
          1장당 0.5~2초)
        </p>
      </div>

      <StorageOptimizer />
    </div>
  )
}
