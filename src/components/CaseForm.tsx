'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import {
  CASE_ADDITIONAL_MAX,
  type GalleryItem,
  type ProductOption,
} from '@/lib/types'

type Props = {
  action: (formData: FormData) => Promise<void>
  categories: { id: number; name: string }[]
  products: ProductOption[]
  initial?: Partial<GalleryItem>
  errorMessage?: string
  submitLabel: string
  cancelHref: string
  /** 수정 모드일 때 메인 이미지 URL */
  imageUrl?: string | null
  /** 수정 모드일 때 추가 이미지들 [{path, url}] */
  additional?: { path: string; url: string }[]
}

export default function CaseForm({
  action,
  categories,
  products,
  initial,
  errorMessage,
  submitLabel,
  cancelHref,
  imageUrl,
  additional,
}: Props) {
  const v = {
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    model_name: initial?.model_name ?? '',
    site_name: initial?.site_name ?? '',
    client_name: initial?.client_name ?? '',
    category_id: initial?.category_id ?? '',
  }

  // ─── 제품 선택 (multi-select + 검색) ───
  const [selectedProductHrefs, setSelectedProductHrefs] = useState<string[]>(
    initial?.product_hrefs ?? []
  )
  const [productSearch, setProductSearch] = useState('')
  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        p.href.toLowerCase().includes(q) ||
        (p.group?.toLowerCase().includes(q) ?? false)
      )
    })
  }, [products, productSearch])

  // 그룹별로 묶어 보여주기
  const groupedFiltered = useMemo(() => {
    const map = new Map<string, ProductOption[]>()
    for (const p of filteredProducts) {
      const key = p.group ?? '(분류 없음)'
      const arr = map.get(key) ?? []
      arr.push(p)
      map.set(key, arr)
    }
    return Array.from(map.entries())
  }, [filteredProducts])

  const toggleProduct = (href: string) => {
    setSelectedProductHrefs((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
    )
  }

  const removeProduct = (href: string) => {
    setSelectedProductHrefs((prev) => prev.filter((h) => h !== href))
  }

  // 선택된 항목의 표시용 정보 (DB 에 저장된 href 가 더 이상 categories 에 없을 수도 있으므로 fallback)
  const productsByHref = useMemo(() => {
    const m = new Map<string, ProductOption>()
    for (const p of products) m.set(p.href, p)
    return m
  }, [products])

  const initialAdditional = additional ?? []
  const [removedPaths, setRemovedPaths] = useState<string[]>([])
  const [newFileCount, setNewFileCount] = useState(0)

  const keptCount = useMemo(
    () => initialAdditional.filter((img) => !removedPaths.includes(img.path)).length,
    [initialAdditional, removedPaths]
  )
  const totalAfterSubmit = keptCount + newFileCount
  const overLimit = totalAfterSubmit > CASE_ADDITIONAL_MAX

  const toggleRemove = (path: string, removed: boolean) => {
    setRemovedPaths((prev) =>
      removed ? [...prev, path] : prev.filter((p) => p !== path)
    )
  }

  const onAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) {
      setNewFileCount(0)
      return
    }
    const valid = Array.from(files).filter((f) => f.size > 0)
    setNewFileCount(valid.length)
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      {errorMessage && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
      )}

      <label className="flex flex-col text-sm">
        <span className="font-medium">제목 *</span>
        <input
          name="title"
          required
          defaultValue={v.title}
          placeholder="예: 강남구청 음수기 설치"
          className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      <label className="flex flex-col text-sm">
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
        <span className="mt-1 text-[0.75rem] text-neutral-500">
          <strong>&ldquo;제품안내&rdquo;</strong> 메뉴의 하위 카테고리가 자동으로 노출됩니다.{' '}
          <Link
            href="/mng/categories"
            className="text-blue-600 hover:underline"
          >
            카테고리 관리
          </Link>
          에서 추가/수정할 수 있어요.
        </span>
      </label>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <label className="flex flex-col text-sm">
          <span className="font-medium">모델명</span>
          <input
            name="model_name"
            defaultValue={v.model_name ?? ''}
            placeholder="예: AW-2000S"
            className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
          />
        </label>

        <label className="flex flex-col text-sm">
          <span className="font-medium">현장명</span>
          <input
            name="site_name"
            defaultValue={v.site_name ?? ''}
            placeholder="예: 강남구청 본청"
            className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
          />
        </label>

        <label className="flex flex-col text-sm">
          <span className="font-medium">발주처</span>
          <input
            name="client_name"
            defaultValue={v.client_name ?? ''}
            placeholder="예: 서울시 강남구청"
            className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
          />
        </label>
      </div>

      <label className="flex flex-col text-sm">
        <span className="font-medium">설명 (선택)</span>
        <textarea
          name="description"
          rows={3}
          defaultValue={v.description ?? ''}
          placeholder="시공 환경, 특이사항 등"
          className="mt-1 resize-y rounded border border-neutral-300 bg-white px-3 py-2"
        />
      </label>

      {/* 연결 제품 (multi-select + 검색) */}
      <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[0.875rem] font-semibold text-neutral-700">연결 제품 (선택)</p>
          <p className="text-[0.75rem] font-mono tabular-nums text-neutral-500">
            {selectedProductHrefs.length}개 선택됨
          </p>
        </div>
        <p className="mt-0.5 text-[0.75rem] text-neutral-500">
          상세 페이지 사이드바에 &quot;제품 보기&quot; 버튼으로 노출됩니다. 제품 마스터 데이터가
          준비되면 여기에 자동으로 노출돼요.
        </p>

        {/* 선택된 chip */}
        {selectedProductHrefs.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {selectedProductHrefs.map((href) => {
              const p = productsByHref.get(href)
              return (
                <span
                  key={href}
                  className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 py-1 pl-3 pr-1 text-[0.75rem] font-medium text-blue-700 ring-1 ring-blue-200"
                >
                  {p ? p.name : href}
                  <button
                    type="button"
                    onClick={() => removeProduct(href)}
                    aria-label={`${p?.name ?? href} 제거`}
                    className="flex h-5 w-5 items-center justify-center rounded-full text-blue-500 transition hover:bg-blue-100 hover:text-blue-900"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )
            })}
          </div>
        )}

        {/* 검색 input */}
        <div className="relative mt-3">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder="제품명·경로로 검색"
            className="w-full rounded border border-neutral-300 bg-white py-2 pl-9 pr-3 text-[0.875rem] focus:border-neutral-500 focus:outline-none"
          />
        </div>

        {/* 후보 리스트 */}
        <div className="mt-3 max-h-72 overflow-y-auto rounded border border-neutral-200 bg-white">
          {products.length === 0 ? (
            <div className="px-4 py-8 text-center text-[0.75rem] text-neutral-500">
              <p>아직 등록된 제품이 없습니다.</p>
              <p className="mt-1.5 text-neutral-400">
                제품 마스터 데이터가 등록되면 여기에 노출됩니다.
              </p>
            </div>
          ) : groupedFiltered.length === 0 ? (
            <p className="px-4 py-8 text-center text-[0.75rem] text-neutral-500">
              검색 결과가 없습니다.
            </p>
          ) : (
            groupedFiltered.map(([groupName, items]) => (
              <div key={groupName} className="border-b border-neutral-100 last:border-none">
                <p className="sticky top-0 z-10 bg-neutral-50 px-3 py-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-neutral-500">
                  {groupName}
                </p>
                <ul>
                  {items.map((p) => {
                    const checked = selectedProductHrefs.includes(p.href)
                    return (
                      <li key={p.href}>
                        <label
                          className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 text-[0.875rem] transition hover:bg-blue-50/50 ${
                            checked ? 'bg-blue-50/40' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleProduct(p.href)}
                            className="h-4 w-4 cursor-pointer accent-blue-600"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium text-neutral-900">
                              {p.name}
                            </span>
                            <span className="block truncate font-mono text-[0.75rem] text-neutral-500">
                              {p.href}
                            </span>
                          </span>
                        </label>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))
          )}
        </div>

        {/* 폼 제출용 hidden inputs */}
        {selectedProductHrefs.map((href) => (
          <input key={href} type="hidden" name="product_hrefs" value={href} />
        ))}
      </div>

      {/* 메인 이미지 */}
      <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-4">
        <p className="text-[0.875rem] font-semibold text-neutral-700">대표 이미지 *</p>
        <p className="mt-0.5 text-[0.75rem] text-neutral-500">
          시공사례 리스트와 상세 페이지 메인에 노출됩니다.
        </p>
        {imageUrl && (
          <div className="my-3 inline-block overflow-hidden rounded border border-neutral-200">
            <Image
              src={imageUrl}
              alt=""
              width={200}
              height={200}
              className="h-32 w-32 object-cover"
              unoptimized
            />
          </div>
        )}
        <input
          name="image"
          type="file"
          accept="image/*"
          className="block w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm"
        />
        {imageUrl && (
          <p className="mt-1 text-[0.75rem] text-neutral-500">
            새 파일을 선택하면 위 이미지가 교체됩니다.
          </p>
        )}
      </div>

      {/*
        추가 이미지 섹션은 일단 숨김 (정책상 1장만 사용).
        DB 의 기존 additional_images 데이터는 그대로 보존.
        다시 활성화하려면 false → true 로 변경.
      */}
      {false && (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[0.875rem] font-semibold text-neutral-700">
              추가 이미지 (선택)
            </p>
            <p
              className={`text-[0.75rem] font-mono tabular-nums ${
                overLimit ? 'font-semibold text-red-600' : 'text-neutral-500'
              }`}
            >
              {totalAfterSubmit} / {CASE_ADDITIONAL_MAX}
            </p>
          </div>
          <p className="mt-0.5 text-[0.75rem] text-neutral-500">
            상세 페이지 썸네일 갤러리에 노출됩니다. 한 번에 여러 장 업로드할 수 있어요. 최대{' '}
            {CASE_ADDITIONAL_MAX}장까지 가능합니다.
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
                      onChange={(e) => toggleRemove(img.path, e.target.checked)}
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

          <input
            name="additional_images"
            type="file"
            accept="image/*"
            multiple
            onChange={onAddFiles}
            className="block w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm"
          />

          {overLimit && (
            <p className="mt-2 rounded bg-red-50 px-2.5 py-1.5 text-[0.75rem] text-red-700">
              최대 {CASE_ADDITIONAL_MAX}장까지 가능합니다. 기존 이미지를 제거하거나 선택을 줄여주세요.
            </p>
          )}
        </div>
      )}

      <div className="mt-2 flex gap-2">
        <button
          type="submit"
          disabled={overLimit}
          className="rounded-full bg-black px-5 py-2 text-[0.875rem] font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
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
