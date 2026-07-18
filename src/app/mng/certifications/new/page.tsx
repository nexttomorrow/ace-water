import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createCertification } from '../../actions'
import OptimizedImageInput from '@/components/OptimizedImageInput'

export default async function NewCertificationPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const sp = await searchParams

  const supabase = await createClient()
  const { count } = await supabase
    .from('certifications')
    .select('*', { count: 'exact', head: true })

  const nextOrder = (count ?? 0) + 1

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <h1 className="mb-5 text-2xl font-bold">인증서 추가</h1>

      {sp.error && (
        <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</p>
      )}

      <form action={createCertification} className="flex flex-col gap-3">
        <label className="flex flex-col text-sm">
          타이틀
          <input
            name="title"
            required
            placeholder="예: ISO 9001"
            className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
          />
        </label>
        <label className="flex flex-col text-sm">
          서브타이틀 (선택)
          <input
            name="subtitle"
            placeholder="예: 품질경영시스템 인증"
            className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
          />
          <span className="mt-1 text-[0.75rem] text-neutral-500">
            타이틀 아래 작은 글씨로 표시돼요
          </span>
        </label>
        <label className="flex flex-col text-sm">
          정렬 순서
          <input
            name="sort_order"
            type="number"
            defaultValue={nextOrder}
            className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
          />
          <span className="mt-1 text-[0.75rem] text-neutral-500">
            작은 숫자가 먼저 표시돼요
          </span>
        </label>
        <label className="flex flex-col text-sm">
          이미지
          <OptimizedImageInput
            name="image"
            required
            maxWidth={1600}
            maxHeight={2200}
            quality={88}
            className="mt-1"
          />
          <span className="mt-1 text-[0.75rem] text-neutral-500">
            세로형(3:4) 인증서 스캔본 권장. 클릭 시 확대되므로 너무 작지 않은 이미지를
            올려주세요. 업로드 시 자동으로 최적화됩니다.
          </span>
        </label>

        <div className="mt-2 flex gap-2">
          <button
            type="submit"
            className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            등록
          </button>
          <Link
            href="/mng/certifications"
            className="rounded border border-neutral-300 bg-white px-4 py-2 text-sm hover:bg-neutral-100"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  )
}
