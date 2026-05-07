import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateGalleryItem } from '../../../actions'

export default async function EditGalleryItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const itemId = Number(id)
  if (!Number.isFinite(itemId)) notFound()

  const supabase = await createClient()
  const { data: item } = await supabase.from('gallery_items').select('*').eq('id', itemId).single()
  if (!item) notFound()

  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gallery/${item.image_path}`
  const action = updateGalleryItem.bind(null, itemId)

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <h1 className="mb-5 text-2xl font-bold">시공사례 수정</h1>

      {sp.error && (
        <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</p>
      )}

      <div className="mb-4 overflow-hidden rounded border border-neutral-200">
        <Image
          src={publicUrl}
          alt={item.title}
          width={500}
          height={500}
          className="h-auto w-full"
          unoptimized
        />
      </div>

      <form action={action} className="flex flex-col gap-3">
        <label className="flex flex-col text-sm">
          제목
          <input
            name="title"
            required
            defaultValue={item.title}
            className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
          />
        </label>
        <label className="flex flex-col text-sm">
          설명
          <textarea
            name="description"
            rows={3}
            defaultValue={item.description ?? ''}
            className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
          />
        </label>
        <label className="flex flex-col text-sm">
          이미지 교체 (선택)
          <input
            name="image"
            type="file"
            accept="image/*"
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
            href="/admin/gallery"
            className="rounded border border-neutral-300 bg-white px-4 py-2 text-sm hover:bg-neutral-100"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  )
}
