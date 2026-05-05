import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { deleteHeroSlide } from '../actions'
import { HERO_SLIDES_MAX, type HeroSlide } from '@/lib/types'

export const revalidate = 0

export default async function AdminHeroPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('hero_slides')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true })

  const slides = (data ?? []) as HeroSlide[]
  const reachedMax = slides.length >= HERO_SLIDES_MAX
  const publicUrl = (path: string) =>
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/hero/${path}`

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-12">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">메인 슬라이드 관리</h1>
        {reachedMax ? (
          <span className="rounded bg-neutral-200 px-3 py-2 text-sm text-neutral-500">
            최대 {HERO_SLIDES_MAX}개 등록됨
          </span>
        ) : (
          <Link
            href="/admin/hero/new"
            className="rounded bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            + 슬라이드 추가
          </Link>
        )}
      </div>
      <p className="mb-6 text-[13px] text-neutral-500">
        메인 페이지 상단 배너 슬라이드를 관리해요. 최대 {HERO_SLIDES_MAX}개까지 등록할 수 있고,
        정렬값(작은 숫자가 먼저)으로 노출 순서를 정할 수 있어요.
      </p>

      {slides.length === 0 ? (
        <p className="rounded border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          등록된 슬라이드가 없어요. 첫 슬라이드를 추가해보세요.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {slides.map((slide) => {
            const handleDelete = deleteHeroSlide.bind(null, slide.id)
            return (
              <div
                key={slide.id}
                className="overflow-hidden rounded-lg border border-neutral-200 bg-white"
              >
                <div className="relative aspect-[16/9] bg-neutral-100">
                  <Image
                    src={publicUrl(slide.image_path)}
                    alt={slide.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-[11px] font-semibold text-white">
                    #{slide.sort_order}
                  </span>
                </div>
                <div className="px-4 py-3">
                  {slide.eyebrow && (
                    <p className="text-[11px] font-semibold tracking-widest text-neutral-500">
                      {slide.eyebrow}
                    </p>
                  )}
                  <p className="mt-1 line-clamp-2 text-[15px] font-bold leading-snug">
                    {slide.title}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Link
                      href={`/admin/hero/${slide.id}/edit`}
                      className="flex-1 rounded border border-neutral-300 px-2 py-1.5 text-center text-xs hover:bg-neutral-100"
                    >
                      수정
                    </Link>
                    <form action={handleDelete} className="flex-1">
                      <button
                        type="submit"
                        className="w-full rounded border border-red-300 px-2 py-1.5 text-xs text-red-700 hover:bg-red-50"
                      >
                        삭제
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
