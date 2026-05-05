import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateNotice } from '../../actions'
import RichTextEditor from '@/components/RichTextEditor'

export default async function EditNoticePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const noticeId = Number(id)
  if (!Number.isFinite(noticeId)) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/login?redirect=/notices/${noticeId}/edit`)

  const { data: notice } = await supabase.from('notices').select('*').eq('id', noticeId).single()
  if (!notice) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect(`/notices/${noticeId}`)
  }

  const action = updateNotice.bind(null, noticeId)

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-12">
      <h1 className="mb-5 text-2xl font-bold">공지 수정</h1>

      {sp.error && (
        <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</p>
      )}

      <form action={action} className="flex flex-col gap-3">
        <input
          name="title"
          required
          defaultValue={notice.title}
          className="rounded border border-neutral-300 bg-white px-3 py-2 text-lg"
        />
        <RichTextEditor name="content" defaultValue={notice.content} />
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            저장
          </button>
          <Link
            href={`/notices/${noticeId}`}
            className="rounded border border-neutral-300 bg-white px-4 py-2 text-sm hover:bg-neutral-100"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  )
}
