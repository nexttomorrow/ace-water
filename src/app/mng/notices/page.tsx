import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import NoticeListClient from './NoticeListClient'

export const revalidate = 0

export default async function AdminNoticesPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('notices')
    .select('id, title, created_at, author_id, profiles:author_id ( nickname )')
    .order('created_at', { ascending: false })

  type Row = {
    id: number
    title: string
    created_at: string
    author_id: string
    profiles?: { nickname: string | null } | { nickname: string | null }[] | null
  }

  const notices = ((data ?? []) as Row[]).map((p) => {
    const author = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles
    return {
      id: p.id,
      title: p.title,
      created_at: p.created_at,
      authorNickname: author?.nickname ?? null,
    }
  })

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-12">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">공지사항 관리</h1>
          <p className="mt-1 text-[0.875rem] text-neutral-500">
            공개 페이지:{' '}
            <Link href="/notices" target="_blank" className="hover:underline">
              /notices
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500">총 {notices.length}건</span>
          <Link
            href="/notices/new"
            className="rounded bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            + 공지 등록
          </Link>
        </div>
      </div>

      {notices.length === 0 ? (
        <p className="rounded border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          등록된 공지사항이 없어요.
        </p>
      ) : (
        <NoticeListClient notices={notices} />
      )}
    </div>
  )
}
