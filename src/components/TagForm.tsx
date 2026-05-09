import Link from 'next/link'
import { TAG_TONES, TAG_TONE_BADGE_CLS, type Tag, type TagScope } from '@/lib/types'

type Props = {
  action: (formData: FormData) => Promise<void>
  initial?: Partial<Tag>
  errorMessage?: string
  submitLabel: string
  cancelHref: string
}

const SCOPE_OPTIONS: { value: TagScope; label: string }[] = [
  { value: 'product', label: '제품' },
  { value: 'qna', label: 'Q&A' },
]

export default function TagForm({
  action,
  initial,
  errorMessage,
  submitLabel,
  cancelHref,
}: Props) {
  const v = {
    scope: initial?.scope ?? 'product',
    value: initial?.value ?? '',
    label: initial?.label ?? '',
    tone: initial?.tone ?? 'neutral',
    sort_order: initial?.sort_order ?? 0,
    is_active: initial?.is_active ?? true,
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      {errorMessage && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
      )}

      <label className="flex flex-col text-sm">
        <span className="font-medium">사용 영역 (scope)</span>
        <select
          name="scope"
          defaultValue={v.scope}
          className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
        >
          {SCOPE_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <span className="mt-1 text-[0.6875rem] text-neutral-500">
          어디서 사용할 태그인지. 등록 후에도 변경 가능.
        </span>
      </label>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="flex flex-col text-sm">
          <span className="font-medium">
            value (시스템 키) <span className="text-rose-500">*</span>
          </span>
          <input
            name="value"
            required
            defaultValue={v.value}
            placeholder="예: new, best, delivery"
            className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2 font-mono"
          />
          <span className="mt-1 text-[0.6875rem] text-neutral-500">
            영문 소문자 / 숫자 / 하이픈 권장. 같은 영역(scope) 내에서 고유.
          </span>
        </label>

        <label className="flex flex-col text-sm">
          <span className="font-medium">
            label (노출 라벨) <span className="text-rose-500">*</span>
          </span>
          <input
            name="label"
            required
            defaultValue={v.label}
            placeholder="예: NEW, BEST, 배송"
            className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
          />
          <span className="mt-1 text-[0.6875rem] text-neutral-500">
            사이트에 실제로 보여질 텍스트.
          </span>
        </label>
      </div>

      <fieldset className="flex flex-col text-sm">
        <legend className="font-medium">색상 (tone)</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {TAG_TONES.map((t) => (
            <label key={t} className="cursor-pointer">
              <input
                type="radio"
                name="tone"
                value={t}
                defaultChecked={v.tone === t}
                className="peer sr-only"
              />
              <span
                className={`inline-flex items-center rounded-full px-3 py-1.5 text-[0.75rem] font-bold transition ${
                  TAG_TONE_BADGE_CLS[t]
                } opacity-50 ring-2 ring-transparent peer-checked:opacity-100 peer-checked:ring-neutral-900 peer-checked:ring-offset-2`}
              >
                {t}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col text-sm">
          <span className="font-medium">정렬 순서</span>
          <input
            name="sort_order"
            type="number"
            defaultValue={v.sort_order}
            className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
          />
          <span className="mt-1 text-[0.6875rem] text-neutral-500">작을수록 앞</span>
        </label>
        <label className="mt-1 flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_active" defaultChecked={v.is_active} />
          <span>활성화 (체크 해제 시 폼·노출에서 제외)</span>
        </label>
      </div>

      <div className="mt-2 flex gap-2">
        <button
          type="submit"
          className="rounded-full bg-black px-5 py-2 text-[0.8125rem] font-medium text-white hover:bg-neutral-800"
        >
          {submitLabel}
        </button>
        <Link
          href={cancelHref}
          className="rounded-full border border-neutral-300 px-5 py-2 text-[0.8125rem] hover:bg-neutral-100"
        >
          취소
        </Link>
      </div>
    </form>
  )
}
