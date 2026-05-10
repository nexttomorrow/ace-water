import { createClient } from '@/lib/supabase/server'
import BoardListClient from './BoardListClient'

export const revalidate = 0

export default async function AdminBoardPage() {
  const supabase = await createClient()
  // prod DB FK 추론 회피 — 분리 쿼리
  const { data } = await supabase
    .from('posts')
    .select('id, title, created_at, author_id')
    .order('created_at', { ascending: false })

  type Row = {
    id: number
    title: string
    created_at: string
    author_id: string | null
  }
  const rows = (data ?? []) as Row[]

  const authorIds = Array.from(
    new Set(rows.map((r) => r.author_id).filter((v): v is string => !!v))
  )
  const nicknameById = new Map<string, string>()
  if (authorIds.length > 0) {
    const { data: profs } = await supabase
      .from('profiles')
      .select('id, nickname')
      .in('id', authorIds)
    for (const p of (profs ?? []) as Array<{ id: string; nickname: string | null }>) {
      if (p.nickname) nicknameById.set(p.id, p.nickname)
    }
  }

  const posts = rows.map((p) => ({
    id: p.id,
    title: p.title,
    created_at: p.created_at,
    authorNickname: p.author_id ? nicknameById.get(p.author_id) ?? null : null,
  }))

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-12">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold">게시판 관리</h1>
        <span className="text-sm text-neutral-500">총 {posts.length}건</span>
      </div>

      {posts.length === 0 ? (
        <p className="rounded border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          게시글이 없어요.
        </p>
      ) : (
        <BoardListClient posts={posts} />
      )}
    </div>
  )
}
