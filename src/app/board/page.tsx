import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 0

export default async function BoardListPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('posts')
    .select('id, title, created_at, author_id, profiles:author_id ( nickname )')
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-12">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold">게시판</h1>
        {user ? (
          <Link
            href="/board/new"
            className="rounded bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            글쓰기
          </Link>
        ) : (
          <Link href="/login?redirect=/board/new" className="text-sm text-blue-600 hover:underline">
            로그인 후 글쓰기
          </Link>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error.message}</p>
      )}

      {!data || data.length === 0 ? (
        <p className="rounded border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          첫 게시글을 작성해보세요.
        </p>
      ) : (
        <ul className="divide-y divide-neutral-200 rounded border border-neutral-200 bg-white">
          {data.map((p) => {
            const author = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles
            return (
              <li key={p.id}>
                <Link
                  href={`/board/${p.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50"
                >
                  <span className="truncate">{p.title}</span>
                  <span className="ml-3 shrink-0 text-xs text-neutral-500">
                    {author?.nickname ?? '익명'} ·{' '}
                    {new Date(p.created_at).toLocaleDateString('ko-KR')}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
