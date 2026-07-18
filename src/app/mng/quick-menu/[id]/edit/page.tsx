import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateQuickMenuItem } from '../../../actions'
import QuickMenuForm from '@/components/QuickMenuForm'
import type { QuickMenuItem } from '@/lib/types'

export default async function EditQuickMenuPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const itemId = Number(id)
  if (!Number.isFinite(itemId)) notFound()

  const supabase = await createClient()
  const { data } = await supabase
    .from('quick_menu_items')
    .select('*')
    .eq('id', itemId)
    .single()
  if (!data) notFound()
  const item = data as QuickMenuItem

  const action = updateQuickMenuItem.bind(null, itemId)

  return (
    <div className="mx-auto max-w-[720px] px-6 py-12">
      <h1 className="mb-5 text-2xl font-bold">퀵메뉴 수정</h1>

      {sp.error && (
        <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</p>
      )}

      <QuickMenuForm
        action={action}
        submitLabel="저장"
        defaults={{
          title: item.title,
          href: item.href,
          icon_key: item.icon_key,
          sort_order: item.sort_order,
        }}
      />
    </div>
  )
}
