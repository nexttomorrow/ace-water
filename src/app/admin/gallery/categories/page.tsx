import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { deleteCaseCategory } from '../../actions'
import type { ConstructionCaseCategory } from '@/lib/types'

export const revalidate = 0

export default async function CaseCategoriesAdminPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('construction_case_categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true })

  const items = (data ?? []) as ConstructionCaseCategory[]

  return (
    <div className="mx-auto max-w-[960px] px-6 py-12">
      <div className="mb-1 text-[12px] text-neutral-500">
        <Link href="/admin/gallery" className="hover:underline">
          시공사례 관리
        </Link>{' '}
        ›
      </div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">시공사례 카테고리</h1>
          <p className="mt-1 text-[13px] text-neutral-500">
            시공사례 페이지 상단의 제품별 분류 탭을 관리합니다.
          </p>
        </div>
        <Link
          href="/admin/gallery/categories/new"
          className="rounded bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          + 카테고리 추가
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="rounded border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          아직 카테고리가 없습니다.
        </p>
      ) : (
        <ul className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {items.map((c) => {
            const handleDelete = deleteCaseCategory.bind(null, c.id)
            return (
              <li key={c.id} className="flex items-center gap-4 px-5 py-4">
                <span
                  className={`block h-1.5 w-1.5 rounded-full ${
                    c.is_active ? 'bg-green-500' : 'bg-neutral-300'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-[14px] font-semibold">{c.name}</p>
                  <p className="mt-0.5 truncate text-[12px] text-neutral-500">
                    sort {c.sort_order}
                    {c.slug ? ` · slug: ${c.slug}` : ''}
                    {!c.is_active ? ' · 비활성' : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Link
                    href={`/admin/gallery/categories/${c.id}/edit`}
                    className="rounded border border-neutral-300 px-2 py-1 text-[11px] hover:bg-neutral-100"
                  >
                    수정
                  </Link>
                  <form action={handleDelete}>
                    <button
                      type="submit"
                      className="rounded border border-red-300 px-2 py-1 text-[11px] text-red-700 hover:bg-red-50"
                    >
                      삭제
                    </button>
                  </form>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
