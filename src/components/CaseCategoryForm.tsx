import Link from 'next/link'
import type { ConstructionCaseCategory } from '@/lib/types'

type Props = {
  action: (formData: FormData) => Promise<void>
  initial?: Partial<ConstructionCaseCategory>
  errorMessage?: string
  submitLabel: string
  cancelHref: string
}

export default function CaseCategoryForm({
  action,
  initial,
  errorMessage,
  submitLabel,
  cancelHref,
}: Props) {
  const v = {
    name: initial?.name ?? '',
    slug: initial?.slug ?? '',
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
          placeholder="예: 음수기"
          className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      <label className="flex flex-col text-sm">
        <span className="font-medium">slug (선택)</span>
        <input
          name="slug"
          defaultValue={v.slug ?? ''}
          placeholder="water-fountain"
          className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
        />
        <span className="mt-1 text-[11px] text-neutral-500">
          영문 식별자. 비워둬도 됩니다.
        </span>
      </label>

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
