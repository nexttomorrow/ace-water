import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateCategoryBanner } from '../../../actions'
import type { Category } from '@/lib/types'

export default async function EditSubpageBannerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const catId = Number(id)
  if (!Number.isFinite(catId)) notFound()

  const supabase = await createClient()
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('id', catId)
    .single()
  if (!category) notFound()

  const cat = category as Category
  const action = updateCategoryBanner.bind(null, catId)
  const bannerImageUrl = cat.banner_image_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/category-banners/${cat.banner_image_path}`
    : null

  // 부모 카테고리 배너 — 자체 배너가 없을 때 자동 상속됨
  let parentBannerImageUrl: string | null = null
  let parentName: string | null = null
  if (cat.parent_id) {
    const { data: parent } = await supabase
      .from('categories')
      .select('name, banner_image_path')
      .eq('id', cat.parent_id)
      .maybeSingle()
    if (parent) {
      parentName = parent.name
      if (parent.banner_image_path) {
        parentBannerImageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/category-banners/${parent.banner_image_path}`
      }
    }
  }
  const isTopLevel = cat.parent_id == null

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-1 text-[12px] text-neutral-500">
        <Link href="/admin/subpages" className="hover:underline">
          서브페이지 배너 관리
        </Link>
        {' › '}
        <span>{cat.name}</span>
      </div>
      <h1 className="mb-1 text-2xl font-bold">{cat.name} 배너 수정</h1>
      <p className="mb-6 text-[13px] text-neutral-500">
        대상 페이지: <span className="font-mono">{cat.href}</span>
      </p>

      {sp.error && (
        <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</p>
      )}

      {isTopLevel ? (
        <p className="mb-5 rounded-md bg-blue-50 px-3 py-2 text-[12px] leading-[1.7] text-blue-800 ring-1 ring-blue-100">
          💡 <strong>대분류</strong>의 배너 이미지는, 배너가 없는{' '}
          <strong>하위 카테고리</strong>들이 그대로 상속받아 사용합니다. 하위에서 자체 배너를
          따로 등록하면 그 카테고리에서는 자체 배너가 우선 적용돼요.
        </p>
      ) : !cat.banner_image_path && parentBannerImageUrl ? (
        <div className="mb-5 rounded-md bg-amber-50 p-3 text-[12px] text-amber-900 ring-1 ring-amber-100">
          <p className="font-semibold">
            현재 상위 카테고리 “{parentName}” 의 배너를 자동 상속 중입니다.
          </p>
          <div className="mt-2 flex items-start gap-3">
            <div className="aspect-[16/5] w-40 shrink-0 overflow-hidden rounded border border-amber-200">
              <Image
                src={parentBannerImageUrl}
                alt=""
                width={320}
                height={100}
                className="h-full w-full object-cover"
                unoptimized
              />
            </div>
            <p className="text-[11.5px] leading-[1.6] text-amber-800">
              자체 배너를 등록하면 이 상속분을 덮어쓰게 됩니다.
            </p>
          </div>
        </div>
      ) : !cat.banner_image_path ? (
        <p className="mb-5 rounded-md bg-amber-50 px-3 py-2 text-[12px] leading-[1.7] text-amber-900 ring-1 ring-amber-100">
          💡 비우면 <strong>상위 카테고리의 배너</strong>를 자동 상속합니다.
          {parentName ? ` (현재 상위 “${parentName}” 의 배너도 비어 있어요)` : ''}
        </p>
      ) : null}

      <form action={action} className="flex flex-col gap-5">
        <label className="flex flex-col text-sm">
          <span className="font-medium">배너 이미지</span>
          <span className="mt-1 text-[11px] text-neutral-500">
            권장 1920×600. 비우면 텍스트 헤더로 대체됩니다.
            {!isTopLevel && ' 비울 경우 상위 카테고리 배너를 자동 상속합니다.'}
          </span>
          {bannerImageUrl && (
            <div className="my-3 flex items-center gap-3">
              <div className="aspect-[16/5] w-full max-w-md overflow-hidden rounded border border-neutral-200">
                <Image
                  src={bannerImageUrl}
                  alt=""
                  width={800}
                  height={250}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              </div>
            </div>
          )}
          <input
            name="banner_image"
            type="file"
            accept="image/*"
            className="mt-2 rounded border border-neutral-300 bg-white px-3 py-2"
          />
          {bannerImageUrl && (
            <label className="mt-2 inline-flex items-center gap-2 text-[12px] text-neutral-600">
              <input type="checkbox" name="remove_banner_image" />
              현재 배너 이미지 제거
            </label>
          )}
        </label>

        <label className="flex flex-col text-sm">
          <span className="font-medium">배너 제목</span>
          <input
            name="banner_title"
            defaultValue={cat.banner_title ?? ''}
            placeholder={`비우면 카테고리 이름(${cat.name})을 사용합니다`}
            className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
          />
        </label>

        <label className="flex flex-col text-sm">
          <span className="font-medium">배너 부제목</span>
          <textarea
            name="banner_subtitle"
            rows={2}
            defaultValue={cat.banner_subtitle ?? ''}
            placeholder={
              cat.description
                ? `비우면 카테고리 설명을 사용합니다: ${cat.description}`
                : '한 줄 설명 (선택)'
            }
            className="mt-1 resize-y rounded border border-neutral-300 bg-white px-3 py-2"
          />
        </label>

        <div className="mt-2 flex gap-2">
          <button
            type="submit"
            className="rounded-full bg-black px-5 py-2 text-[13px] font-medium text-white hover:bg-neutral-800"
          >
            저장
          </button>
          <Link
            href="/admin/subpages"
            className="rounded-full border border-neutral-300 px-5 py-2 text-[13px] hover:bg-neutral-100"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  )
}
