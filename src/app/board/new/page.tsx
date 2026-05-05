import Link from 'next/link'
import { createPost } from '../actions'

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const sp = await searchParams

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-5 text-2xl font-bold">새 글 작성</h1>

      {sp.error && (
        <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</p>
      )}

      <form action={createPost} className="flex flex-col gap-3">
        <input
          name="title"
          required
          placeholder="제목"
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
        <textarea
          name="content"
          required
          rows={12}
          placeholder="내용"
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            등록
          </button>
          <Link
            href="/board"
            className="rounded border border-neutral-300 bg-white px-4 py-2 text-sm hover:bg-neutral-100"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  )
}
