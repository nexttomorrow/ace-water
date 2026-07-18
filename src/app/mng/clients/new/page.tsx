import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClientLogo } from '../../actions'
import OptimizedImageInput from '@/components/OptimizedImageInput'
import {
  CLIENT_LOGOS_MAX,
  CLIENT_LOGO_CARD_HEIGHT,
  CLIENT_LOGO_CARD_WIDTH,
} from '@/lib/types'

export default async function NewClientLogoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const sp = await searchParams

  const supabase = await createClient()
  const { count } = await supabase
    .from('client_logos')
    .select('*', { count: 'exact', head: true })

  if ((count ?? 0) >= CLIENT_LOGOS_MAX) {
    redirect(
      '/mng/clients?error=' +
        encodeURIComponent(`로고는 최대 ${CLIENT_LOGOS_MAX}개까지 등록할 수 있어요`)
    )
  }

  const nextOrder = (count ?? 0) + 1

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <h1 className="mb-5 text-2xl font-bold">로고 추가</h1>

      {sp.error && (
        <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</p>
      )}

      <form action={createClientLogo} className="flex flex-col gap-3">
        <label className="flex flex-col text-sm">
          로고 이름
          <input
            name="name"
            required
            placeholder="예: 삼성전자"
            className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
          />
          <span className="mt-1 text-[0.75rem] text-neutral-500">
            마우스를 올리면 표시되는 이름이에요 (이미지 대체텍스트/관리 목록에도 사용). 필수 항목입니다.
          </span>
        </label>
        <label className="flex flex-col text-sm">
          링크 (선택)
          <input
            name="link_url"
            placeholder="예: https://samsung.com"
            className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
          />
          <span className="mt-1 text-[0.75rem] text-neutral-500">
            로고 클릭 시 새 탭으로 열려요. 비워두면 클릭해도 이동하지 않아요.
          </span>
        </label>
        <label className="flex flex-col text-sm">
          정렬 순서
          <input
            name="sort_order"
            type="number"
            defaultValue={nextOrder}
            className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
          />
          <span className="mt-1 text-[0.75rem] text-neutral-500">작은 숫자가 먼저 표시돼요</span>
        </label>
        <label className="flex flex-col text-sm">
          로고 이미지
          <OptimizedImageInput
            name="image"
            required
            maxWidth={600}
            maxHeight={300}
            quality={90}
            className="mt-1"
          />
          <span className="mt-1 text-[0.75rem] text-neutral-500">
            {CLIENT_LOGO_CARD_WIDTH}×{CLIENT_LOGO_CARD_HEIGHT} 카드에 맞춰 잘려(크롭) 표시돼요.
            비슷한 가로세로 비율의 이미지를 권장해요. 업로드 시 자동 최적화됩니다.
          </span>
        </label>

        <div className="mt-2 flex gap-2">
          <button
            type="submit"
            className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            등록
          </button>
          <Link
            href="/mng/clients"
            className="rounded border border-neutral-300 bg-white px-4 py-2 text-sm hover:bg-neutral-100"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  )
}
