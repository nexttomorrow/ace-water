import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { deleteCategory, toggleCategoryActive } from '../actions'
import type { Category } from '@/lib/types'

export const revalidate = 0

export default async function AdminCategoriesPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('parent_id', { ascending: true, nullsFirst: true })
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true })

  const all = (data ?? []) as Category[]
  const tops = all.filter((c) => c.parent_id === null)
  const childrenOf = (parentId: number) => all.filter((c) => c.parent_id === parentId)
  const orphans = all.filter((c) => c.parent_id !== null && !tops.some((t) => t.id === c.parent_id))

  const publicUrl = (path: string) =>
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/categories/${path}`

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">카테고리 관리</h1>
          <p className="mt-1 text-[13px] text-neutral-500">
            메인 헤더 GNB 의 메가메뉴를 구성합니다. 상위 카테고리는 메뉴 아이템으로,
            하위 카테고리는 메가메뉴 안의 타일/링크로 노출됩니다.
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="rounded-full bg-black px-4 py-2 text-[13px] font-medium text-white hover:bg-neutral-800"
        >
          + 카테고리 추가
        </Link>
      </div>

      {tops.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-[14px] text-neutral-500">
          아직 카테고리가 없어요.{' '}
          <Link href="/admin/categories/new" className="text-blue-600 hover:underline">
            첫 카테고리를 만들어보세요
          </Link>
          .
        </p>
      ) : (
        <div className="space-y-6">
          {tops.map((top) => {
            const kids = childrenOf(top.id)
            return (
              <section
                key={top.id}
                className="overflow-hidden rounded-xl border border-neutral-200 bg-white"
              >
                {/* parent header */}
                <div className="flex items-center justify-between gap-3 border-b border-neutral-200 bg-neutral-50 px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${
                        top.is_active ? 'bg-green-500' : 'bg-neutral-300'
                      }`}
                    />
                    <h2 className="text-[16px] font-bold">{top.name}</h2>
                    <span className="text-[12px] text-neutral-500">
                      sort {top.sort_order} · {kids.length}개 하위
                    </span>
                  </div>
                  <CategoryRowActions category={top} />
                </div>

                {/* children */}
                {kids.length === 0 ? (
                  <p className="px-5 py-6 text-center text-[13px] text-neutral-400">
                    하위 카테고리 없음
                  </p>
                ) : (
                  <ul className="divide-y divide-neutral-100">
                    {kids.map((c) => (
                      <li
                        key={c.id}
                        className="flex items-center gap-4 px-5 py-3 hover:bg-neutral-50"
                      >
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-neutral-100">
                          {c.image_path ? (
                            <Image
                              src={publicUrl(c.image_path)}
                              alt={c.name}
                              width={48}
                              height={48}
                              className="h-full w-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-400">
                              {c.display_type}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-block h-1.5 w-1.5 rounded-full ${
                                c.is_active ? 'bg-green-500' : 'bg-neutral-300'
                              }`}
                            />
                            <p className="truncate text-[14px] font-medium">{c.name}</p>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] ${
                                c.display_type === 'tile'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-neutral-100 text-neutral-600'
                              }`}
                            >
                              {c.display_type}
                            </span>
                          </div>
                          <p className="truncate text-[12px] text-neutral-500">
                            sort {c.sort_order} · {c.href || '(href 없음)'}
                          </p>
                        </div>
                        <CategoryRowActions category={c} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )
          })}

          {orphans.length > 0 && (
            <section className="overflow-hidden rounded-xl border border-yellow-300 bg-yellow-50">
              <div className="border-b border-yellow-200 bg-yellow-100 px-5 py-3">
                <h2 className="text-[14px] font-semibold text-yellow-900">
                  부모가 삭제된 카테고리 ({orphans.length})
                </h2>
              </div>
              <ul className="divide-y divide-yellow-100">
                {orphans.map((c) => (
                  <li key={c.id} className="flex items-center justify-between px-5 py-3">
                    <span className="text-[14px]">{c.name}</span>
                    <CategoryRowActions category={c} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function CategoryRowActions({ category }: { category: Category }) {
  const handleDelete = deleteCategory.bind(null, category.id)
  const handleToggle = toggleCategoryActive.bind(null, category.id, category.is_active)

  return (
    <div className="flex shrink-0 items-center gap-1">
      <form action={handleToggle}>
        <button
          type="submit"
          className="rounded border border-neutral-300 px-2 py-1 text-[11px] hover:bg-neutral-100"
        >
          {category.is_active ? '비활성화' : '활성화'}
        </button>
      </form>
      <Link
        href={`/admin/categories/${category.id}/edit`}
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
  )
}
