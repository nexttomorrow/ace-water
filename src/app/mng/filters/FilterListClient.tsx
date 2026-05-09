'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { deleteFilter, toggleFilterVisible, reorderFilters } from './actions'
import type { ProductFilter } from '@/lib/types'

type Group = {
  key: number | null
  title: string
  items: ProductFilter[]
}

type Props = {
  groups: Group[]
}

export default function FilterListClient({ groups: groupsProp }: Props) {
  const [groups, setGroups] = useState(groupsProp)

  useEffect(() => setGroups(groupsProp), [groupsProp])

  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <section
          key={g.key === null ? 'null' : String(g.key)}
          className="overflow-hidden rounded-xl border border-neutral-200 bg-white"
        >
          <header className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-5 py-3">
            <h2 className="text-[1rem] font-bold">{g.title}</h2>
            <span className="text-[0.75rem] text-neutral-500">
              {g.items.length}개 필터
            </span>
          </header>

          {g.items.length === 0 ? (
            <p className="px-5 py-8 text-center text-[0.875rem] text-neutral-400">
              등록된 필터가 없어요.{' '}
              <Link href="/mng/filters/new" className="text-blue-600 hover:underline">
                필터 추가
              </Link>
            </p>
          ) : (
            <DraggableFilterRows
              items={g.items}
              setItems={(next) =>
                setGroups((cur) =>
                  cur.map((it) => (it.key === g.key ? { ...it, items: next } : it))
                )
              }
            />
          )}
        </section>
      ))}
    </div>
  )
}

function DraggableFilterRows({
  items,
  setItems,
}: {
  items: ProductFilter[]
  setItems: (next: ProductFilter[]) => void
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const [dragOverId, setDragOverId] = useState<number | null>(null)

  const reset = () => {
    setDraggingId(null)
    setDragOverId(null)
  }

  const handleDrop = (targetId: number) => {
    if (draggingId === null || draggingId === targetId) {
      reset()
      return
    }
    const next = reorder(items, draggingId, targetId)
    setItems(next)
    startTransition(async () => {
      await reorderFilters(next.map((c) => c.id))
      router.refresh()
    })
    reset()
  }

  return (
    <ul className="divide-y divide-neutral-100">
      {items.map((f) => {
        const isDragging = draggingId === f.id
        const isOver = dragOverId === f.id && draggingId !== f.id
        return (
          <li
            key={f.id}
            draggable
            onDragStart={(e) => {
              setDraggingId(f.id)
              e.dataTransfer.effectAllowed = 'move'
            }}
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = 'move'
              if (f.id !== dragOverId) setDragOverId(f.id)
            }}
            onDragLeave={() =>
              setDragOverId((cur) => (cur === f.id ? null : cur))
            }
            onDrop={(e) => {
              e.preventDefault()
              handleDrop(f.id)
            }}
            onDragEnd={reset}
            className={`flex items-center gap-4 px-5 py-3 transition hover:bg-neutral-50 ${
              isDragging ? 'opacity-40' : ''
            } ${isOver ? 'bg-blue-50' : ''}`}
          >
            <DragHandle />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-block h-1.5 w-1.5 rounded-full ${
                    f.is_visible ? 'bg-green-500' : 'bg-neutral-300'
                  }`}
                />
                <p className="truncate text-[0.875rem] font-semibold">{f.label}</p>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 font-mono text-[0.75rem] text-neutral-600">
                  {f.key}
                </span>
                <span className="text-[0.75rem] text-neutral-500">
                  옵션 {f.options.length}개 · sort {f.sort_order}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {f.options.slice(0, 8).map((o) => (
                  <span
                    key={o.value}
                    className="rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-[0.75rem] text-neutral-700"
                  >
                    {o.label}
                  </span>
                ))}
                {f.options.length > 8 && (
                  <span className="px-1 text-[0.75rem] text-neutral-400">
                    외 {f.options.length - 8}개
                  </span>
                )}
              </div>
            </div>
            <RowActions filter={f} />
          </li>
        )
      })}
    </ul>
  )
}

function RowActions({ filter }: { filter: ProductFilter }) {
  const handleDelete = deleteFilter.bind(null, filter.id)
  const handleToggle = toggleFilterVisible.bind(null, filter.id, filter.is_visible)
  return (
    <div className="flex shrink-0 items-center gap-1">
      <form action={handleToggle}>
        <button
          type="submit"
          className="rounded border border-neutral-300 px-2 py-1 text-[0.75rem] hover:bg-neutral-100"
        >
          {filter.is_visible ? '숨김' : '표시'}
        </button>
      </form>
      <Link
        href={`/mng/filters/${filter.id}/edit`}
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
