import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { updateSiteLogo } from '../actions'
import OptimizedImageInput from '@/components/OptimizedImageInput'
import {
  SITE_LOGO_TEXT_KEY,
  SITE_LOGO_IMAGE_KEY,
  SITE_LOGO_DEFAULT_TEXT,
  SITE_LOGO_DISPLAY_HEIGHT,
} from '@/lib/types'

export const revalidate = 0

export default async function AdminLogoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const sp = await searchParams

  const supabase = await createClient()
  const { data: rows } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', [SITE_LOGO_TEXT_KEY, SITE_LOGO_IMAGE_KEY])

  const map = new Map((rows ?? []).map((r) => [r.key as string, r.value as string]))
  const logoText = map.get(SITE_LOGO_TEXT_KEY)?.trim() || SITE_LOGO_DEFAULT_TEXT
  const logoImagePath = map.get(SITE_LOGO_IMAGE_KEY)?.trim() || null
  const logoImageUrl = logoImagePath
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/site/${logoImagePath}`
    : null

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <h1 className="mb-1 text-2xl font-bold">로고 관리</h1>
      <p className="mb-5 text-[0.875rem] text-neutral-500">
        헤더 로고를 설정해요. 이미지를 올리면 이미지가, 이미지가 없으면 아래 텍스트가 지금 스타일
        그대로 표시됩니다.
      </p>

      {sp.error && (
        <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</p>
      )}

      {/* 현재 로고 미리보기 */}
      <div className="mb-5">
        <p className="mb-1 text-[0.75rem] text-neutral-500">현재 로고</p>
        <div className="flex h-16 items-center rounded-lg border border-neutral-200 bg-white px-4">
          {logoImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoImageUrl}
              alt={logoText}
              className="w-auto object-contain"
              style={{ height: SITE_LOGO_DISPLAY_HEIGHT }}
            />
          ) : (
            <span className="text-[1.375rem] font-extrabold tracking-tight text-black">
              {logoText}
            </span>
          )}
        </div>
      </div>

      <form action={updateSiteLogo} className="flex flex-col gap-3">
        <label className="flex flex-col text-sm">
          로고 텍스트
          <input
            name="logo_text"
            defaultValue={logoText}
            placeholder={SITE_LOGO_DEFAULT_TEXT}
            className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
          />
          <span className="mt-1 text-[0.75rem] text-neutral-500">
            이미지를 올리지 않으면 이 텍스트가 지금 스타일(굵은 검정, {1.375}rem)로 표시돼요.
          </span>
        </label>

        <label className="flex flex-col text-sm">
          로고 이미지 (선택)
          <OptimizedImageInput
            name="image"
            maxWidth={600}
            maxHeight={200}
            quality={90}
            className="mt-1"
          />
          <span className="mt-1 text-[0.75rem] text-neutral-500">
            헤더에는 <strong>높이 {SITE_LOGO_DISPLAY_HEIGHT}px 고정</strong>(가로는 비율에 맞게 자동)
            으로 표시돼요. 선명하게 나오도록 2배 크기(예: 높이 {SITE_LOGO_DISPLAY_HEIGHT * 2}px)
            이미지를 권장하며, 배경이 투명한 PNG가 좋아요. 업로드 시 자동 최적화됩니다.
          </span>
        </label>

        {logoImageUrl && (
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" name="remove_image" className="h-4 w-4" />
            현재 이미지 제거하고 텍스트 로고로 되돌리기
          </label>
        )}

        <div className="mt-2 flex gap-2">
          <button
            type="submit"
            className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            저장
          </button>
          <Link
            href="/mng"
            className="rounded border border-neutral-300 bg-white px-4 py-2 text-sm hover:bg-neutral-100"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  )
}
