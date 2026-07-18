'use client'

import { useState } from 'react'
import Link from 'next/link'
import { normalizeIconKey } from '@/lib/quickMenuIcons'
import QuickMenuIcon from '@/components/QuickMenuIcon'
import QuickMenuIconPicker from '@/components/QuickMenuIconPicker'
import { QUICK_MENU_TITLE_MAX } from '@/lib/types'

type Defaults = {
  title?: string
  href?: string
  icon_key?: string
  sort_order?: number
}

/**
 * 퀵메뉴 추가/수정 폼. 아이콘·타이틀을 고르면 우측 미리보기에 실시간 반영됩니다.
 * `action` 은 서버 액션 (추가: createQuickMenuItem, 수정: updateQuickMenuItem.bind(null,id)).
 */
export default function QuickMenuForm({
  action,
  submitLabel,
  defaults = {},
}: {
  action: (formData: FormData) => void | Promise<void>
  submitLabel: string
  defaults?: Defaults
}) {
  const [title, setTitle] = useState(defaults.title ?? '')
  const [href, setHref] = useState(defaults.href ?? '')
  const [iconKey, setIconKey] = useState(() => normalizeIconKey(defaults.icon_key))

  const isExternal = /^https?:\/\//i.test(href.trim())

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex flex-1 flex-col gap-4">
          {/* 타이틀 */}
          <label className="flex flex-col text-sm">
            타이틀
            <div className="relative mt-1">
              <input
                name="title"
                required
                value={title}
                maxLength={QUICK_MENU_TITLE_MAX}
                onChange={(e) => setTitle(e.currentTarget.value.slice(0, QUICK_MENU_TITLE_MAX))}
                placeholder="예: 견적문의"
                className="w-full rounded border border-neutral-300 bg-white px-3 py-2 pr-14"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.75rem] tabular-nums text-neutral-400">
                {title.length}/{QUICK_MENU_TITLE_MAX}
              </span>
            </div>
            <span className="mt-1 text-[0.75rem] text-neutral-500">
              최대 {QUICK_MENU_TITLE_MAX}자. 길면 자동으로 줄바꿈돼요.
            </span>
          </label>

          {/* 링크 */}
          <label className="flex flex-col text-sm">
            링크
            <input
              name="href"
              required
              value={href}
              onChange={(e) => setHref(e.currentTarget.value)}
              placeholder="예: /as 또는 https://blog.naver.com/…"
              className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
            />
            <span className="mt-1 text-[0.75rem] text-neutral-500">
              {isExternal
                ? '외부 주소로 인식돼 새 탭으로 열려요'
                : '사이트 내부 경로는 / 로 시작해요 (예: /as)'}
            </span>
          </label>
        </div>

        {/* 미리보기 — 실제 퀵메뉴와 동일한 형태 */}
        <div className="shrink-0 text-center">
          <div className="mx-auto flex w-[88px] flex-col items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2 py-3.5 text-neutral-700 shadow-sm">
            <QuickMenuIcon iconKey={iconKey} className="h-5 w-5 text-neutral-500" />
            <span className="whitespace-pre-line break-keep text-center text-[0.75rem] font-semibold leading-tight">
              {title || '미리보기'}
            </span>
          </div>
          <span className="mt-1.5 block text-[0.6875rem] text-neutral-400">미리보기</span>
        </div>
      </div>

      {/* 아이콘 선택 */}
      <div className="flex flex-col text-sm">
        아이콘
        <input type="hidden" name="icon_key" value={iconKey} />
        <QuickMenuIconPicker value={iconKey} onChange={setIconKey} />
      </div>

      {/* 정렬 순서 */}
      <label className="flex flex-col text-sm">
        정렬 순서
        <input
          name="sort_order"
          type="number"
          defaultValue={defaults.sort_order ?? 0}
          className="mt-1 w-32 rounded border border-neutral-300 bg-white px-3 py-2"
        />
        <span className="mt-1 text-[0.75rem] text-neutral-500">작은 숫자가 위에 표시돼요</span>
      </label>

      <div className="mt-1 flex gap-2">
        <button
          type="submit"
          className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          {submitLabel}
        </button>
        <Link
          href="/mng/quick-menu"
          className="rounded border border-neutral-300 bg-white px-4 py-2 text-sm hover:bg-neutral-100"
        >
          취소
        </Link>
      </div>
    </form>
  )
}
