'use client'

import Link from 'next/link'
import Image from 'next/image'
import SelectableTable from '@/components/mng/SelectableTable'
import {
  bulkDeleteProducts,
  bulkDuplicateProducts,
  bulkUpdateProductsActive,
  deleteProduct,
  duplicateProduct,
} from './actions'

export type ProductRow = {
  id: number
  name: string
  model_name: string | null
  category_id: number | null
  main_image_url: string
  is_active: boolean
}

type Props = {
  items: ProductRow[]
  categoryNameById: Record<number, string>
}

export default function ProductsListClient({ items, categoryNameById }: Props) {
  const ids = items.map((i) => i.id)

  return (
    <SelectableTable
      ids={ids}
      onBulkDelete={async (ids) => {
        await bulkDeleteProducts(ids)
      }}
      deleteConfirm="선택한 제품을 정말 삭제하시겠습니까? 연결된 이미지도 함께 삭제됩니다."
      extraBulkActions={[
        {
          label: '공개로 전환',
          tone: 'neutral',
          onClick: async (ids) => {
            await bulkUpdateProductsActive(ids, true)
          },
        },
        {
          label: '비공개로 전환',
          tone: 'neutral',
          onClick: async (ids) => {
            await bulkUpdateProductsActive(ids, false)
          },
        },
        {
          label: '선택 복제',
          tone: 'primary',
          onClick: async (ids) => {
            await bulkDuplicateProducts(ids)
          },
        },
      ]}
    >
      {({ checkboxFor, isSelected }) => (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item) => {
            const handleDelete = deleteProduct.bind(null, item.id)
            const handleDuplicate = duplicateProduct.bind(null, item.id)
            const cat = item.category_id
              ? categoryNameById[item.category_id]
              : null
            const checked = isSelected(item.id)
            return (
              <div
                key={item.id}
                className={`relative overflow-hidden rounded-lg border bg-white transition ${
                  item.is_active
                    ? 'border-neutral-200'
                    : 'border-dashed border-neutral-300 opacity-70'
                } ${checked ? 'ring-2 ring-blue-400' : ''}`}
              >
                {/* 좌상단 체크박스 */}
                <label className="absolute left-2 top-2 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-white/95 shadow ring-1 ring-neutral-200 backdrop-blur">
                  {checkboxFor(item.id)}
                </label>

                <div className="aspect-square">
                  <Image
                    src={item.main_image_url}
                    alt={item.name}
                    width={400}
                    height={400}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                </div>
                <div className="px-3 py-2">
                  {cat && (
                    <p className="mb-1 text-[0.75rem] font-semibold uppercase tracking-wide text-blue-700">
                      {cat}
                    </p>
                  )}
                  {item.model_name && (
                    <p className="truncate text-[0.75rem] font-bold text-neutral-900">
                      {item.model_name}
                    </p>
                  )}
                  <p className="truncate text-sm text-neutral-700">{item.name}</p>
                  {!item.is_active && (
                    <p className="mt-1 text-[0.75rem] font-semibold text-neutral-400">
                      비공개
                    </p>
                  )}
                  <div className="mt-2 grid grid-cols-3 gap-1.5">
                    <Link
                      href={`/mng/products/${item.id}/edit`}
                      className="rounded border border-neutral-300 px-2 py-1 text-center text-xs hover:bg-neutral-100"
                    >
                      수정
                    </Link>
                    <form action={handleDuplicate}>
                      <button
                        type="submit"
                        className="w-full rounded border border-blue-300 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50"
                      >
                        복제
                      </button>
                    </form>
                    <form action={handleDelete}>
                      <button
                        type="submit"
                        className="w-full rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                      >
                        삭제
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </SelectableTable>
  )
}
