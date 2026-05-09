'use client'

/**
 * 어드민 리스트의 멀티셀렉트 + 일괄 처리 공용 래퍼.
 *
 * 사용법:
 *   <SelectableTable
 *     ids={posts.map(p => p.id)}
 *     onBulkDelete={async (ids) => { await adminBulkDeletePosts(ids) }}
 *     extraBulkActions={[{ label: '진행중으로 이동', onClick: (ids) => ... }]}
 *     deleteConfirm="선택한 항목을 삭제하시겠습니까?"
 *   >
 *     {({ checkboxFor, headerCheckbox }) => (
 *       <table>
 *         <thead>
 *           <tr>
 *             <th>{headerCheckbox}</th>
 *             ...
 *           </tr>
 *         </thead>
 *         <tbody>
 *           {posts.map(p => (
 *             <tr key={p.id}>
 *               <td>{checkboxFor(p.id)}</td>
 *               ...
 *             </tr>
 *           ))}
 *         </tbody>
 *       </table>
 *     )}
 *   </SelectableTable>
 */

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export type BulkAction = {
  label: string
  /** 동작 — 일괄 처리 액션. 비동기. */
  onClick: (ids: number[]) => Promise<void> | void
  /** 추가 톤. 기본 neutral. */
  tone?: 'neutral' | 'primary' | 'danger'
  /** true 면 confirm() 으로 한 번 더 확인 */
  confirm?: string
}

type RenderProps = {
  selectedIds: number[]
  isSelected: (id: number) => boolean
  toggle: (id: number) => void
  checkboxFor: (id: number) => React.ReactNode
  headerCheckbox: React.ReactNode
}

type Props = {
  ids: number[]
  /** 삭제 액션 (필수) — 없으면 '삭제' 버튼 안 노출 */
  onBulkDelete?: (ids: number[]) => Promise<void> | void
  /** 추가 일괄 액션들 — 견적 상태이동 등 */
  extraBulkActions?: BulkAction[]
  deleteConfirm?: string
  children: (props: RenderProps) => React.ReactNode
}

const TONE_CLS: Record<NonNullable<BulkAction['tone']>, string> = {
  neutral: 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100',
  primary: 'border-blue-500 bg-blue-600 text-white hover:bg-blue-700',
  danger: 'border-red-500 bg-red-600 text-white hover:bg-red-700',
}

export default function SelectableTable({
  ids,
  onBulkDelete,
  extraBulkActions,
  deleteConfirm = '선택한 항목을 정말 삭제하시겠습니까?',
  children,
}: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [pending, setPending] = useState(false)

  // ids 가 바뀌면 (페이지/필터 변경 등) 선택 초기화
  useEffect(() => {
    setSelected(new Set())
    // ids.join 으로만 비교 (배열 식별자 변경에 둔감)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(',')])

  const allCount = ids.length
  const selectedArr = useMemo(() => Array.from(selected), [selected])
  const selectedCount = selectedArr.length
  const allChecked = allCount > 0 && selectedCount === allCount
  const someChecked = selectedCount > 0 && selectedCount < allCount

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    setSelected((prev) =>
      prev.size === allCount ? new Set() : new Set(ids)
    )
  }

  const runAction = (
    handler: (ids: number[]) => Promise<void> | void,
    confirmMsg?: string
  ) => {
    if (selectedCount === 0) return
    if (confirmMsg && !window.confirm(confirmMsg)) return
    setPending(true)
    startTransition(async () => {
      try {
        await handler(selectedArr)
        setSelected(new Set())
        router.refresh()
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        // 액션 실패 시 사용자에게 에러 표시 (조용히 묻히지 않도록)
        window.alert(`작업 실패: ${msg}`)
      } finally {
        setPending(false)
      }
    })
  }

  const headerCheckbox = (
    <input
      type="checkbox"
      aria-label="전체 선택"
      checked={allChecked}
      ref={(el) => {
        if (el) el.indeterminate = someChecked
      }}
      onChange={toggleAll}
      className="h-4 w-4 cursor-pointer accent-blue-600 disabled:cursor-not-allowed"
      disabled={allCount === 0 || pending}
    />
  )

  const checkboxFor = (id: number) => (
    <input
      type="checkbox"
      aria-label={`항목 ${id} 선택`}
      checked={selected.has(id)}
      onChange={() => toggle(id)}
      onClick={(e) => e.stopPropagation()}
      className="h-4 w-4 cursor-pointer accent-blue-600 disabled:cursor-not-allowed"
      disabled={pending}
    />
  )

  return (
    <div className="space-y-3">
      {/* 일괄 액션 바 */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-2.5 transition ${
          selectedCount > 0
            ? 'border-blue-200 bg-blue-50/60'
            : 'border-neutral-200 bg-neutral-50/60'
        }`}
      >
        <div className="flex items-center gap-3 text-[0.875rem]">
          <label className="inline-flex cursor-pointer items-center gap-2 text-neutral-700">
            <input
              type="checkbox"
              checked={allChecked}
              ref={(el) => {
                if (el) el.indeterminate = someChecked
              }}
              onChange={toggleAll}
              disabled={allCount === 0 || pending}
              className="h-4 w-4 cursor-pointer accent-blue-600"
            />
            <span className="font-medium">전체 선택</span>
          </label>
          <span className="text-neutral-300" aria-hidden>
            |
          </span>
          <span className="font-mono tabular-nums text-neutral-600">
            {selectedCount} / {allCount} 선택
          </span>
        </div>

        {selectedCount > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {extraBulkActions?.map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={() => runAction(a.onClick, a.confirm)}
                disabled={pending}
                className={`rounded-full border px-3 py-1.5 text-[0.75rem] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  TONE_CLS[a.tone ?? 'neutral']
                }`}
              >
                {a.label}
              </button>
            ))}
            {onBulkDelete && (
              <button
                type="button"
                onClick={() => runAction(onBulkDelete, deleteConfirm)}
                disabled={pending}
                className={`rounded-full border px-3 py-1.5 text-[0.75rem] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${TONE_CLS.danger}`}
              >
                선택 삭제 ({selectedCount})
              </button>
            )}
          </div>
        )}
      </div>

      {children({
        selectedIds: selectedArr,
        isSelected: (id) => selected.has(id),
        toggle,
        checkboxFor,
        headerCheckbox,
      })}
    </div>
  )
}
