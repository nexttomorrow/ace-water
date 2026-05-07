import Link from 'next/link'
import { createGalleryItem } from '../../actions'

export default async function NewGalleryItemPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const sp = await searchParams

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <h1 className="mb-5 text-2xl font-bold">시공사례 추가</h1>

      {sp.error && (
        <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</p>
      )}

      <form action={createGalleryItem} className="flex flex-col gap-3">
        <label className="flex flex-col text-sm">
          제목
          <input
            name="title"
            required
            className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
          />
        </label>
        <label className="flex flex-col text-sm">
          설명 (선택)
          <textarea
            name="description"
            rows={3}
            className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
          />
        </label>
        <label className="flex flex-col text-sm">
          이미지
          <input
            name="image"
            type="file"
            accept="image/*"
            required
            className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
          />
        </label>

        <div className="mt-2 flex gap-2">
          <button
            type="submit"
            className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            등록
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
