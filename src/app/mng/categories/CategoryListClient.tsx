'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import {
  deleteCategory,
  toggleCategoryActive,
  reorderCategories,
} from '../actions'
import type { Category } from '@/lib/types'

type Props = {
  tops: Category[]
  childrenByParent: Record<number, Category[]>
  orphans: Category[]
  imageBaseUrl: string // process.env.NEXT_PUBLIC_SUPABASE_URL/storage/.../categories/
}

export default function CategoryListClient({
  tops: topsProp,
  childrenByParent: childrenProp,
  orphans,
  imageBaseUrl,
}: Props) {
  // 서버에서 새로 받아온 데이터로 동기화 (드래그 후 revalidate 결과)
  const [tops, setTops] = useState(topsProp)
  const [childrenMap, setChildrenMap] = useState(childrenProp)

  useEffect(() => setTops(topsProp), [topsProp])
  useEffect(() => setChildrenMap(childrenProp), [childrenProp])

  const publicUrl = (path: string) => `${imageBaseUrl}${path}`

  return (
    <>
      {tops.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-[0.875rem] text-neutral-500">
          아직 카테고리가 없어요.{' '}
          <Link href="/mng/categories/new" className="text-blue-600 hover:underline">
            첫 카테고리를 만들어보세요
          </Link>
          .
        </p>
      ) : (
        <DraggableTops tops={tops} setTops={setTops}>
          {(top) => {
            const kids = childrenMap[top.id] ?? []
            return (
              <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                <ParentHeader category={top} />
                {kids.length === 0 ? (
                  <p className="px-5 py-6 text-center text-[0.875rem] text-neutral-400">
                    하위 카테고리 없음
                  </p>
                ) : (
                  <DraggableChildren
                    parentId={top.id}
                    items={kids}
                    setItems={(next) =>
                      setChildrenMap((m) => ({ ...m, [top.id]: next }))
                    }
                    publicUrl={publicUrl}
                  />
                )}
              </section>
            )
          }}
        </DraggableTops>
      )}

      {orphans.length > 0 && (
        <section className="overflow-hidden rounded-xl border border-yellow-300 bg-yellow-50">
          <div className="border-b border-yellow-200 bg-yellow-100 px-5 py-3">
            <h2 className="text-[0.875rem] font-semibold text-yellow-900">
              부모가 삭제된 카테고리 ({orphans.length})
            </h2>
          </div>
          <ul className="divide-y divide-yellow-100">
            {orphans.map((c) => (
              <li key={c.id} className="flex items-center justify-between px-5 py-3">
                <span className="text-[0.875rem]">{c.name}</span>
                <RowActions category={c} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}

// ---------- 상위 카테고리 드래그 ----------

function DraggableTops({
  tops,
  setTops,
  children,
}: {
  tops: Category[]
  setTops: (next: Category[]) => void
  children: (top: Category) => React.ReactNode
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const [dragOverId, setDragOverId] = useState<number | null>(null)

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggingId(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, id: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (id !== dragOverId) setDragOverId(id)
  }

  const handleDrop = (e: React.DragEvent, targetId: number) => {
    e.preventDefault()
    if (draggingId === null || draggingId === targetId) {
      reset()
      return
    }
    const next = reorder(tops, draggingId, targetId)
    setTops(next)
    startTransition(async () => {
      await reorderCategories(next.map((t) => t.id))
      router.refresh()
    })
    reset()
  }

  const reset = () => {
    setDraggingId(null)
    setDragOverId(null)
  }

  return (
    <div className="space-y-6">
      {tops.map((top) => {
        const isDragging = draggingId === top.id
        const isOver = dragOverId === top.id && draggingId !== top.id
        return (
          <div
            key={top.id}
            draggable
            onDragStart={(e) => handleDragStart(e, top.id)}
            onDragOver={(e) => handleDragOver(e, top.id)}
            onDragLeave={() => setDragOverId((cur) => (cur === top.id ? null : cur))}
            onDrop={(e) => handleDrop(e, top.id)}
            onDragEnd={reset}
            className={`transition ${isDragging ? 'opacity-40' : ''} ${
              isOver ? 'ring-2 ring-blue-400' : ''
            }`}
          >
            {children(top)}
          </div>
        )
      })}
    </div>
  )
}

// ---------- 하위 카테고리 드래그 ----------

function DraggableChildren({
  items,
  setItems,
  publicUrl,
}: {
  parentId: number
  items: Category[]
  setItems: (next: Category[]) => void
  publicUrl: (path: string) => string
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const [dragOverId, setDragOverId] = useState<number | null>(null)

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggingId(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, id: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (id !== dragOverId) setDragOverId(id)
  }

  const handleDrop = (e: React.DragEvent, targetId: number) => {
    e.preventDefault()
    if (draggingId === null || draggingId === targetId) {
      reset()
      return
    }
    const next = reorder(items, draggingId, targetId)
    setItems(next)
    startTransition(async () => {
      await reorderCategories(next.map((c) => c.id))
      router.refresh()
    })
    reset()
  }

  const reset = () => {
    setDraggingId(null)
    setDragOverId(null)
  }

  return (
    <ul className="divide-y divide-neutral-100">
      {items.map((c) => {
        const isDragging = draggingId === c.id
        const isOver = dragOverId === c.id && draggingId !== c.id
        return (
          <li
            key={c.id}
            draggable
            onDragStart={(e) => handleDragStart(e, c.id)}
            onDragOver={(e) => handleDragOver(e, c.id)}
            onDragLeave={() =>
              setDragOverId((cur) => (cur === c.id ? null : cur))
            }
            onDrop={(e) => handleDrop(e, c.id)}
            onDragEnd={reset}
            className={`flex items-center gap-4 px-5 py-3 transition hover:bg-neutral-50 ${
              isDragging ? 'opacity-40' : ''
            } ${isOver ? 'bg-blue-50' : ''}`}
          >
            <DragHandle />
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-neutral-100">
              {c.image_path ? (
                <Image
                  src={publicUrl(c.image_path)}
                  alt={c.name}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[0.75rem] text-neutral-400">
                  {c.display_type}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block h-1.5 w-1.5 rounded-full ${
                    c.is_active ? 'bg-green-500' : 'bg-neutral-300'
                  }`}
                />
                <p className="truncate text-[0.875rem] font-medium">{c.name}</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[0.75rem] ${
                    c.display_type === 'tile'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {c.display_type}
                </span>
              </div>
              <p className="truncate text-[0.75rem] text-neutral-500">
                sort {c.sort_order} · {c.href || '(href 없음)'}
              </p>
            </div>
            <RowActions category={c} />
          </li>
        )
      })}
    </ul>
  )
}

// ---------- 공통 부품 ----------

function ParentHeader({ category }: { category: Category }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-neutral-200 bg-neutral-50 px-5 py-3">
      <div className="flex items-center gap-3">
        <DragHandle />
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            category.is_active ? 'bg-green-500' : 'bg-neutral-300'
          }`}
        />
        <h2 className="text-[1rem] font-bold">{category.name}</h2>
        <span className="text-[0.75rem] text-neutral-500">
          sort {category.sort_order}
        </span>
      </div>
      <RowActions category={category} />
    </div>
  )
}

function RowActions({ category }: { category: Category }) {
  const handleDelete = deleteCategory.bind(null, category.id)
  const handleToggle = toggleCategoryActive.bind(null, category.id, category.is_active)

  return (
    <div className="flex shrink-0 items-center gap-1">
      <form action={handleToggle}>
        <button
          type="submit"
          className="rounded border border-neutral-300 px-2 py-1 text-[0.75rem] hover:bg-neutral-100"
        >
          {category.is_active ? '비활성화' : '활성화'}
        </button>
      </form>
      <Link
        href={`/mng/categories/${category.id}/edit`}
        className="rounded border border-neutral-300 px-2 py-1 text-[0.75rem] hover:bg-neutral-100"
      >
        수정
      </Link>
      <form action={handleDelete}>
        <button
          type="submit"
          className="rounded border border-red-300 px-2 py-1 text-[0.75rem] text-red-700 hover:bg-red-50"
        >
          삭제
        </button>
      </form>
    </div>
  )
}

function DragHandle() {
  return (
    <span
      className="cursor-grab text-neutral-300 hover:text-neutral-500 active:cursor-grabbing"
      title="드래그해서 순서 변경"
      aria-hidden
    >
      <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor">
        <circle cx="3" cy="3" r="1.2" />
        <circle cx="9" cy="3" r="1.2" />
        <circle cx="3" cy="7" r="1.2" />
        <circle cx="9" cy="7" r="1.2" />
        <circle cx="3" cy="11" r="1.2" />
        <circle cx="9" cy="11" r="1.2" />
      </svg>
    </span>
  )
}

// ---------- helpers ----------

function reorder<T extends { id: number }>(
  list: T[],
  draggedId: number,
  targetId: number
): T[] {
  const draggedIdx = list.findIndex((x) => x.id === draggedId)
  const targetIdx = list.findIndex((x) => x.id === targetId)
  if (draggedIdx < 0 || targetIdx < 0) return list
  const next = list.slice()
  const [moved] = next.splice(draggedIdx, 1)
  next.splice(targetIdx, 0, moved)
  return next
}
