import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CategoryListClient from './CategoryListClient'
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
  const orphans = all.filter(
    (c) => c.parent_id !== null && !tops.some((t) => t.id === c.parent_id)
  )

  const childrenByParent: Record<number, Category[]> = {}
  for (const t of tops) {
    childrenByParent[t.id] = all.filter((c) => c.parent_id === t.id)
  }

  const imageBaseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/categories/`

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">카테고리 관리</h1>
          <p className="mt-1 text-[0.875rem] text-neutral-500">
            메인 헤더 GNB 의 메가메뉴를 구성합니다. 상위 카테고리는 메뉴 아이템으로,
            하위 카테고리는 메가메뉴 안의 타일/링크로 노출됩니다. 좌측의{' '}
            <span aria-hidden>⠿</span> 핸들이나 행을 드래그해서 순서를 바꿀 수 있어요.
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="rounded-full bg-black px-4 py-2 text-[0.875rem] font-medium text-white hover:bg-neutral-800"
        >
          + 카테고리 추가
        </Link>
      </div>

      <CategoryListClient
        tops={tops}
        childrenByParent={childrenByParent}
        orphans={orphans}
        imageBaseUrl={imageBaseUrl}
      />
    </div>
  )
}
