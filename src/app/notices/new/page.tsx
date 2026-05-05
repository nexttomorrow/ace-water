import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createNotice } from '../actions'
import RichTextEditor from '@/components/RichTextEditor'

export default async function NewNoticePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const sp = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/notices/new')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') redirect('/notices')

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-12">
      <h1 className="mb-5 text-2xl font-bold">공지 등록</h1>

      {sp.error && (
        <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</p>
      )}

      <form action={createNotice} className="flex flex-col gap-3">
        <input
          name="title"
          required
          placeholder="제목"
          className="rounded border border-neutral-300 bg-white px-3 py-2 text-lg"
        />
        <RichTextEditor name="content" placeholder="공지 내용을 입력하세요" />
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            등록
          </button>
          <Link
            href="/notices"
            className="rounded border border-neutral-300 bg-white px-4 py-2 text-sm hover:bg-neutral-100"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  )
}
