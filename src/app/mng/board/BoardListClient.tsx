'use client'

import Link from 'next/link'
import SelectableTable from '@/components/mng/SelectableTable'
import { adminBulkDeletePosts, adminDeletePost } from '../actions'

export type BoardListRow = {
  id: number
  title: string
  created_at: string
  authorNickname: string | null
}

export default function BoardListClient({ posts }: { posts: BoardListRow[] }) {
  const ids = posts.map((p) => p.id)

  return (
    <SelectableTable
      ids={ids}
      onBulkDelete={async (ids) => {
        await adminBulkDeletePosts(ids)
      }}
      deleteConfirm="선택한 게시글을 삭제하시겠습니까?"
    >
      {({ checkboxFor, headerCheckbox }) => (
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-sm">
              <colgroup>
                <col className="w-12" />
                <col />
                <col className="w-40" />
                <col className="w-32" />
                <col className="w-40" />
              </colgroup>
              <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-4 py-3">{headerCheckbox}</th>
                  <th className="px-4 py-3 font-medium">제목</th>
                  <th className="px-4 py-3 font-medium">작성자</th>
                  <th className="px-4 py-3 font-medium">작성일</th>
                  <th className="px-4 py-3 text-right font-medium">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {posts.map((p) => {
                  const handleDelete = adminDeletePost.bind(null, p.id)
                  return (
                    <tr key={p.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3">{checkboxFor(p.id)}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/board/${p.id}`}
                          className="block truncate font-medium text-neutral-900 hover:text-blue-600 hover:underline"
                        >
                          {p.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 truncate text-neutral-600">
                        {p.authorNickname ?? '-'}
                      </td>
                      <td className="px-4 py-3 text-neutral-600">
                        {new Date(p.created_at).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
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
          </div>
        </div>
      )}
    </SelectableTable>
  )
}
