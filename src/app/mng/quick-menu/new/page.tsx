import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createQuickMenuItem } from '../../actions'
import QuickMenuForm from '@/components/QuickMenuForm'
import { QUICK_MENU_MAX } from '@/lib/types'

export default async function NewQuickMenuPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const sp = await searchParams

  const supabase = await createClient()
  const { count } = await supabase
    .from('quick_menu_items')
    .select('*', { count: 'exact', head: true })

  if ((count ?? 0) >= QUICK_MENU_MAX) {
    redirect(
      '/mng/quick-menu?error=' +
        encodeURIComponent(`퀵메뉴는 최대 ${QUICK_MENU_MAX}개까지 등록할 수 있어요`)
    )
  }

  const nextOrder = (count ?? 0) + 1

  return (
    <div className="mx-auto max-w-[720px] px-6 py-12">
      <h1 className="mb-5 text-2xl font-bold">퀵메뉴 추가</h1>

      {sp.error && (
        <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</p>
      )}

      <QuickMenuForm
        action={createQuickMenuItem}
        submitLabel="등록"
        defaults={{ sort_order: nextOrder }}
      />
    </div>
  )
}
