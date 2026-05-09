import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateHeroSlide } from '../../../actions'
import OptimizedImageInput from '@/components/OptimizedImageInput'
import type { HeroSlide } from '@/lib/types'

export default async function EditHeroSlidePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const slideId = Number(id)
  if (!Number.isFinite(slideId)) notFound()

  const supabase = await createClient()
  const { data } = await supabase
    .from('hero_slides')
    .select('*')
    .eq('id', slideId)
    .single()
  if (!data) notFound()
  const slide = data as HeroSlide

  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/hero/${slide.image_path}`
  const action = updateHeroSlide.bind(null, slideId)

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <h1 className="mb-5 text-2xl font-bold">슬라이드 수정</h1>

      {sp.error && (
        <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</p>
      )}

      <div className="mb-4 overflow-hidden rounded border border-neutral-200">
        <Image
          src={publicUrl}
          alt={slide.title}
          width={800}
          height={450}
          className="h-auto w-full"
          unoptimized
        />
      </div>

      <form action={action} className="flex flex-col gap-3">
        <label className="flex flex-col text-sm">
          상단 라벨 (선택)
          <input
            name="eyebrow"
            defaultValue={slide.eyebrow}
            className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
          />
        </label>
        <label className="flex flex-col text-sm">
          타이틀
          <input
            name="title"
            required
            defaultValue={slide.title}
            className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
          />
        </label>
        <label className="flex flex-col text-sm">
          정렬 순서
          <input
            name="sort_order"
            type="number"
            defaultValue={slide.sort_order}
            className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
          />
        </label>
        <label className="flex flex-col text-sm">
          이미지 교체 (선택)
          <OptimizedImageInput
            name="image"
            maxWidth={2400}
            maxHeight={1400}
            quality={85}
            className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
          />
        </label>

        <div className="mt-2 flex gap-2">
          <button
            type="submit"
            className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            저장
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
