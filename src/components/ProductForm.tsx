'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import RichTextEditor from '@/components/RichTextEditor'
import OptimizedImageInput from '@/components/OptimizedImageInput'
import LinkedCasesField, { type CaseOption } from '@/components/LinkedCasesField'
import ColorsField from '@/components/ColorsField'
import ComponentPickerModal, {
  type PickedComponent,
} from '@/components/mng/ComponentPickerModal'
import Select from '@/components/ui/Select'
import {
  type Product,
  type ProductComponent,
  type ProductFilter,
  type Tag,
} from '@/lib/types'
import type { LinkableProductOption } from '@/lib/products'

const TAG_BADGE_CLS: Record<string, string> = {
  blue: 'bg-blue-600 text-white',
  red: 'bg-red-600 text-white',
  amber: 'bg-amber-500 text-white',
  neutral: 'bg-neutral-900 text-white',
  green: 'bg-emerald-600 text-white',
  purple: 'bg-purple-600 text-white',
}

const TAG_TONE_CHECKED: Record<string, string> = {
  blue: 'border-blue-300 bg-blue-50/60',
  red: 'border-red-300 bg-red-50/60',
  amber: 'border-amber-300 bg-amber-50/60',
  neutral: 'border-neutral-400 bg-neutral-100',
  green: 'border-emerald-300 bg-emerald-50/60',
  purple: 'border-purple-300 bg-purple-50/60',
}

type Props = {
  action: (formData: FormData) => Promise<void>
  categories: { id: number; name: string }[]
  /** 다른 제품으로 연결될 수 있는 제품 목록 (구성품 검색 모달 + 상세 페이지 이동용) */
  linkableProducts: LinkableProductOption[]
  initial?: Partial<Product>
  errorMessage?: string
  submitLabel: string
  cancelHref: string
  imageUrl?: string | null
  additional?: { path: string; url: string }[]
  specSheetUrl?: string | null
  specSheetName?: string | null
  colorChartUrl?: string | null
  colorChartName?: string | null
  /** 시공사례 멀티셀렉트 — 수정 모드에서만 의미있음 */
  productId?: number
  cases?: CaseOption[]
  initialSelectedCaseIds?: number[]
  /** 전체 필터 정의 — 선택된 카테고리에 맞춰 노출 */
  allFilters?: ProductFilter[]
  /** 제품 scope 의 활성 태그 목록 — DB driven (/mng/tags 에서 관리) */
  productTags: Pick<Tag, 'value' | 'label' | 'tone'>[]
}

