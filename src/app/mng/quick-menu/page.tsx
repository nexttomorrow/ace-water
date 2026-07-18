import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { deleteQuickMenuItem } from '../actions'
import QuickMenuNodeIcon from '@/components/QuickMenuNodeIcon'
import { resolveIconNode, type IconNode } from '@/lib/quickMenuIconNode'
import { QUICK_MENU_MAX, type QuickMenuItem } from '@/lib/types'

export const revalidate = 0

export default async function AdminQuickMenuPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const sp = await searchParams
  const supabase = await createClient()
  const { data } = await supabase
    .from('quick_menu_items')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true })

  const items = (data ?? []) as QuickMenuItem[]
  const reachedMax = items.length >= QUICK_MENU_MAX

  const nodes: Record<number, IconNode | null> = Object.fromEntries(
    await Promise.all(items.map(async (it) => [it.id, await resolveIconNode(it.icon_key)]))
  )

  return (
    <div className="mx-auto max-w-[900px] px-6 py-12">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">퀵메뉴 관리</h1>
        {reachedMax ? (
          <span className="rounded bg-neutral-200 px-3 py-2 text-sm text-neutral-500">
            최대 {QUICK_MENU_MAX}개 등록됨
          </span>
        ) : (
          <Link
            href="/mng/quick-menu/new"
            className="rounded bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            + 항목 추가
          </Link>
        )}
      </div>
      <p className="mb-6 text-[0.875rem] text-neutral-500">
        PC 화면 우측에 떠 있는 퀵메뉴를 관리해요. 최대 {QUICK_MENU_MAX}개까지 등록할 수 있고,
        정렬값(작은 숫자가 위)으로 노출 순서를 정할 수 있어요.
      </p>

      {sp.error && (
        <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</p>
      )}

      {items.length === 0 ? (
        <p className="rounded border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          등록된 퀵메뉴가 없어요. 첫 항목을 추가해보세요.
        </p>
      ) : (
        <ul className="divide-y divide-neutral-100 overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {items.map((item) => {
            const handleDelete = deleteQuickMenuItem.bind(null, item.id)
            const external = /^https?:\/\//i.test(item.href)
            return (
              <li key={item.id} className="flex items-center gap-4 px-4 py-3">
                <span className="w-6 shrink-0 text-center text-[0.75rem] font-semibold text-neutral-400">
                  {item.sort_order}
                </span>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
                  <QuickMenuNodeIcon node={nodes[item.id]} className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="whitespace-pre-line break-keep font-semibold leading-snug">
                    {item.title}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 truncate text-[0.8125rem] text-neutral-500">
                    {external && (
                      <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[0.6875rem] font-medium text-neutral-500">
                        새 탭
                      </span>
                    )}
                    <span className="truncate">{item.href}</span>
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link
                    href={`/mng/quick-menu/${item.id}/edit`}
                    className="rounded border border-neutral-300 px-3 py-1.5 text-xs hover:bg-neutral-100"
                  >
                    수정
                  </Link>
                  <form action={handleDelete}>
                    <button
                      type="submit"
                      className="rounded border border-red-300 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50"
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
