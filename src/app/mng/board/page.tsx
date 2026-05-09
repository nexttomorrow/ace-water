import { createClient } from '@/lib/supabase/server'
import BoardListClient from './BoardListClient'

export const revalidate = 0

export default async function AdminBoardPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('posts')
    .select('id, title, created_at, author_id, profiles:author_id ( nickname )')
    .order('created_at', { ascending: false })

  type Row = {
    id: number
    title: string
    created_at: string
    author_id: string
    profiles?: { nickname: string | null } | { nickname: string | null }[] | null
  }

  const posts = ((data ?? []) as Row[]).map((p) => {
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
