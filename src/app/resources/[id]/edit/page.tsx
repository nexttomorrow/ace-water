import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateResource } from '../../actions'
import { formatBytes, getFileColor } from '@/lib/files'

export default async function EditResourcePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const rid = Number(id)
  if (!Number.isFinite(rid)) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/login?redirect=/resources/${rid}/edit`)

  const { data: resource } = await supabase.from('resources').select('*').eq('id', rid).single()
  if (!resource) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect(`/resources/${rid}`)
  }

  const action = updateResource.bind(null, rid)
  const color = getFileColor(resource.file_name)

  return (
    <div className="mx-auto max-w-[960px] px-6 py-12">
      <h1 className="mb-6 text-2xl font-bold">자료 수정</h1>

      {sp.error && (
        <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</p>
      )}

      <form action={action} className="flex flex-col gap-5">
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-neutral-800">
            제목 <span className="text-rose-500">*</span>
          </label>
          <input
            name="title"
            required
            defaultValue={resource.title}
            className="w-full rounded border border-neutral-300 bg-white px-3 py-2.5 text-[15px] outline-none transition focus:border-neutral-900"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-neutral-800">
            설명 <span className="text-neutral-400">(선택)</span>
          </label>
          <textarea
            name="content"
            rows={5}
            defaultValue={resource.content}
            className="w-full resize-y rounded border border-neutral-300 bg-white px-3 py-2.5 text-[14px] leading-6 outline-none transition focus:border-neutral-900"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-neutral-800">
            현재 첨부파일
          </label>
          <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${color.bg} ${color.text} text-[10px] font-bold`}>
              {color.label}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-neutral-900">{resource.file_name}</p>
              <p className="text-[11px] text-neutral-500">{formatBytes(resource.file_size)}</p>
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-neutral-800">
            파일 교체 <span className="text-neutral-400">(선택)</span>
          </label>
          <input
            type="file"
            name="file"
            className="block w-full cursor-pointer rounded border border-neutral-300 bg-white text-[14px] file:mr-4 file:cursor-pointer file:border-0 file:border-r file:border-neutral-300 file:bg-neutral-50 file:px-4 file:py-2.5 file:text-[13px] file:font-semibold file:text-neutral-700 hover:file:bg-neutral-100"
          />
          <p className="mt-1.5 text-[12px] text-neutral-500">
            새 파일을 선택하면 기존 파일은 삭제되고 교체됩니다. 비워두면 그대로 유지됩니다.
          </p>
        </div>

        <div className="mt-2 flex gap-2">
          <button
            type="submit"
            className="rounded bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-700"
          >
            저장
          </button>
          <Link
            href={`/resources/${rid}`}
            className="rounded border border-neutral-300 bg-white px-5 py-2.5 text-sm hover:bg-neutral-100"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  )
}
