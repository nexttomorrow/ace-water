import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updatePopup } from '../../../actions'
import PopupForm from '@/components/PopupForm'
import type { Popup } from '@/lib/types'

export default async function EditPopupPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const popupId = Number(id)
  if (!Number.isFinite(popupId)) notFound()

  const supabase = await createClient()
  const { data } = await supabase.from('popups').select('*').eq('id', popupId).single()
  if (!data) notFound()
  const popup = data as Popup

  const action = updatePopup.bind(null, popupId)

  return (
    <div className="mx-auto max-w-[760px] px-6 py-12">
      <h1 className="mb-5 text-2xl font-bold">팝업 수정</h1>

      {sp.error && (
        <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</p>
      )}

      <PopupForm action={action} submitLabel="저장" defaults={popup} />
    </div>
  )
}
