import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updatePost } from '../../actions'

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const postId = Number(id)
  if (!Number.isFinite(postId)) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/login?redirect=/board/${postId}/edit`)

  const { data: post } = await supabase.from('posts').select('*').eq('id', postId).single()
  if (!post) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (post.author_id !== user.id && profile?.role !== 'admin') {
    redirect(`/board/${postId}`)
  }

  const action = updatePost.bind(null, postId)

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-5 text-2xl font-bold">글 수정</h1>

      {sp.error && (
        <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</p>
      )}

      <form action={action} className="flex flex-col gap-3">
        <input
          name="title"
          required
          defaultValue={post.title}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
        <textarea
          name="content"
          required
          rows={12}
          defaultValue={post.content}
          className="rounded border border-neutral-300 bg-white px-3 py-2"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            저장
          </button>
          <Link
            href={`/board/${postId}`}
            className="rounded border border-neutral-300 bg-white px-4 py-2 text-sm hover:bg-neutral-100"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  )
}
