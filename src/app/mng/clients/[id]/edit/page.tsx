import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateClientLogo } from '../../../actions'
import OptimizedImageInput from '@/components/OptimizedImageInput'
import {
  CLIENT_LOGO_CARD_HEIGHT,
  CLIENT_LOGO_CARD_WIDTH,
  type ClientLogo,
} from '@/lib/types'

export default async function EditClientLogoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const logoId = Number(id)
  if (!Number.isFinite(logoId)) notFound()

  const supabase = await createClient()
  const { data } = await supabase
    .from('client_logos')
    .select('*')
    .eq('id', logoId)
    .single()
  if (!data) notFound()
  const logo = data as ClientLogo

  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/clients/${logo.image_path}`
  const action = updateClientLogo.bind(null, logoId)

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <h1 className="mb-5 text-2xl font-bold">로고 수정</h1>

      {sp.error && (
        <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</p>
      )}

      <div className="mb-4">
        <p className="mb-1 text-[0.75rem] text-neutral-500">현재 로고 (실제 노출 비율)</p>
        <div className="relative h-[84px] w-[200px] overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <Image
            src={publicUrl}
            alt={logo.name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      </div>

      <form action={action} className="flex flex-col gap-3">
        <label className="flex flex-col text-sm">
          로고 이름
          <input
            name="name"
            required
            defaultValue={logo.name}
            placeholder="예: 삼성전자"
            className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
          />
          <span className="mt-1 text-[0.75rem] text-neutral-500">
            마우스를 올리면 표시되는 이름이에요. 필수 항목입니다.
          </span>
        </label>
        <label className="flex flex-col text-sm">
          링크 (선택)
          <input
            name="link_url"
            defaultValue={logo.link_url ?? ''}
            placeholder="예: https://samsung.com"
            className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
          />
          <span className="mt-1 text-[0.75rem] text-neutral-500">
            로고 클릭 시 새 탭으로 열려요. 비워두면 이동하지 않아요.
          </span>
        </label>
        <label className="flex flex-col text-sm">
          정렬 순서
          <input
            name="sort_order"
            type="number"
            defaultValue={logo.sort_order}
            className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
          />
        </label>
        <label className="flex flex-col text-sm">
          이미지 교체 (선택)
          <OptimizedImageInput
            name="image"
            maxWidth={600}
            maxHeight={300}
            quality={90}
            className="mt-1"
          />
          <span className="mt-1 text-[0.75rem] text-neutral-500">
            새 이미지를 올리면 교체돼요. {CLIENT_LOGO_CARD_WIDTH}×{CLIENT_LOGO_CARD_HEIGHT} 카드에
            맞춰 크롭됩니다.
          </span>
        </label>

        <div className="mt-2 flex gap-2">
          <button
            type="submit"
            className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            저장
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
