import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { deleteQna, updateQna } from '../../actions'
import RichTextEditor from '@/components/RichTextEditor'

export default async function EditQnaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const qid = Number(id)
  if (!Number.isFinite(qid)) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/login?redirect=/qna/${qid}/edit`)

  const { data: qna } = await supabase.from('qna').select('*').eq('id', qid).single()
  if (!qna) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/qna')
  }

  const updateAction = updateQna.bind(null, qid)
  const deleteAction = deleteQna.bind(null, qid)

  return (
    <div className="mx-auto max-w-[960px] px-6 py-12">
      <h1 className="mb-6 text-2xl font-bold">Q&amp;A 수정</h1>

      {sp.error && (
        <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</p>
      )}

      <form action={updateAction} className="flex flex-col gap-5">
        <div>
          <label className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-neutral-800">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-extrabold text-white">
              Q
            </span>
            질문
          </label>
          <input
            name="question"
            required
            defaultValue={qna.question}
            className="w-full rounded border border-neutral-300 bg-white px-3 py-2.5 text-[15px] outline-none transition focus:border-neutral-900"
          />
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-neutral-800">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-extrabold text-white">
              A
            </span>
            답변
          </label>
          <RichTextEditor name="answer" defaultValue={qna.answer} />
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-700"
            >
              저장
            </button>
            <Link
              href="/qna"
              className="rounded border border-neutral-300 bg-white px-5 py-2.5 text-sm hover:bg-neutral-100"
            >
              취소
            </Link>
          </div>
        </div>
      </form>

      <form action={deleteAction} className="mt-6 border-t border-neutral-200 pt-6">
        <button
          type="submit"
          className="rounded border border-red-300 bg-white px-4 py-2 text-sm text-red-700 hover:bg-red-50"
        >
          삭제
        </button>
      </form>
    </div>
  )
}
