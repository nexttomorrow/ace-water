'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import Select from '@/components/ui/Select'
import OptimizedImageInput from '@/components/OptimizedImageInput'
import type { Category } from '@/lib/types'

type Props = {
  action: (formData: FormData) => Promise<void>
  topLevelOptions: Pick<Category, 'id' | 'name'>[]
  initial?: Partial<Category>
  errorMessage?: string
  submitLabel: string
  cancelHref: string
  /** when editing, current image preview url */
  imageUrl?: string | null
  showRemoveImage?: boolean
  /** when editing, current banner image preview url */
  bannerImageUrl?: string | null
  showRemoveBannerImage?: boolean
}

export default function CategoryForm({
  action,
  topLevelOptions,
  initial,
  errorMessage,
  submitLabel,
  cancelHref,
  imageUrl,
  showRemoveImage,
  bannerImageUrl,
  showRemoveBannerImage,
}: Props) {
  const v = {
    name: initial?.name ?? '',
    slug: initial?.slug ?? '',
    href: initial?.href ?? '',
    description: initial?.description ?? '',
    parent_id: initial?.parent_id ?? '',
    display_type: initial?.display_type ?? 'tile',
    sort_order: initial?.sort_order ?? 0,
    is_active: initial?.is_active ?? true,
    banner_title: initial?.banner_title ?? '',
    banner_subtitle: initial?.banner_subtitle ?? '',
  }

  // 최상위(대분류) 여부 — parent_id 가 비어 있으면 메가메뉴용 tile 이미지·표시 방식이 의미가 없음
  const [parentId, setParentId] = useState<string>(
    v.parent_id != null ? String(v.parent_id) : ''
  )
  const isTopLevel = parentId === '' || parentId === '0'

  return (
    <form action={action} className="flex flex-col gap-4">
      {errorMessage && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
      )}

      <label className="flex flex-col text-sm">
        <span className="font-medium">이름 *</span>
        <input
          name="name"
          required
          defaultValue={v.name}
          placeholder="예: 모바일"
          className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      <div className="flex flex-col text-sm">
        <span className="font-medium">상위 카테고리</span>
        <div className="mt-1">
          <Select
            name="parent_id"
            value={parentId}
            onChange={setParentId}
            placeholder="(없음 — 메인 메뉴 아이템)"
            options={[
              { value: '', label: '(없음 — 메인 메뉴 아이템)' },
              ...topLevelOptions.map((t) => ({
                value: String(t.id),
                label: t.name,
              })),
            ]}
          />
        </div>
        <span className="mt-1 text-[0.75rem] text-neutral-500">
          상위를 선택하면 메가메뉴 안에 노출됩니다. 없으면 메인 메뉴 아이템이 됩니다.
        </span>
      </div>

      <div className="flex flex-col text-sm">
        <span className="font-medium">표시 방식</span>
        <div className="mt-1">
          <Select
            name="display_type"
            defaultValue={v.display_type}
            options={[
              { value: 'tile', label: 'tile — 메가메뉴 좌측 그리드 (이미지 + 이름)' },
              { value: 'text', label: 'text — 메가메뉴 좌측 그리드 (이름만, 이미지 없음)' },
              { value: 'link', label: 'link — 메가메뉴 우측 텍스트 링크' },
            ]}
          />
        </div>
      </div>

      <label className="flex flex-col text-sm">
        <span className="font-medium">href (이동할 URL)</span>
        <input
          name="href"
          defaultValue={v.href ?? ''}
          placeholder="예: /gallery 또는 https://..."
          className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
        />
        <span className="mt-1 text-[0.75rem] text-neutral-500">
          비우면 # 으로 처리됩니다.
        </span>
      </label>

      <label className="flex flex-col text-sm">
        <span className="font-medium">간단 설명 (선택)</span>
        <input
          name="description"
          defaultValue={v.description ?? ''}
          placeholder="예: 에이스워터를 소개합니다."
          className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
        />
        <span className="mt-1 text-[0.75rem] text-neutral-500">
          메가메뉴 타일 하단 등에 노출되는 짧은 설명입니다.
        </span>
      </label>

      <label className="flex flex-col text-sm">
        <span className="font-medium">이미지 (tile 권장)</span>
        {imageUrl && (
          <div className="my-2 flex items-center gap-3">
            <div className="h-20 w-20 overflow-hidden rounded border border-neutral-200">
              <Image
                src={imageUrl}
                alt=""
                width={80}
                height={80}
                className="h-full w-full object-cover"
                unoptimized
              />
            </div>
            {showRemoveImage && (
              <label className="flex items-center gap-2 text-[0.75rem] text-neutral-600">
                <input type="checkbox" name="remove_image" />
                이미지 제거
              </label>
            )}
          </div>
        )}
        <OptimizedImageInput
          name="image"
          maxWidth={1024}
          maxHeight={1024}
          quality={85}
          className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col text-sm">
          <span className="font-medium">정렬 순서</span>
          <input
            name="sort_order"
            type="number"
            defaultValue={v.sort_order}
            className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
          />
          <span className="mt-1 text-[0.75rem] text-neutral-500">작을수록 앞</span>
        </label>

        <label className="flex flex-col text-sm">
          <span className="font-medium">slug</span>
          <input
            name="slug"
            defaultValue={v.slug ?? ''}
            placeholder="mobile (선택)"
            className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
          />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_active" defaultChecked={v.is_active} />
        <span>활성화 (체크 해제 시 비공개)</span>
      </label>

      <fieldset className="mt-2 rounded-lg border border-neutral-200 bg-neutral-50/50 p-4">
        <legend className="px-2 text-[0.875rem] font-semibold text-neutral-700">
          서브페이지 배너 (선택)
        </legend>
        <p className="mb-3 text-[0.75rem] text-neutral-500">
          이 카테고리의 href 페이지 상단에 노출되는 큰 배너입니다. 권장 1920×600.
        </p>
        {isTopLevel ? (
          <p className="mb-3 rounded-md bg-blue-50 px-3 py-2 text-[0.75rem] leading-[1.6] text-blue-800 ring-1 ring-blue-100">
            💡 <strong>대분류</strong>에 등록한 배너 이미지는, 배너가 비어있는{' '}
            <strong>하위 카테고리</strong>들이 그대로 상속받아 사용합니다. 하위에서 자체
            배너를 따로 등록하면 그 카테고리에서는 자체 배너가 우선 적용돼요.
          </p>
        ) : (
          <p className="mb-3 rounded-md bg-amber-50 px-3 py-2 text-[0.75rem] leading-[1.6] text-amber-800 ring-1 ring-amber-100">
            💡 비워두면 <strong>상위 카테고리의 배너</strong>를 자동 상속합니다. 자체 배너를
            등록하면 그 배너가 상속분을 덮어씁니다.
          </p>
        )}

        <label className="flex flex-col text-sm">
          <span className="font-medium">배너 이미지</span>
          {bannerImageUrl && (
            <div className="my-2 flex items-center gap-3">
              <div className="h-20 w-40 overflow-hidden rounded border border-neutral-200">
                <Image
                  src={bannerImageUrl}
                  alt=""
                  width={320}
                  height={160}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              </div>
              {showRemoveBannerImage && (
                <label className="flex items-center gap-2 text-[0.75rem] text-neutral-600">
                  <input type="checkbox" name="remove_banner_image" />
                  배너 제거
                </label>
              )}
            </div>
          )}
          <OptimizedImageInput
            name="banner_image"
            maxWidth={2400}
            maxHeight={1000}
            quality={85}
            className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
          />
        </label>

        <label className="mt-3 flex flex-col text-sm">
          <span className="font-medium">배너 제목</span>
          <input
            name="banner_title"
            defaultValue={v.banner_title ?? ''}
            placeholder="비우면 위의 카테고리 이름을 사용합니다"
            className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
          />
        </label>

        <label className="mt-3 flex flex-col text-sm">
          <span className="font-medium">배너 부제목</span>
          <textarea
            name="banner_subtitle"
            rows={2}
            defaultValue={v.banner_subtitle ?? ''}
            placeholder="해당 페이지 상단에 보여질 한 줄 설명 (선택)"
            className="mt-1 resize-y rounded border border-neutral-300 bg-white px-3 py-2"
          />
        </label>
      </fieldset>

      <div className="mt-2 flex gap-2">
        <button
          type="submit"
          className="rounded-full bg-black px-5 py-2 text-[0.875rem] font-medium text-white hover:bg-neutral-800"
        >
          {submitLabel}
        </button>
        <Link
          href={cancelHref}
          className="rounded-full border border-neutral-300 px-5 py-2 text-[0.875rem] hover:bg-neutral-100"
        >
          취소
        </Link>
      </div>
    </form>
  )
}
