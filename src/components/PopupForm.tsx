'use client'

import { useState } from 'react'
import Link from 'next/link'
import OptimizedImageInput from '@/components/OptimizedImageInput'
import {
  POPUP_TYPES,
  POPUP_DEVICES,
  POPUP_DISMISSES,
  POPUP_TYPE_LABEL,
  POPUP_TYPE_DESC,
  POPUP_DEVICE_LABEL,
  POPUP_DISMISS_LABEL,
  type Popup,
  type PopupContentType,
  type PopupType,
} from '@/lib/types'

/** ISO(UTC) → datetime-local 입력값(로컬시간 문자열). 클라이언트 로컬 TZ 기준. */
function isoToLocalInput(iso: string | null | undefined, fallback: Date): string {
  const d = iso ? new Date(iso) : fallback
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const inputCls = 'mt-1 rounded border border-neutral-300 bg-white px-3 py-2'
const labelCls = 'flex flex-col text-sm'

export default function PopupForm({
  action,
  submitLabel,
  defaults,
}: {
  action: (formData: FormData) => void | Promise<void>
  submitLabel: string
  defaults?: Partial<Popup>
}) {
  const isNew = !defaults?.id
  const now = new Date()
  const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const [contentType, setContentType] = useState<PopupContentType>(
    defaults?.content_type ?? 'image'
  )
  const [popupType, setPopupType] = useState<PopupType>(defaults?.popup_type ?? 'layer')

  return (
    <form action={action} className="flex flex-col gap-4">
      {/* 제목 + 사용여부 */}
      <div className="flex items-end gap-4">
        <label className={`${labelCls} flex-1`}>
          제목
          <input
            name="title"
            required
            defaultValue={defaults?.title ?? ''}
            placeholder="예: 여름 프로모션 안내"
            className={inputCls}
          />
        </label>
        <label className="mb-2 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={isNew ? true : (defaults?.is_active ?? true)}
            className="h-4 w-4"
          />
          사용함
        </label>
      </div>

      {/* 팝업 유형 + 기기 */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <label className={`${labelCls} flex-1`}>
          팝업 유형
          <select
            name="popup_type"
            value={popupType}
            onChange={(e) => setPopupType(e.currentTarget.value as PopupType)}
            className={inputCls}
          >
            {POPUP_TYPES.map((t) => (
              <option key={t} value={t}>
                {POPUP_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
          <span className="mt-1 text-[0.75rem] text-neutral-500">{POPUP_TYPE_DESC[popupType]}</span>
        </label>

        <label className={`${labelCls} flex-1`}>
          노출 대상 기기
          <select name="device" defaultValue={defaults?.device ?? 'all'} className={inputCls}>
            {POPUP_DEVICES.map((d) => (
              <option key={d} value={d}>
                {POPUP_DEVICE_LABEL[d]}
              </option>
            ))}
          </select>
          <span className="mt-1 text-[0.75rem] text-neutral-500">
            모바일 선택 시 작은 화면(반응형)에서만 노출돼요
          </span>
        </label>
      </div>

      {/* 본문 유형 */}
      <div className={labelCls}>
        본문 유형
        <div className="mt-1 flex gap-2">
          {(['image', 'html'] as PopupContentType[]).map((ct) => (
            <button
              key={ct}
              type="button"
              onClick={() => setContentType(ct)}
              className={`flex-1 rounded border px-3 py-2 text-sm font-medium transition ${
                contentType === ct
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {ct === 'image' ? '이미지' : '텍스트/HTML'}
            </button>
          ))}
        </div>
        <input type="hidden" name="content_type" value={contentType} />
      </div>

      {/* 본문 내용 (유형별) */}
      {contentType === 'image' ? (
        <div className="flex flex-col gap-3 rounded border border-neutral-200 bg-neutral-50 p-3">
          {defaults?.image_url && (
            <div>
              <p className="mb-1 text-[0.75rem] text-neutral-500">현재 이미지</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={defaults.image_url}
                alt="현재 팝업 이미지"
                className="max-h-40 rounded border border-neutral-200"
              />
            </div>
          )}
          <label className={labelCls}>
            이미지 업로드 {defaults?.image_url ? '(교체 시 선택)' : ''}
            <OptimizedImageInput
              name="image"
              maxWidth={1600}
              maxHeight={1600}
              quality={85}
              className="mt-1"
            />
          </label>
          <label className={labelCls}>
            또는 이미지 URL 직접 입력
            <input
              name="image_url"
              defaultValue={defaults?.image_url ?? ''}
              placeholder="https://…/popup.jpg"
              className={inputCls}
            />
            <span className="mt-1 text-[0.75rem] text-neutral-500">
              업로드한 파일이 있으면 그 이미지가 우선 사용돼요
            </span>
          </label>
        </div>
      ) : (
        <label className={labelCls}>
          본문 (HTML 허용)
          <textarea
            name="body_html"
            rows={6}
            defaultValue={defaults?.body_html ?? ''}
            placeholder="<h3>이벤트 안내</h3><p>내용…</p>"
            className={`${inputCls} font-mono text-[0.8125rem]`}
          />
          <span className="mt-1 text-[0.75rem] text-neutral-500">
            저장 시 자동으로 안전하게 정화(sanitize)돼요
          </span>
        </label>
      )}

      {/* 링크 */}
      <div className="flex items-end gap-4">
        <label className={`${labelCls} flex-1`}>
          연결 링크 (선택)
          <input
            name="link_url"
            defaultValue={defaults?.link_url ?? ''}
            placeholder="예: /products 또는 https://…"
            className={inputCls}
          />
        </label>
        <label className="mb-2 flex items-center gap-2 whitespace-nowrap text-sm">
          <input
            type="checkbox"
            name="open_new_tab"
            defaultChecked={isNew ? true : (defaults?.open_new_tab ?? true)}
            className="h-4 w-4"
          />
          새 탭으로 열기
        </label>
      </div>

      {/* 노출 기간 */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <label className={`${labelCls} flex-1`}>
          노출 시작
          <input
            type="datetime-local"
            name="starts_at"
            required
            defaultValue={isoToLocalInput(defaults?.starts_at, now)}
            className={inputCls}
          />
        </label>
        <label className={`${labelCls} flex-1`}>
          노출 종료
          <input
            type="datetime-local"
            name="ends_at"
            required
            defaultValue={isoToLocalInput(defaults?.ends_at, weekLater)}
            className={inputCls}
          />
        </label>
      </div>

      {/* 위치 (유형별) */}
      {popupType === 'general' && (
        <div className="flex flex-col gap-4 rounded border border-neutral-200 bg-neutral-50 p-3 sm:flex-row">
          <label className={`${labelCls} flex-1`}>
            좌표 X (px)
            <input
              type="number"
              name="pos_x"
              defaultValue={defaults?.pos_x ?? 20}
              className={inputCls}
            />
          </label>
          <label className={`${labelCls} flex-1`}>
            좌표 Y (px)
            <input
              type="number"
              name="pos_y"
              defaultValue={defaults?.pos_y ?? 20}
              className={inputCls}
            />
          </label>
        </div>
      )}

      {/* 다시 보지 않기 옵션 */}
      <label className={labelCls}>
        다시 보지 않기 옵션
        <select
          name="dismiss_option"
          defaultValue={defaults?.dismiss_option ?? 'today'}
          className={`${inputCls} sm:w-64`}
        >
          {POPUP_DISMISSES.map((d) => (
            <option key={d} value={d}>
              {POPUP_DISMISS_LABEL[d]}
            </option>
          ))}
        </select>
        <span className="mt-1 text-[0.75rem] text-neutral-500">
          팝업 하단에 표시할 안내 버튼이에요. ‘닫기’ 버튼은 항상 함께 표시돼요.
        </span>
      </label>

      {/* 크기 + 정렬 */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <label className={`${labelCls} flex-1`}>
          가로 (px, 비우면 자동)
          <input type="number" name="width" defaultValue={defaults?.width ?? ''} className={inputCls} />
        </label>
        <label className={`${labelCls} flex-1`}>
          세로 (px, 비우면 자동)
          <input type="number" name="height" defaultValue={defaults?.height ?? ''} className={inputCls} />
        </label>
        <label className={`${labelCls} flex-1`}>
          노출 순서
          <input
            type="number"
            name="sort_order"
            defaultValue={defaults?.sort_order ?? 0}
            className={inputCls}
          />
          <span className="mt-1 text-[0.75rem] text-neutral-500">작을수록 먼저 노출</span>
        </label>
      </div>
      <p className="-mt-2 text-[0.75rem] text-neutral-400">
        크기를 지정해도 화면보다 크면 자동으로 축소돼요(반응형). 비우면 콘텐츠 원본 크기로 표시돼요.
      </p>

      <div className="mt-1 flex gap-2">
        <button
          type="submit"
          className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          {submitLabel}
        </button>
        <Link
          href="/mng/popups"
          className="rounded border border-neutral-300 bg-white px-4 py-2 text-sm hover:bg-neutral-100"
        >
          취소
        </Link>
      </div>
    </form>
  )
}