export default function ProductForm({
  action,
  categories,
  linkableProducts,
  initial,
  errorMessage,
  submitLabel,
  cancelHref,
  imageUrl,
  additional,
  specSheetUrl,
  specSheetName,
  colorChartUrl,
  colorChartName,
  productId,
  cases,
  initialSelectedCaseIds,
  allFilters,
  productTags,
}: Props) {
  const v = {
    name: initial?.name ?? '',
    model_name: initial?.model_name ?? '',
    install_type: initial?.install_type ?? '',
    size_text: initial?.size_text ?? '',
    size_w: initial?.size_w ?? null,
    size_d: initial?.size_d ?? null,
    size_h: initial?.size_h ?? null,
    material: initial?.material ?? '',
    extras_text: initial?.extras_text ?? '',
    description: initial?.description ?? '',
    category_id: initial?.category_id ?? '',
    sort_order: initial?.sort_order ?? 0,
    is_active: initial?.is_active ?? true,
  }

  // ── 사이즈 (W × D × H, 단위 mm) — 넓이/부피 자동 계산용 ──
  const [sizeW, setSizeW] = useState<string>(
    v.size_w != null ? String(v.size_w) : ''
  )
  const [sizeD, setSizeD] = useState<string>(
    v.size_d != null ? String(v.size_d) : ''
  )
  const [sizeH, setSizeH] = useState<string>(
    v.size_h != null ? String(v.size_h) : ''
  )
  const numW = Number(sizeW) || 0
  const numD = Number(sizeD) || 0
  const numH = Number(sizeH) || 0

  // ── 구성품 (구성품 검색 모달 기반) ──
  const [components, setComponents] = useState<ProductComponent[]>(
    initial?.components && Array.isArray(initial.components)
      ? initial.components
      : []
  )
  const [pickerOpen, setPickerOpen] = useState(false)

  /** 카테고리 그룹/검색을 위한 카테고리 리스트 (linkableProducts 에서 추출) */
  const linkableCategories = useMemo(() => {
    const map = new Map<number, string>()
    for (const p of linkableProducts) {
      if (p.categoryId != null && p.categoryName) {
        map.set(p.categoryId, p.categoryName)
      }
    }
    return Array.from(map, ([id, name]) => ({ id, name }))
  }, [linkableProducts])

  /** id → 구성품 정보 lookup (선택된 구성품의 썸네일/카테고리/모델 표시용) */
  const linkableById = useMemo(() => {
    const m = new Map<number, LinkableProductOption>()
    for (const p of linkableProducts) m.set(p.id, p)
    return m
  }, [linkableProducts])

  const removeComponent = (i: number) =>
    setComponents((prev) => prev.filter((_, idx) => idx !== i))

  const updateComponentQuantity = (i: number, raw: string) => {
    const n = Number(raw)
    const next: number | null =
      Number.isFinite(n) && n > 0 ? Math.floor(n) : null
    setComponents((prev) =>
      prev.map((c, idx) => (idx === i ? { ...c, quantity: next } : c))
    )
  }

  const handlePicked = (picks: PickedComponent[]) => {
    setComponents((prev) => {
      const existingIds = new Set(
        prev.map((c) => c.target_id).filter((v): v is number => v != null)
      )
      const additions = picks
        .filter((p) => !existingIds.has(p.id))
        .map<ProductComponent>((p) => ({ name: p.name, target_id: p.id, quantity: 1 }))
      return [...prev, ...additions]
    })
  }

  const usedComponentIds = new Set(
    components.map((c) => c.target_id).filter((v): v is number => v != null)
  )

  // ── 태그 선택 ──
  const [selectedTags, setSelectedTags] = useState<string[]>(initial?.tags ?? [])
  const toggleTag = (tag: string) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )

  // ── 카테고리 (controlled) — 필터 섹션이 카테고리 변경에 반응해야 해서 controlled 처리 ──
  const [categoryId, setCategoryId] = useState<string>(
    v.category_id != null ? String(v.category_id) : ''
  )

  // ── 카테고리별 필터값 (filter_values) ──
  const [filterValues, setFilterValues] = useState<Record<string, string[]>>(
    () => {
      const fv = (initial?.filter_values ?? {}) as Record<string, unknown>
      const out: Record<string, string[]> = {}
      for (const [k, raw] of Object.entries(fv)) {
        if (Array.isArray(raw)) {
          out[k] = raw.map((x) => String(x)).filter(Boolean)
        }
      }
      return out
    }
  )
  const toggleFilterValue = (key: string, value: string) =>
    setFilterValues((prev) => {
      const cur = prev[key] ?? []
      const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value]
      return { ...prev, [key]: next }
    })

  // 현재 카테고리에 해당하는 필터들 (글로벌 + 선택 카테고리)
  // 단, 'color' 키는 색상 섹션에서 자동 동기화되므로 수동 입력 영역에서 제외.
  const relevantFilters = useMemo(() => {
    const list = allFilters ?? []
    const catNum = categoryId ? Number(categoryId) : null
    return list
      .filter((f) => f.category_id === null || f.category_id === catNum)
      .filter((f) => f.key !== 'color')
      .sort(
        (a, b) =>
          a.sort_order - b.sort_order ||
          (a.category_id ?? -1) - (b.category_id ?? -1) ||
          a.id - b.id
      )
  }, [allFilters, categoryId])

  const hasColorAutoFilter = (allFilters ?? []).some((f) => f.key === 'color')

  // ── 추가 이미지 / 파일 제거 토글 ──
  const initialAdditional = additional ?? []
  const [removedPaths, setRemovedPaths] = useState<string[]>([])
  const toggleRemoveAdditional = (path: string, removed: boolean) => {
    setRemovedPaths((prev) =>
      removed ? [...prev, path] : prev.filter((p) => p !== path)
    )
  }

  return (
    <form action={action} className="flex flex-col gap-6">
      {errorMessage && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
      )}

      {/* 기본 정보 */}
      <section className="rounded-lg border border-neutral-200 bg-white p-5">
        <h2 className="mb-4 text-[0.875rem] font-bold text-neutral-900">기본 정보</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col text-sm">
            <span className="font-medium">
              제품명 <span className="text-rose-500">*</span>
            </span>
            <input
              name="name"
              required
              defaultValue={v.name}
              placeholder="예: 세족벤치 3인용"
              className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
            />
          </label>

          <label className="flex flex-col text-sm">
            <span className="font-medium">모델명</span>
            <input
              name="model_name"
              defaultValue={v.model_name ?? ''}
              placeholder="예: AW-0000"
              className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
            />
          </label>

          <div className="flex flex-col text-sm md:col-span-2">
            <span className="font-medium">카테고리</span>
            <div className="mt-1">
              <Select
                name="category_id"
                value={categoryId}
                onChange={setCategoryId}
                placeholder="(미분류)"
                options={[
                  { value: '', label: '(미분류)' },
                  ...categories.map((c) => ({
                    value: String(c.id),
                    label: c.name,
                  })),
                ]}
              />
            </div>
            <span className="mt-1 text-[0.75rem] text-neutral-500">
              <strong>&ldquo;제품안내&rdquo;</strong> 메뉴의 하위 카테고리.{' '}
              <Link href="/mng/categories" className="text-blue-600 hover:underline">
                카테고리 관리
              </Link>
            </span>
          </div>
        </div>
      </section>

      {/* 태그 — 메인 노출/배지 제어 */}
      <section className="rounded-lg border border-neutral-200 bg-white p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-[0.875rem] font-bold text-neutral-900">태그</h2>
          <Link
            href="/mng/tags?scope=product"
            className="text-[0.75rem] text-blue-600 hover:underline"
          >
            태그 관리
          </Link>
        </div>
        <p className="mt-1 text-[0.75rem] text-neutral-500">
          여러 개 선택 가능. <strong>NEW</strong>는 메인 &ldquo;New Product&rdquo;,{' '}
          <strong>BEST</strong>는 &ldquo;Best Seller&rdquo; 섹션에 자동 노출됩니다.
        </p>

        {productTags.length === 0 ? (
          <p className="mt-4 rounded border border-dashed border-neutral-300 bg-neutral-50 px-3 py-3 text-[0.75rem] text-neutral-500">
            등록된 제품 태그가 없습니다.{' '}
            <Link href="/mng/tags?scope=product" className="text-blue-600 hover:underline">
              태그 관리
            </Link>{' '}
            에서 추가해주세요.
          </p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            {productTags.map((t) => {
              const checked = selectedTags.includes(t.value)
              const toneCls = TAG_TONE_CHECKED[t.tone] ?? TAG_TONE_CHECKED.neutral
              return (
                <label
                  key={t.value}
                  className={`group flex cursor-pointer items-center gap-2 px-3 py-1.5 transition ${
                    checked
                      ? toneCls
                      : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    name="tags"
                    value={t.value}
                    checked={checked}
                    onChange={() => toggleTag(t.value)}
                    className="h-3.5 w-3.5 cursor-pointer accent-blue-600"
                  />
                  <span
                    className={`inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[0.75rem] font-bold tracking-wider ${
                      TAG_BADGE_CLS[t.tone] ?? TAG_BADGE_CLS.neutral
                    }`}
                  >
                    {t.label}
                  </span>
                </label>
              )
            })}
          </div>
        )}

        {/* 폼 제출 마커 — actions 가 태그 미체크(전부 해제) 와 폼에 섹션 자체가 없는 경우를 구분 */}
        <input type="hidden" name="tags_present" value="1" />
      </section>

      {/* 카테고리 필터값 — /products 페이지의 필터에 노출 */}
      <section className="rounded-lg border border-neutral-200 bg-white p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-[0.875rem] font-bold text-neutral-900">카테고리 필터</h2>
          <Link
            href="/mng/filters"
            className="text-[0.75rem] text-blue-600 hover:underline"
          >
            필터 관리
          </Link>
        </div>
        <p className="mt-1 text-[0.75rem] text-neutral-500">
          선택한 카테고리에 등록된 필터에 해당하는 옵션을 체크하세요. 체크한 옵션이 /products
          상단 필터에서 이 제품을 노출하는 기준이 됩니다.
        </p>

        {hasColorAutoFilter && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2 text-[0.75rem] text-blue-800 ring-1 ring-blue-100">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="mt-0.5 shrink-0">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <span>
              <strong>색상 필터</strong>는 아래 <strong>색상</strong> 섹션에서 추가한 색상을 기준으로
              자동 동기화됩니다. 여기서 따로 체크하지 않아도 돼요.
            </span>
          </div>
        )}

        {relevantFilters.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-neutral-300 p-4 text-center text-[0.75rem] text-neutral-400">
            {categoryId
              ? '이 카테고리에 등록된 필터가 없어요.'
              : '카테고리를 선택하면 해당 카테고리의 필터가 노출됩니다. (글로벌 필터만 노출 중)'}
          </p>
        ) : (
          <div className="mt-4 space-y-5">
            {relevantFilters.map((f) => {
              const selected = filterValues[f.key] ?? []
              return (
                <div key={f.id}>
                  <div className="mb-2 flex items-baseline gap-2">
                    <p className="text-[0.875rem] font-semibold text-neutral-800">
                      {f.label}
                    </p>
                    <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 font-mono text-[0.75rem] text-neutral-500">
                      {f.key}
                    </span>
                    {f.category_id === null && (
                      <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[0.75rem] font-medium text-blue-700">
                        글로벌
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {f.options.map((o) => {
                      const checked = selected.includes(o.value)
                      return (
                        <label
                          key={o.value}
                          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-[0.75rem] transition ${
                            checked
                              ? 'border-blue-500 bg-blue-50 text-blue-900'
                              : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400'
                          }`}
                        >
                          <input
                            type="checkbox"
                            name={`filter[${f.key}]`}
                            value={o.value}
                            checked={checked}
                            onChange={() => toggleFilterValue(f.key, o.value)}
                            className="h-3.5 w-3.5 cursor-pointer accent-blue-600"
                          />
                          {o.label}
                        </label>
                      )
                    })}
                  </div>
                  <input type="hidden" name="filter_keys" value={f.key} />
                </div>
              )
            })}
          </div>
        )}

        <input type="hidden" name="filters_present" value="1" />
      </section>

      {/* 사양 */}
      <section className="rounded-lg border border-neutral-200 bg-white p-5">
        <h2 className="mb-4 text-[0.875rem] font-bold text-neutral-900">제품 사양</h2>
        <p className="mb-4 text-[0.75rem] text-neutral-500">
          여러 줄 입력 가능. <span className="text-rose-500">*</span>로 시작하는 줄은 빨간색
          참고 메시지로 표시됩니다.
        </p>

        <div className="grid grid-cols-1 gap-4">
          <label className="flex flex-col text-sm">
            <span className="font-medium">시공타입</span>
            <textarea
              name="install_type"
              rows={2}
              defaultValue={v.install_type ?? ''}
              placeholder={'매립형(발주처 직접 시공형)\n*매립형 제품은 발주처 직접시공형 제품입니다.'}
              className="mt-1 resize-y rounded border border-neutral-300 bg-white px-3 py-2 font-mono text-[0.875rem]"
            />
          </label>

          <div className="flex flex-col text-sm">
            <span className="font-medium">사이즈 (가로 × 깊이 × 높이, mm)</span>
            <p className="mt-0.5 text-[0.75rem] text-neutral-500">
              숫자만 입력하세요. 넓이·부피는 자동으로 계산되어 표시됩니다.
            </p>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              <DimensionInput
                label="W (가로)"
                name="size_w"
                value={sizeW}
                onChange={setSizeW}
                placeholder="1234"
              />
              <DimensionInput
                label="D (깊이)"
                name="size_d"
                value={sizeD}
                onChange={setSizeD}
                placeholder="123"
              />
              <DimensionInput
                label="H (높이)"
                name="size_h"
                value={sizeH}
                onChange={setSizeH}
                placeholder="123"
              />
            </div>

            <DerivedSizeReadout w={numW} d={numD} h={numH} />

            <label className="mt-4 flex flex-col text-sm">
              <span className="text-[0.75rem] font-semibold text-neutral-700">
                사이즈 보조 메모 (선택)
              </span>
              <span className="mt-0.5 text-[0.75rem] text-neutral-500">
                위 W/D/H 외에 음수대·차양 등 부속 치수가 있을 때만 사용. <span className="text-rose-500">*</span>
                로 시작하는 줄은 빨간 메시지로 노출됩니다.
              </span>
              <textarea
                name="size_text"
                rows={2}
                defaultValue={v.size_text ?? ''}
                placeholder={'음수대 W1234 x D123 x H123mm\n차양 W1234 x D123 x H123mm'}
                className="mt-1 resize-y rounded border border-neutral-300 bg-white px-3 py-2 font-mono text-[0.875rem]"
              />
            </label>
          </div>

          <label className="flex flex-col text-sm">
            <span className="font-medium">소재</span>
            <input
              name="material"
              defaultValue={v.material ?? ''}
              placeholder="예: 스텐레스(STS), 분체도장, 렉산(그린)"
              className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
            />
          </label>

          <label className="flex flex-col text-sm">
            <span className="font-medium">별도설비 (추가항목)</span>
            <textarea
              name="extras_text"
              rows={3}
              defaultValue={v.extras_text ?? ''}
              placeholder={'급퇴수밸브함 - 드레인(퇴수) 함 / 필수설치 권장\n원형트렌치(그레이팅)\n*급퇴수밸브함, 원형트렌치는 발주처 선매립 시공분입니다.'}
              className="mt-1 resize-y rounded border border-neutral-300 bg-white px-3 py-2 font-mono text-[0.875rem]"
            />
          </label>
        </div>
      </section>

      {/* 구성품 — 등록된 제품(구성품) 중에서만 검색·선택 */}
      <section className="rounded-lg border border-neutral-200 bg-white p-5">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="text-[0.875rem] font-bold text-neutral-900">구성품</h2>
          <span className="text-[0.75rem] text-neutral-500">{components.length}개</span>
        </div>
        <p className="mb-4 text-[0.75rem] text-neutral-500">
          등록된 제품(구성품) 중에서만 추가할 수 있어요. 상세 페이지에서 클릭하면 해당 제품
          페이지로 이동합니다. 구성품이 없다면 먼저{' '}
          <Link href="/mng/products/new" className="text-blue-600 hover:underline">
            제품 등록
          </Link>{' '}
          하세요.
        </p>

        {components.length > 0 ? (
          <ul className="space-y-2">
            {components.map((c, i) => {
              const linked = c.target_id != null ? linkableById.get(c.target_id) : null
              return (
                <li
                  key={`${c.target_id ?? 'free'}-${i}`}
                  className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-2.5"
                >
                  {linked?.imageUrl ? (
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-white ring-1 ring-neutral-200">
                      <Image
                        src={linked.imageUrl}
                        alt={c.name}
                        fill
                        unoptimized
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-white text-[0.75rem] text-neutral-400 ring-1 ring-neutral-200">
                      no img
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    {linked?.modelName && (
                      <p className="truncate font-mono text-[0.75rem] text-neutral-500">
                        {linked.modelName}
                      </p>
                    )}
                    <p className="truncate text-[0.875rem] font-semibold text-neutral-900">
                      {linked?.name ?? c.name}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1">
                      {linked?.categoryName && (
                        <span className="inline-block rounded-full bg-white px-1.5 py-0.5 text-[0.75rem] font-medium text-neutral-500 ring-1 ring-neutral-200">
                          {linked.categoryName}
                        </span>
                      )}
                      {!linked && c.target_id == null && (
                        <span className="inline-block rounded-full bg-amber-50 px-1.5 py-0.5 text-[0.75rem] font-medium text-amber-700 ring-1 ring-amber-200">
                          기존 자유입력 (이전 등록분)
                        </span>
                      )}
                      {c.target_id != null && !linked && (
                        <span className="inline-block rounded-full bg-rose-50 px-1.5 py-0.5 text-[0.75rem] font-medium text-rose-700 ring-1 ring-rose-200">
                          연결된 제품이 비활성/삭제됨
                        </span>
                      )}
                    </div>
                  </div>
                  <label className="flex shrink-0 items-center gap-1.5 text-[0.75rem] text-neutral-500">
                    <span className="font-medium">수량</span>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={c.quantity ?? 1}
                      onChange={(e) => updateComponentQuantity(i, e.target.value)}
                      aria-label={`${c.name} 수량`}
                      className="w-16 rounded border border-neutral-300 bg-white px-2 py-1.5 text-center text-[0.875rem] tabular-nums text-neutral-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeComponent(i)}
                    aria-label="제거"
                    className="flex h-9 w-9 items-center justify-center rounded border border-red-200 bg-white text-red-600 hover:bg-red-50"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
                    </svg>
                  </button>
                  {/* 서버 액션이 component_name[] / component_target_id[] / component_quantity[] 짝으로 받기 위한 hidden */}
                  <input type="hidden" name="component_name" value={c.name} />
                  <input
                    type="hidden"
                    name="component_target_id"
                    value={c.target_id ?? ''}
                  />
                  <input
                    type="hidden"
                    name="component_quantity"
                    value={c.quantity ?? 1}
                  />
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-[0.75rem] text-neutral-400">
            아직 추가된 구성품이 없어요. 아래 버튼을 눌러 구성품에서 검색·선택하세요.
          </p>
        )}

        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-dashed border-neutral-300 bg-white px-4 py-2 text-[0.875rem] font-medium text-neutral-700 hover:border-neutral-900 hover:text-neutral-900"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          구성품에서 검색·추가
        </button>

        <ComponentPickerModal
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onSubmit={handlePicked}
          options={linkableProducts}
          categories={linkableCategories}
          disabledIds={usedComponentIds}
        />
      </section>

      {/* 이미지 */}
      <section className="rounded-lg border border-neutral-200 bg-white p-5">
        <h2 className="mb-4 text-[0.875rem] font-bold text-neutral-900">이미지</h2>

        <div className="mb-5">
          <p className="text-[0.875rem] font-semibold text-neutral-700">
            대표 이미지 <span className="text-rose-500">*</span>
          </p>
          <p className="mt-0.5 text-[0.75rem] text-neutral-500">상세 페이지 메인에 노출됩니다.</p>
          {imageUrl && (
            <div className="my-3 inline-block overflow-hidden rounded border border-neutral-200">
              <Image
                src={imageUrl}
                alt=""
                width={160}
                height={160}
                className="h-32 w-32 object-cover"
                unoptimized
              />
            </div>
          )}
          <OptimizedImageInput
            name="main_image"
            maxWidth={1920}
            maxHeight={1920}
            quality={85}
            className="block w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm"
          />
          {imageUrl && (
            <p className="mt-1 text-[0.75rem] text-neutral-500">
              새 파일을 선택하면 위 이미지가 교체됩니다.
            </p>
          )}
        </div>

        <div>
          <p className="text-[0.875rem] font-semibold text-neutral-700">추가 이미지 (선택, 다중 업로드)</p>
          <p className="mt-0.5 text-[0.75rem] text-neutral-500">
            상세 페이지 썸네일에 노출됩니다.
          </p>
          {initialAdditional.length > 0 && (
            <div className="my-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {initialAdditional.map((img) => {
                const isRemoved = removedPaths.includes(img.path)
                return (
                  <label
                    key={img.path}
                    className="group relative block cursor-pointer overflow-hidden rounded border border-neutral-200"
                  >
                    <Image
                      src={img.url}
                      alt=""
                      width={120}
                      height={120}
                      className={`h-24 w-full object-cover transition ${
                        isRemoved ? 'opacity-30 grayscale' : ''
                      }`}
                      unoptimized
                    />
                    <input
                      type="checkbox"
                      name="remove_additional"
                      value={img.path}
                      checked={isRemoved}
                      onChange={(e) => toggleRemoveAdditional(img.path, e.target.checked)}
                      className="sr-only"
                    />
                    <span
                      className={`absolute inset-x-1 bottom-1 rounded px-1.5 py-1 text-center text-[0.75rem] font-semibold transition ${
                        isRemoved
                          ? 'bg-red-600 text-white'
                          : 'bg-white/95 text-neutral-700 group-hover:bg-red-50 group-hover:text-red-700'
                      }`}
                    >
                      {isRemoved ? '제거 예정 (취소)' : '제거'}
                    </span>
                  </label>
                )
              })}
            </div>
          )}
          <OptimizedImageInput
            name="additional_images"
            multiple
            maxWidth={1920}
            maxHeight={1920}
            quality={85}
            className="block w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm"
          />
        </div>
      </section>

      {/* 색상 옵션 — 상세 페이지의 색상 영역에 노출됨 */}
      <section className="rounded-lg border border-neutral-200 bg-white p-5">
        <h2 className="text-[0.875rem] font-bold text-neutral-900">색상</h2>
        <p className="mt-1 text-[0.75rem] text-neutral-500">
          제품에 등록할 색상을 추가하세요. 상세 페이지에서 색상명 + 스와치로 노출됩니다.
        </p>
        <div className="mt-4">
          <ColorsField initial={initial?.colors ?? []} />
        </div>
      </section>

      {/* 시공사례 연결 — 이미지 섹션 직후, 메인 저장 버튼에 통합 */}
      {cases && (
        <LinkedCasesField
          cases={cases}
          initialSelectedIds={initialSelectedCaseIds ?? []}
          productId={productId}
        />
      )}

      {/* 다운로드 자료 */}
      <section className="rounded-lg border border-neutral-200 bg-white p-5">
        <h2 className="mb-4 text-[0.875rem] font-bold text-neutral-900">다운로드 자료</h2>
        <p className="mb-4 text-[0.75rem] text-neutral-500">
          상세 페이지 우측 액션 버튼(시방서 다운, 색상표)에 연결됩니다.
        </p>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <p className="text-[0.875rem] font-semibold text-neutral-700">시방서 (PDF 등)</p>
            {specSheetUrl && (
              <p className="mt-1 text-[0.75rem]">
                <a
                  href={specSheetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {specSheetName ?? '현재 파일'}
                </a>
              </p>
            )}
            <input
              name="spec_sheet"
              type="file"
              className="mt-2 block w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm"
            />
            {specSheetUrl && (
              <label className="mt-2 flex items-center gap-2 text-[0.75rem] text-neutral-600">
                <input type="checkbox" name="remove_spec_sheet" />
                현재 파일 제거
              </label>
            )}
          </div>

          <div>
            <p className="text-[0.875rem] font-semibold text-neutral-700">색상표</p>
            {colorChartUrl && (
              <p className="mt-1 text-[0.75rem]">
                <a
                  href={colorChartUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {colorChartName ?? '현재 파일'}
                </a>
              </p>
            )}
            <input
              name="color_chart"
              type="file"
              className="mt-2 block w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm"
            />
            {colorChartUrl && (
              <label className="mt-2 flex items-center gap-2 text-[0.75rem] text-neutral-600">
                <input type="checkbox" name="remove_color_chart" />
                현재 파일 제거
              </label>
            )}
          </div>
        </div>
      </section>

      {/* 부가 설명 */}
      <section className="rounded-lg border border-neutral-200 bg-white p-5">
        <h2 className="mb-2 text-[0.875rem] font-bold text-neutral-900">상세 부가설명</h2>
        <p className="mb-3 text-[0.75rem] text-neutral-500">
          상세 페이지의 &ldquo;상세정보&rdquo; 탭 하단에 표시됩니다. 이미지와 표 등 자유롭게 작성할 수
          있어요.
        </p>
        <RichTextEditor
          name="description"
          defaultValue={v.description}
          placeholder="제품의 자세한 설명을 입력하세요"
        />
      </section>

      {/* 노출 옵션 */}
      <section className="rounded-lg border border-neutral-200 bg-white p-5">
        <h2 className="mb-4 text-[0.875rem] font-bold text-neutral-900">노출 옵션</h2>
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
          <label className="mt-1 flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_active" defaultChecked={v.is_active} />
            <span>활성화 (체크 해제 시 비공개)</span>
          </label>
        </div>
      </section>

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-full bg-black px-6 py-2.5 text-[0.875rem] font-medium text-white hover:bg-neutral-800"
        >
          {submitLabel}
        </button>
        <Link
          href={cancelHref}
          className="rounded-full border border-neutral-300 px-6 py-2.5 text-[0.875rem] hover:bg-neutral-100"
        >
          취소
        </Link>
      </div>
    </form>
  )
}

function DimensionInput({
  label,
  name,
  value,
  onChange,
  placeholder,
}: {
  label: string
  name: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <label className="flex flex-col">
      <span className="text-[0.75rem] font-semibold text-neutral-600">{label}</span>
      <div className="relative mt-1">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          step="any"
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded border border-neutral-300 bg-white px-3 py-2 pr-10 font-mono text-[0.875rem]"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.75rem] text-neutral-400">
          mm
        </span>
      </div>
    </label>
  )
}

function DerivedSizeReadout({
  w,
  d,
  h,
}: {
  w: number
  d: number
  h: number
}) {
  if (!w && !d && !h) return null

  const fmt = (n: number) => n.toLocaleString('ko-KR', { maximumFractionDigits: 4 })

  // 넓이 (W × D) — mm² → m² 환산
  const areaMm2 = w && d ? w * d : 0
  const areaM2 = areaMm2 / 1_000_000

  // 부피 (W × D × H) — mm³ → L (1L = 1,000,000 mm³) 환산
  const volMm3 = w && d && h ? w * d * h : 0
  const volL = volMm3 / 1_000_000

  return (
    <div className="mt-2 grid grid-cols-1 gap-2 rounded-lg bg-neutral-50 p-3 sm:grid-cols-3">
      <ReadoutCell
        label="치수 (W × D × H)"
        value={
          w || d || h
            ? `${w ? fmt(w) : '?'} × ${d ? fmt(d) : '?'} × ${h ? fmt(h) : '?'} mm`
            : '—'
        }
      />
      <ReadoutCell
        label="넓이 (W × D)"
        value={areaMm2 ? `${fmt(areaM2)} m² (${fmt(areaMm2)} mm²)` : '—'}
      />
      <ReadoutCell
        label="부피 (W × D × H)"
        value={volMm3 ? `${fmt(volL)} L (${fmt(volMm3)} mm³)` : '—'}
      />
    </div>
  )
}

function ReadoutCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-neutral-200 bg-white px-3 py-2">
      <p className="text-[0.75rem] font-semibold uppercase tracking-wider text-neutral-400">
        {label}
      </p>
      <p className="mt-0.5 font-mono text-[0.875rem] text-neutral-800">{value}</p>
    </div>
  )
}
