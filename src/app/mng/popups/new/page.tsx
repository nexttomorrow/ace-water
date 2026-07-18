import { createPopup } from '../../actions'
import PopupForm from '@/components/PopupForm'

export default async function NewPopupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const sp = await searchParams

  return (
    <div className="mx-auto max-w-[760px] px-6 py-12">
      <h1 className="mb-5 text-2xl font-bold">팝업 추가</h1>

      {sp.error && (
        <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</p>
      )}

      <PopupForm action={createPopup} submitLabel="등록" />
    </div>
  )
}
