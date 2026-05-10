import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createResource } from '../actions'
import FileInput from '@/components/ui/FileInput'

export default async function NewResourcePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const sp = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/resources/new')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') redirect('/resources')

  return (
    <div className="mx-auto max-w-[960px] px-6 py-12">
      <h1 className="mb-1 text-2xl font-bold">자료 등록</h1>
      <p className="mb-6 text-[0.875rem] text-neutral-500">최대 50MB까지 업로드 가능합니다</p>

      {sp.error && (
        <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</p>
      )}

      <form action={createResource} className="flex flex-col gap-5">
        <div>
          <label className="mb-1.5 block text-[0.875rem] font-semibold text-neutral-800">
            제목 <span className="text-rose-500">*</span>
          </label>
          <input
            name="title"
            required
            placeholder="자료 제목을 입력하세요"
            className="w-full rounded border border-neutral-300 bg-white px-3 py-2.5 text-[1rem] outline-none transition focus:border-neutral-900"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[0.875rem] font-semibold text-neutral-800">
            설명 <span className="text-neutral-400">(선택)</span>
          </label>
          <textarea
            name="content"
            rows={5}
            placeholder="자료에 대한 간단한 설명을 입력하세요"
            className="w-full resize-y rounded border border-neutral-300 bg-white px-3 py-2.5 text-[0.875rem] leading-6 outline-none transition focus:border-neutral-900"
          />
        </div>

        <FileInput
          label="첨부파일"
          required
          name="file"
          hint="PDF, DOC, XLS, PPT, HWP, ZIP, 이미지 등 자유롭게 첨부 가능"
        />

        <div className="mt-2 flex gap-2">
          <button
            type="submit"
            className="rounded bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-700"
          >
            등록
          </button>
          <Link
            href="/resources"
            className="rounded border border-neutral-300 bg-white px-5 py-2.5 text-sm hover:bg-neutral-100"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  )
}
