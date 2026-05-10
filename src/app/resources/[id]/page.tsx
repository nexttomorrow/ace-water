import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { deleteResource } from '../actions'
import { formatBytes, getFileColor } from '@/lib/files'

export const revalidate = 0

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const rid = Number(id)
  if (!Number.isFinite(rid)) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 조인은 prod DB FK 추론에 의존해 실패 케이스가 있어 분리 쿼리
  const { data: resource, error: resourceErr } = await supabase
    .from('resources')
    .select('*')
    .eq('id', rid)
    .maybeSingle()

  if (resourceErr) console.error('[resource detail] fetch failed', resourceErr)
  if (!resource) notFound()

  let authorNickname: string | null = null
  if (resource.author_id) {
    const { data: authorRow } = await supabase
      .from('profiles')
      .select('nickname')
      .eq('id', resource.author_id)
      .maybeSingle()
    authorNickname = authorRow?.nickname ?? null
  }

  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    isAdmin = profile?.role === 'admin'
  }
  const handleDelete = deleteResource.bind(null, rid)
  const color = getFileColor(resource.file_name)

  return (
    <article className="mx-auto max-w-[960px] px-6 py-12">
      <div className="mb-3">
        <Link
          href="/resources"
          className="inline-flex items-center gap-1 text-[0.75rem] text-neutral-500 hover:text-black"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          자료실 목록
        </Link>
      </div>

      <header className="mb-6 border-b border-neutral-200 pb-5">
        <h1 className="text-[1.5rem] font-bold leading-tight md:text-[1.75rem]">{resource.title}</h1>
        <p className="mt-2 text-[0.75rem] text-neutral-500">
          {authorNickname ?? '관리자'} · {new Date(resource.created_at).toLocaleString('ko-KR')}
          {resource.updated_at !== resource.created_at && (
            <> · 수정됨 {new Date(resource.updated_at).toLocaleString('ko-KR')}</>
          )}
          <span className="mx-2 text-neutral-300">|</span>
          다운로드 <span className="font-semibold text-neutral-700">{resource.download_count}</span>회
        </p>
      </header>

      {/* 파일 카드 */}
      <div className="mb-6 flex items-center gap-4 rounded-lg border border-neutral-200 bg-neutral-50 p-5">
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-md ${color.bg} ${color.text} text-[0.75rem] font-bold`}>
          {color.label}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.875rem] font-semibold text-neutral-900">
            {resource.file_name}
          </p>
          <p className="mt-0.5 text-[0.75rem] text-neutral-500">
            {formatBytes(resource.file_size)}
            {resource.file_type && <> · {resource.file_type}</>}
          </p>
        </div>
        <a
          href={`/resources/${resource.id}/download`}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-neutral-900 px-4 py-2 text-[0.875rem] font-semibold text-white transition hover:bg-neutral-700"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          다운로드
        </a>
      </div>

      {/* 설명 */}
      {resource.content && resource.content.trim() !== '' && (
        <div className="whitespace-pre-wrap text-[0.875rem] leading-7 text-neutral-700">
          {resource.content}
        </div>
      )}

      <div className="mt-10 flex gap-2 border-t border-neutral-200 pt-6">
        <Link
          href="/resources"
          className="rounded border border-neutral-300 bg-white px-3 py-2 text-sm hover:bg-neutral-100"
        >
          목록
        </Link>
        {isAdmin && (
          <>
            <Link
              href={`/resources/${resource.id}/edit`}
              className="rounded border border-neutral-300 bg-white px-3 py-2 text-sm hover:bg-neutral-100"
            >
              수정
            </Link>
            <form action={handleDelete}>
              <button
                type="submit"
                className="rounded border border-red-300 bg-white px-3 py-2 text-sm text-red-700 hover:bg-red-50"
              >
                삭제
              </button>
            </form>
          </>
        )}
      </div>
    </article>
  )
}
