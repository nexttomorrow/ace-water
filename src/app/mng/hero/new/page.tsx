import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createHeroSlide } from '../../actions'
import OptimizedImageInput from '@/components/OptimizedImageInput'
import { HERO_SLIDES_MAX } from '@/lib/types'

export default async function NewHeroSlidePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const sp = await searchParams

  const supabase = await createClient()
  const { count } = await supabase
    .from('hero_slides')
    .select('*', { count: 'exact', head: true })

  if ((count ?? 0) >= HERO_SLIDES_MAX) {
    redirect(
      '/mng/hero?error=' +
        encodeURIComponent(`슬라이드는 최대 ${HERO_SLIDES_MAX}개까지 등록할 수 있어요`)
    )
  }

  const nextOrder = (count ?? 0) + 1

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <h1 className="mb-5 text-2xl font-bold">슬라이드 추가</h1>

      {sp.error && (
        <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</p>
      )}

      <form action={createHeroSlide} className="flex flex-col gap-3">
        <label className="flex flex-col text-sm">
          상단 라벨 (선택)
          <input
            name="eyebrow"
            placeholder="예: ACE WATER"
            className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
          />
          <span className="mt-1 text-[0.75rem] text-neutral-500">
            영문 작은 글씨로 타이틀 위에 표시돼요
          </span>
        </label>
        <label className="flex flex-col text-sm">
          타이틀
          <input
            name="title"
            required
            placeholder="예: 깨끗한 물, 더 나은 일상"
            className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
          />
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
            maxWidth={2400}
            maxHeight={1400}
            quality={85}
            className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
          />
          <span className="mt-1 text-[0.75rem] text-neutral-500">
            가로형 이미지 권장 (1920×1080 이상). 업로드 시 자동으로 최적화됩니다.
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
            href="/mng/hero"
            className="rounded border border-neutral-300 bg-white px-4 py-2 text-sm hover:bg-neutral-100"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  )
}
