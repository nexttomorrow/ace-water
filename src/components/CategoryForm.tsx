import Link from 'next/link'
import Image from 'next/image'
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
  }

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

      <label className="flex flex-col text-sm">
        <span className="font-medium">상위 카테고리</span>
        <select
          name="parent_id"
          defaultValue={v.parent_id ?? ''}
          className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
        >
          <option value="">(없음 — 메인 메뉴 아이템)</option>
          {topLevelOptions.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <span className="mt-1 text-[11px] text-neutral-500">
          상위를 선택하면 메가메뉴 안에 노출됩니다. 없으면 메인 메뉴 아이템이 됩니다.
        </span>
      </label>

      <label className="flex flex-col text-sm">
        <span className="font-medium">표시 방식</span>
        <select
          name="display_type"
          defaultValue={v.display_type}
          className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
        >
          <option value="tile">tile — 메가메뉴 좌측 그리드 (이미지 + 이름)</option>
          <option value="text">text — 메가메뉴 좌측 그리드 (이름만, 이미지 없음)</option>
          <option value="link">link — 메가메뉴 우측 텍스트 링크</option>
        </select>
      </label>

      <label className="flex flex-col text-sm">
        <span className="font-medium">href (이동할 URL)</span>
        <input
          name="href"
          defaultValue={v.href ?? ''}
          placeholder="예: /gallery 또는 https://..."
          className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
        />
        <span className="mt-1 text-[11px] text-neutral-500">
          비우면 # 으로 처리됩니다.
        </span>
      </label>

      <label className="flex flex-col text-sm">
        <span className="font-medium">설명 (서브페이지 부제목)</span>
        <textarea
          name="description"
          rows={2}
          defaultValue={v.description ?? ''}
          placeholder="해당 페이지 상단에 보여질 한 줄 설명"
          className="mt-1 resize-y rounded border border-neutral-300 bg-white px-3 py-2"
        />
        <span className="mt-1 text-[11px] text-neutral-500">
          이 카테고리의 href와 일치하는 서브페이지 헤더에 노출됩니다.
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
              <label className="flex items-center gap-2 text-[12px] text-neutral-600">
                <input type="checkbox" name="remove_image" />
                이미지 제거
              </label>
            )}
          </div>
        )}
        <input
          name="image"
          type="file"
          accept="image/*"
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
          <span className="mt-1 text-[11px] text-neutral-500">작을수록 앞</span>
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

      <div className="mt-2 flex gap-2">
        <button
          type="submit"
          className="rounded-full bg-black px-5 py-2 text-[13px] font-medium text-white hover:bg-neutral-800"
        >
          {submitLabel}
        </button>
        <Link
          href={cancelHref}
          className="rounded-full border border-neutral-300 px-5 py-2 text-[13px] hover:bg-neutral-100"
        >
          취소
        </Link>
      </div>
    </form>
  )
}
