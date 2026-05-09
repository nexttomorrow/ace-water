'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import RichTextEditor from '@/components/RichTextEditor'
import LinkedCasesField, { type CaseOption } from '@/components/LinkedCasesField'
import { PRODUCT_TAGS, type Product, type ProductComponent } from '@/lib/types'

const TAG_BADGE_CLS: Record<string, string> = {
  blue: 'bg-blue-600 text-white',
  red: 'bg-red-600 text-white',
  amber: 'bg-amber-500 text-white',
  neutral: 'bg-neutral-900 text-white',
}

const TAG_TONE_CHECKED: Record<string, string> = {
  blue: 'border-blue-300 bg-blue-50/60',
  red: 'border-red-300 bg-red-50/60',
  amber: 'border-amber-300 bg-amber-50/60',
  neutral: 'border-neutral-400 bg-neutral-100',
}

type Props = {
  action: (formData: FormData) => Promise<void>
  categories: { id: number; name: string }[]
  /** 다른 제품으로 연결될 수 있는 제품 목록 (구성품 클릭시 이동용) */
  linkableProducts: { id: number; name: string; model_name: string | null }[]
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
}: Props) {
  const v = {
    name: initial?.name ?? '',
    model_name: initial?.model_name ?? '',
    install_type: initial?.install_type ?? '',
    size_text: initial?.size_text ?? '',
    material: initial?.material ?? '',
    extras_text: initial?.extras_text ?? '',
    description: initial?.description ?? '',
    category_id: initial?.category_id ?? '',
    sort_order: initial?.sort_order ?? 0,
    is_active: initial?.is_active ?? true,
  }

  // ── 구성품 dynamic list ──
  const [components, setComponents] = useState<ProductComponent[]>(
    initial?.components && Array.isArray(initial.components)
      ? initial.components
      : []
  )
  const productNameById = useMemo(() => {
    const m = new Map<number, string>()
    for (const p of linkableProducts) {
      m.set(p.id, p.model_name ? `${p.model_name} ${p.name}` : p.name)
    }
    return m
  }, [linkableProducts])

  const addComponent = () =>
    setComponents((prev) => [...prev, { name: '', target_id: null }])
  const removeComponent = (i: number) =>
    setComponents((prev) => prev.filter((_, idx) => idx !== i))
  const updateComponent = (i: number, patch: Partial<ProductComponent>) =>
    setComponents((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)))

  // ── 태그 선택 ──
  const [selectedTags, setSelectedTags] = useState<string[]>(initial?.tags ?? [])
  const toggleTag = (tag: string) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )

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
        <h2 className="mb-4 text-[14px] font-bold text-neutral-900">기본 정보</h2>

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

          <label className="flex flex-col text-sm md:col-span-2">
            <span className="font-medium">카테고리</span>
            <select
              name="category_id"
              defaultValue={v.category_id ?? ''}
              className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
            >
              <option value="">(미분류)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <span className="mt-1 text-[11px] text-neutral-500">
              <strong>&ldquo;제품안내&rdquo;</strong> 메뉴의 하위 카테고리.{' '}
              <Link href="/admin/categories" className="text-blue-600 hover:underline">
                카테고리 관리
              </Link>
            </span>
          </label>
        </div>
      </section>

      {/* 태그 — 메인 노출/배지 제어 */}
      <section className="rounded-lg border border-neutral-200 bg-white p-5">
        <h2 className="text-[14px] font-bold text-neutral-900">태그</h2>
        <p className="mt-1 text-[12px] text-neutral-500">
          여러 개 선택 가능. <strong>NEW</strong>는 메인 &ldquo;New Product&rdquo;,{' '}
          <strong>BEST</strong>는 &ldquo;Best Seller&rdquo; 섹션에 자동 노출됩니다.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
          {PRODUCT_TAGS.map((t) => {
            const checked = selectedTags.includes(t.value)
            const toneCls = TAG_TONE_CHECKED[t.tone] ?? TAG_TONE_CHECKED.neutral
            return (
              <label
                key={t.value}
                className={`group flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
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
                  className="mt-0.5 h-4 w-4 cursor-pointer accent-blue-600"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span
                      className={`inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider ${
                        TAG_BADGE_CLS[t.tone] ?? TAG_BADGE_CLS.neutral
                      }`}
                    >
                      {t.label}
                    </span>
                    <span className="text-[13px] font-semibold text-neutral-900">
                      {t.short}
                    </span>
                  </span>
                  <span className="mt-1 block text-[11.5px] leading-[1.6] text-neutral-500">
                    {t.desc}
                  </span>
                </span>
              </label>
            )
          })}
        </div>

        {/* 폼 제출 마커 — actions 가 태그 미체크(전부 해제) 와 폼에 섹션 자체가 없는 경우를 구분 */}
        <input type="hidden" name="tags_present" value="1" />
      </section>

      {/* 사양 */}
      <section className="rounded-lg border border-neutral-200 bg-white p-5">
        <h2 className="mb-4 text-[14px] font-bold text-neutral-900">제품 사양</h2>
        <p className="mb-4 text-[12px] text-neutral-500">
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
              className="mt-1 resize-y rounded border border-neutral-300 bg-white px-3 py-2 font-mono text-[13px]"
            />
          </label>

          <label className="flex flex-col text-sm">
            <span className="font-medium">사이즈</span>
            <textarea
              name="size_text"
              rows={3}
              defaultValue={v.size_text ?? ''}
              placeholder={'W1234 x D123 x H123mm\n음수대 W1234 x D123 x H123mm\n차양 W1234 x D123 x H123mm'}
              className="mt-1 resize-y rounded border border-neutral-300 bg-white px-3 py-2 font-mono text-[13px]"
            />
          </label>

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
              className="mt-1 resize-y rounded border border-neutral-300 bg-white px-3 py-2 font-mono text-[13px]"
            />
          </label>
        </div>
      </section>

      {/* 구성품 (clickable tags) */}
      <section className="rounded-lg border border-neutral-200 bg-white p-5">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="text-[14px] font-bold text-neutral-900">구성품</h2>
          <span className="text-[12px] text-neutral-500">{components.length}개</span>
        </div>
        <p className="mb-3 text-[12px] text-neutral-500">
          상세 페이지에서 태그로 노출됩니다. 다른 제품과 연결하면 클릭 시 그 제품 페이지로 이동해요.
        </p>

        <div className="space-y-2">
          {components.map((c, i) => (
            <div
              key={i}
              className="grid grid-cols-12 items-center gap-2 rounded border border-neutral-200 bg-neutral-50 p-2"
            >
              <input
                name="component_name"
                value={c.name}
                onChange={(e) => updateComponent(i, { name: e.target.value })}
                placeholder="구성품 이름 (예: 세정용 수전 - 2구)"
                className="col-span-12 rounded border border-neutral-300 bg-white px-3 py-2 text-[13px] md:col-span-6"
              />
              <select
                name="component_target_id"
                value={c.target_id ?? ''}
                onChange={(e) =>
                  updateComponent(i, {
                    target_id: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="col-span-9 rounded border border-neutral-300 bg-white px-3 py-2 text-[13px] md:col-span-5"
              >
                <option value="">(연결 없음)</option>
                {linkableProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {productNameById.get(p.id)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeComponent(i)}
                aria-label="제거"
                className="col-span-3 flex h-9 items-center justify-center rounded border border-red-200 bg-white text-red-600 hover:bg-red-50 md:col-span-1"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addComponent}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-dashed border-neutral-300 bg-white px-4 py-2 text-[13px] font-medium text-neutral-700 hover:border-neutral-900 hover:text-neutral-900"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          구성품 추가
        </button>
      </section>

      {/* 이미지 */}
      <section className="rounded-lg border border-neutral-200 bg-white p-5">
        <h2 className="mb-4 text-[14px] font-bold text-neutral-900">이미지</h2>

        <div className="mb-5">
          <p className="text-[13px] font-semibold text-neutral-700">
            대표 이미지 <span className="text-rose-500">*</span>
          </p>
          <p className="mt-0.5 text-[11px] text-neutral-500">상세 페이지 메인에 노출됩니다.</p>
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
          <input
            name="main_image"
            type="file"
            accept="image/*"
            className="block w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm"
          />
          {imageUrl && (
            <p className="mt-1 text-[11px] text-neutral-500">
              새 파일을 선택하면 위 이미지가 교체됩니다.
            </p>
          )}
        </div>

        <div>
          <p className="text-[13px] font-semibold text-neutral-700">추가 이미지 (선택, 다중 업로드)</p>
          <p className="mt-0.5 text-[11px] text-neutral-500">
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
                      className={`absolute inset-x-1 bottom-1 rounded px-1.5 py-1 text-center text-[10px] font-semibold transition ${
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
          <input
            name="additional_images"
            type="file"
            accept="image/*"
            multiple
            className="block w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm"
          />
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
        <h2 className="mb-4 text-[14px] font-bold text-neutral-900">다운로드 자료</h2>
        <p className="mb-4 text-[12px] text-neutral-500">
          상세 페이지 우측 액션 버튼(시방서 다운, 색상표)에 연결됩니다.
        </p>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <p className="text-[13px] font-semibold text-neutral-700">시방서 (PDF 등)</p>
            {specSheetUrl && (
              <p className="mt-1 text-[12px]">
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
              <label className="mt-2 flex items-center gap-2 text-[12px] text-neutral-600">
                <input type="checkbox" name="remove_spec_sheet" />
                현재 파일 제거
              </label>
            )}
          </div>

          <div>
            <p className="text-[13px] font-semibold text-neutral-700">색상표</p>
            {colorChartUrl && (
              <p className="mt-1 text-[12px]">
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
              <label className="mt-2 flex items-center gap-2 text-[12px] text-neutral-600">
                <input type="checkbox" name="remove_color_chart" />
                현재 파일 제거
              </label>
            )}
          </div>
        </div>
      </section>

      {/* 부가 설명 */}
      <section className="rounded-lg border border-neutral-200 bg-white p-5">
        <h2 className="mb-2 text-[14px] font-bold text-neutral-900">상세 부가설명</h2>
        <p className="mb-3 text-[12px] text-neutral-500">
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
        <h2 className="mb-4 text-[14px] font-bold text-neutral-900">노출 옵션</h2>
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
          <label className="mt-1 flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_active" defaultChecked={v.is_active} />
            <span>활성화 (체크 해제 시 비공개)</span>
          </label>
        </div>
      </section>

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-full bg-black px-6 py-2.5 text-[13px] font-medium text-white hover:bg-neutral-800"
        >
          {submitLabel}
        </button>
        <Link
          href={cancelHref}
          className="rounded-full border border-neutral-300 px-6 py-2.5 text-[13px] hover:bg-neutral-100"
        >
          취소
        </Link>
      </div>
    </form>
  )
}
