'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { reorderQna } from './actions'
import { TAG_TONE_BADGE_CLS, TAG_TONE_PILL_CLS, type Tag } from '@/lib/types'

export type QnaItem = {
  id: number
  question: string
  answer: string
  tags?: string[]
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

export default function QnaAccordion({
  items: itemsProp,
  isAdmin,
  tags = [],
}: {
  items: QnaItem[]
  isAdmin: boolean
  tags?: Pick<Tag, 'value' | 'label' | 'tone'>[]
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [items, setItems] = useState<QnaItem[]>(itemsProp)
  const [openId, setOpenId] = useState<number | null>(null)
  const [activeTag, setActiveTag] = useState<string | null>(null)

  useEffect(() => setItems(itemsProp), [itemsProp])

  // 드래그 상태 (admin 전용)
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const [dragOverId, setDragOverId] = useState<number | null>(null)
  const resetDrag = () => {
    setDraggingId(null)
    setDragOverId(null)
  }
  const handleDrop = (targetId: number) => {
    if (draggingId === null || draggingId === targetId) {
      resetDrag()
      return
    }
    const next = reorder(items, draggingId, targetId)
    setItems(next)
    startTransition(async () => {
      await reorderQna(next.map((c) => c.id))
      router.refresh()
    })
    resetDrag()
  }

  const tagByValue = useMemo(() => {
    const m = new Map<string, Pick<Tag, 'value' | 'label' | 'tone'>>()
    for (const t of tags) m.set(t.value, t)
    return m
  }, [tags])

  const filtered = useMemo(() => {
    if (!activeTag) return items
    return items.filter((it) => (it.tags ?? []).includes(activeTag))
  }, [items, activeTag])

  // 태그 필터가 활성화되면 드래그 비활성 (필터된 결과의 순서는 의미가 없음)
  const dragEnabled = isAdmin && !activeTag

  return (
    <div>
      {tags.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTag(null)}
            className={`rounded-full px-3.5 py-1.5 text-[0.75rem] font-medium transition ${
              !activeTag
                ? 'bg-neutral-900 text-white'
                : 'border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 hover:text-neutral-900'
            }`}
          >
            전체
          </button>
          {tags.map((t) => {
            const isActive = activeTag === t.value
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setActiveTag(isActive ? null : t.value)}
                className={`rounded-full px-3.5 py-1.5 text-[0.75rem] font-medium transition ${
                  isActive
                    ? TAG_TONE_BADGE_CLS[t.tone]
                    : 'border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 hover:text-neutral-900'
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      )}

      {isAdmin && !activeTag && (
        <p className="mb-3 text-[0.75rem] text-neutral-500">
          좌측 ⠿ 핸들이나 행 자체를 드래그해서 순서를 바꿀 수 있어요. (관리자 전용)
        </p>
      )}

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 p-8 text-center text-[0.875rem] text-neutral-500">
          해당 태그의 Q&amp;A가 없습니다.
        </p>
      ) : (
        <ul className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {filtered.map((item) => {
            const isOpen = openId === item.id
            const itemTags = (item.tags ?? [])
              .map((v) => tagByValue.get(v))
              .filter((t): t is Pick<Tag, 'value' | 'label' | 'tone'> => !!t)
            const isDragging = draggingId === item.id
            const isOver = dragOverId === item.id && draggingId !== item.id
            return (
          <li
            key={item.id}
            draggable={dragEnabled}
            onDragStart={dragEnabled ? (e) => {
              setDraggingId(item.id)
              e.dataTransfer.effectAllowed = 'move'
            } : undefined}
            onDragOver={dragEnabled ? (e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = 'move'
              if (item.id !== dragOverId) setDragOverId(item.id)
            } : undefined}
            onDragLeave={dragEnabled ? () =>
              setDragOverId((cur) => (cur === item.id ? null : cur))
              : undefined}
            onDrop={dragEnabled ? (e) => {
              e.preventDefault()
              handleDrop(item.id)
            } : undefined}
            onDragEnd={dragEnabled ? resetDrag : undefined}
            className={`border-b border-neutral-100 transition last:border-none ${
              isDragging ? 'opacity-40' : ''
            } ${isOver ? 'bg-blue-50/60' : ''}`}
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              className="flex w-full items-start gap-4 px-5 py-5 text-left transition hover:bg-neutral-50"
            >
              {dragEnabled && <DragHandle />}
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[0.75rem] font-extrabold text-white">
                Q
              </span>
              <span className="flex-1 pt-0.5 text-[1rem] font-semibold leading-6 text-neutral-900">
                {itemTags.length > 0 && (
                  <span className="mr-2 inline-flex flex-wrap gap-1 align-middle">
                    {itemTags.map((t) => (
                      <span
                        key={t.value}
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[0.6875rem] font-bold ${
                          TAG_TONE_PILL_CLS[t.tone]
                        }`}
                      >
                        {t.label}
                      </span>
                    ))}
                  </span>
                )}
                {item.question}
              </span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`mt-0.5 shrink-0 text-neutral-400 transition-transform duration-300 ${
                  isOpen ? 'rotate-180 text-neutral-900' : ''
                }`}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className="overflow-hidden">
                <div className="flex items-start gap-4 border-t border-neutral-100 bg-neutral-50/60 px-5 py-5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[0.75rem] font-extrabold text-white">
                    A
                  </span>
                  <div
                    className="prose prose-neutral prose-sm min-w-0 max-w-none flex-1 [&_a]:text-blue-600 [&_img]:rounded [&_table]:border [&_table]:border-collapse [&_td]:border [&_td]:border-neutral-300 [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-neutral-300 [&_th]:bg-neutral-100 [&_th]:px-2 [&_th]:py-1"
                    dangerouslySetInnerHTML={{ __html: item.answer }}
                  />
                  {isAdmin && (
                    <Link
                      href={`/qna/${item.id}/edit`}
                      className="shrink-0 rounded border border-neutral-300 bg-white px-3 py-1.5 text-[0.75rem] text-neutral-700 hover:bg-neutral-100"
                    >
                      수정
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </li>
        )
          })}
        </ul>
      )}
    </div>
  )
}

function DragHandle() {
  return (
    <span
      className="flex h-7 w-4 shrink-0 cursor-grab items-center justify-center text-neutral-300 hover:text-neutral-500 active:cursor-grabbing"
      title="드래그해서 순서 변경"
      aria-hidden
      onClick={(e) => e.stopPropagation()}
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
