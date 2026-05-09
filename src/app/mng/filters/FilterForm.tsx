'use client'

import Link from 'next/link'
import { useState } from 'react'
import Select from '@/components/ui/Select'
import type { ProductFilter, ProductFilterOption } from '@/lib/types'

type CategoryOpt = { id: number; name: string }

type Props = {
  action: (formData: FormData) => Promise<void>
  errorMessage?: string
  categories: CategoryOpt[]
  initial?: ProductFilter | null
  /** 이미 등록된 필터들 (key 충돌 시 시각적 경고용; 서버는 unique index 가 책임) */
  existingKeys?: { categoryId: number | null; key: string }[]
}

const inputCls =
  'w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-[0.875rem] text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100'

export default function FilterForm({
  action,
  errorMessage,
  categories,
  initial,
}: Props) {
  const [categoryId, setCategoryId] = useState<string>(
    initial?.category_id != null ? String(initial.category_id) : ''
  )
  const [keyText, setKeyText] = useState(initial?.key ?? '')
  const [label, setLabel] = useState(initial?.label ?? '')
  const [options, setOptions] = useState<ProductFilterOption[]>(
    initial?.options ?? []
  )
  const [isVisible, setIsVisible] = useState<boolean>(initial?.is_visible ?? true)
  const [sortOrder, setSortOrder] = useState<number>(initial?.sort_order ?? 0)

  const updateOption = (i: number, patch: Partial<ProductFilterOption>) => {
    setOptions((prev) =>
      prev.map((o, idx) => (idx === i ? { ...o, ...patch } : o))
    )
  }
  const addOption = () =>
    setOptions((prev) => [...prev, { value: '', label: '' }])
  const removeOption = (i: number) =>
    setOptions((prev) => prev.filter((_, idx) => idx !== i))

  /** 'color' 키는 옵션이 자동 합성되므로 옵션 편집 UI 를 숨기고 안내만 노출 */
  const isAutoColorFilter = keyText.trim().toLowerCase() === 'color'

  return (
    <form action={action} className="flex flex-col gap-8">
      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[0.875rem] text-red-700">
          {errorMessage}
        </div>
      )}

      <Section title="기본 설정">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="적용 카테고리" hint="선택하지 않으면 모든 카테고리에 공통 적용 (글로벌 필터)">
            <Select
              name="category_id"
              value={categoryId}
              onChange={setCategoryId}
              placeholder="전체 (글로벌)"
              options={[
                { value: '', label: '전체 (글로벌)' },
                ...categories.map((c) => ({
                  value: String(c.id),
                  label: c.name,
                })),
              ]}
            />
          </Field>

          <Field label="라벨" required hint="화면에 노출되는 이름. ex) 용도, 사이즈, 색상">
            <input
              type="text"
              name="label"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="ex.용도"
              className={inputCls}
            />
          </Field>

          <Field label="키 (영문)" required hint="DB·URL 에 쓰이는 영문 키. ex) usage, size, color">
            <input
              type="text"
              name="key"
              required
              value={keyText}
              onChange={(e) => setKeyText(e.target.value)}
              placeholder="ex.usage"
              className={`${inputCls} font-mono`}
            />
          </Field>

          <Field label="정렬 (sort)" hint="작을수록 먼저 노출. 드래그로도 조정 가능">
            <input
              type="number"
              name="sort_order"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
              className={inputCls}
            />
          </Field>

          <Field label="노출 여부">
            <label className="inline-flex items-center gap-2 text-[0.875rem] text-neutral-700">
              <input
                type="checkbox"
                name="is_visible"
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
                className="h-4 w-4 cursor-pointer accent-blue-600"
              />
              체크하면 /products 페이지에 노출
            </label>
          </Field>
        </div>
      </Section>

      <Section
        title="옵션 목록"
        right={
          isAutoColorFilter ? null : (
            <button
              type="button"
              onClick={addOption}
              className="rounded-full border border-neutral-300 px-3 py-1.5 text-[0.75rem] font-medium text-neutral-700 hover:bg-neutral-100"
            >
              + 옵션 추가
            </button>
          )
        }
      >
        {isAutoColorFilter ? (
          <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-4 text-[0.875rem] leading-[1.7] text-blue-900">
            <p className="font-semibold">옵션은 자동으로 합성됩니다.</p>
            <p className="mt-1 text-[0.875rem] text-blue-800">
              <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[0.75rem]">
                color
              </code>{' '}
              키 필터는 등록된 제품의 <strong>색상 섹션</strong> 값에서 자동으로 옵션을 만듭니다.
              여기서 옵션을 따로 추가할 필요가 없어요.
            </p>
            <p className="mt-2 text-[0.75rem] text-blue-700">
              💡 라벨(예: <strong>색상</strong>)·정렬·노출 여부만 기본 설정에서 조정하세요.
            </p>
          </div>
        ) : options.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-[0.875rem] text-neutral-400">
            아직 옵션이 없어요. 우측 <strong>+ 옵션 추가</strong> 를 눌러 추가하세요.
          </p>
        ) : (
          <>
            <p className="mb-2 text-[0.75rem] text-neutral-500">
              💡 영문 값을 비워두면 라벨에서 자동 생성됩니다.
            </p>
            <ul className="space-y-2">
              {options.map((o, i) => (
                <li
                  key={i}
                  className="grid grid-cols-1 items-end gap-2 rounded-lg border border-neutral-200 bg-white p-3 md:grid-cols-[1fr_1fr_auto]"
                >
                  <label className="flex flex-col">
                    <span className="mb-1.5 flex items-baseline gap-1 text-[0.75rem] font-semibold text-neutral-700">
                      <span className="text-red-600">*</span>라벨 (화면)
                    </span>
                    <input
                      type="text"
                      name="option_label"
                      required
                      value={o.label}
                      onChange={(e) => updateOption(i, { label: e.target.value })}
                      placeholder="ex.공원용"
                      className={inputCls}
                    />
                  </label>
                  <label className="flex flex-col">
                    <span className="mb-1.5 text-[0.75rem] font-semibold text-neutral-700">
                      값 (영문, 선택)
                    </span>
                    <input
                      type="text"
                      name="option_value"
                      value={o.value}
                      onChange={(e) => updateOption(i, { value: e.target.value })}
                      placeholder="ex.park"
                      className={`${inputCls} font-mono`}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    className="h-[42px] shrink-0 rounded border border-red-300 px-3 text-[0.75rem] text-red-700 hover:bg-red-50"
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </Section>

      <div className="flex justify-end gap-2 border-t border-neutral-200 pt-6">
        <Link
          href="/mng/filters"
          className="rounded-full border border-neutral-300 px-5 py-2.5 text-[0.875rem] font-medium text-neutral-700 hover:bg-neutral-100"
        >
          취소
        </Link>
        <button
          type="submit"
          className="rounded-full bg-black px-6 py-2.5 text-[0.875rem] font-bold text-white hover:bg-neutral-800"
        >
          저장
        </button>
      </div>
    </form>
  )
}

function Section({
  title,
  right,
  children,
}: {
  title: string
  right?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section>
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-[1rem] font-bold">{title}</h2>
        {right}
      </header>
      {children}
    </section>
  )
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex-1">
      <label className="mb-1.5 flex items-baseline gap-1 text-[0.75rem] font-semibold text-neutral-700">
        {required && <span className="text-red-600">*</span>}
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-[0.75rem] text-neutral-500">{hint}</p>}
    </div>
  )
}
