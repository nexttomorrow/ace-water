import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { adminDeletePost } from '../actions'

export const revalidate = 0

export default async function AdminBoardPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('posts')
    .select('id, title, created_at, author_id, profiles:author_id ( nickname )')
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-12">
      <h1 className="mb-5 text-2xl font-bold">게시판 관리</h1>

      {!data || data.length === 0 ? (
        <p className="rounded border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          게시글이 없어요.
        </p>
      ) : (
        <table className="w-full overflow-hidden rounded border border-neutral-200 bg-white text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-2">제목</th>
              <th className="px-4 py-2">작성자</th>
              <th className="px-4 py-2">작성일</th>
              <th className="px-4 py-2 w-32">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {data.map((p) => {
              const author = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles
              const handleDelete = adminDeletePost.bind(null, p.id)
              return (
                <tr key={p.id}>
                  <td className="px-4 py-2">
                    <Link href={`/board/${p.id}`} className="text-blue-600 hover:underline">
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-neutral-600">{author?.nickname ?? '-'}</td>
                  <td className="px-4 py-2 text-neutral-600">
                    {new Date(p.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-1">
                      <Link
                        href={`/board/${p.id}/edit`}
                        className="rounded border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100"
                      >
                        수정
                      </Link>
                      <form action={handleDelete}>
                        <button
                          type="submit"
                          className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                        >
                          삭제
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
