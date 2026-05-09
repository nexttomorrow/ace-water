import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createQna } from '../actions'
import RichTextEditor from '@/components/RichTextEditor'
import TagPicker from '@/components/TagPicker'
import { fetchTags } from '@/lib/tags'

export default async function NewQnaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const sp = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/qna/new')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') redirect('/qna')

  const tagOptions = await fetchTags('qna')

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-12">
      <h1 className="mb-6 text-2xl font-bold">Q&amp;A 등록</h1>

      {sp.error && (
        <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</p>
      )}

      <form action={createQna} className="flex flex-col gap-5">
        <div>
          <label className="mb-1.5 flex items-center gap-2 text-[0.875rem] font-semibold text-neutral-800">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-[0.75rem] font-extrabold text-white">
              Q
            </span>
            질문
          </label>
          <input
            name="question"
            required
            placeholder="자주 묻는 질문을 입력하세요"
            className="w-full rounded border border-neutral-300 bg-white px-3 py-2.5 text-[1rem] outline-none transition focus:border-neutral-900"
          />
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-2 text-[0.875rem] font-semibold text-neutral-800">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[0.75rem] font-extrabold text-white">
              A
            </span>
            답변
          </label>
          <RichTextEditor name="answer" placeholder="답변을 입력하세요" />
        </div>

        <div>
          <label className="mb-1.5 block text-[0.875rem] font-semibold text-neutral-800">
            태그 (선택)
          </label>
          <TagPicker
            options={tagOptions}
            name="tags"
            hint="질문 분류를 위한 태그를 선택하세요. /mng/tags 에서 추가/수정 가능."
          />
        </div>

        <div className="mt-2 flex gap-2">
          <button
            type="submit"
            className="rounded bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-700"
          >
            등록
          </button>
          <Link
            href="/qna"
            className="rounded border border-neutral-300 bg-white px-5 py-2.5 text-sm hover:bg-neutral-100"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  )
}
