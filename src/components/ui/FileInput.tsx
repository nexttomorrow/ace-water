/**
 * 사이트 전역 파일 업로더.
 * 라벨(선택) + native file input — file:* pseudo-element 로 "파일 선택" 버튼 부분을 슬림하게 스타일.
 *
 * 사용:
 *   <FileInput name="attachment" accept="image/*" hint="..." />
 *   <FileInput label="첨부파일" required name="file" hint="..." />
 *
 * 추가 hint/preview 등이 필요하면 children 으로 자유롭게.
 */

import type { ChangeEventHandler, ReactNode } from 'react'

export type FileInputProps = {
  name: string
  /** 라벨 텍스트 (생략 가능) */
  label?: ReactNode
  required?: boolean
  multiple?: boolean
  accept?: string
  /** 입력 아래 작은 안내문 */
  hint?: ReactNode
  className?: string
  /** 입력 자체에 추가 클래스 */
  inputClassName?: string
  onChange?: ChangeEventHandler<HTMLInputElement>
  /** 라벨 우측에 표시할 추가 정보 (개수 카운터 등) */
  rightLabel?: ReactNode
  /** 미리보기 등 input 위에 들어갈 자유 영역 */
  children?: ReactNode
  id?: string
}

const inputCls =
  'block w-full cursor-pointer rounded border border-neutral-300 bg-white text-[0.875rem]' +
  ' file:mr-4 file:cursor-pointer file:border-0 file:border-r file:border-neutral-300' +
  ' file:bg-neutral-50 file:px-4 file:py-2.5 file:text-[0.875rem] file:font-semibold' +
  ' file:text-neutral-700 hover:file:bg-neutral-100' +
  ' focus:outline-none focus:ring-2 focus:ring-blue-100' +
  ' disabled:cursor-not-allowed disabled:opacity-50'

export default function FileInput({
  name,
  label,
  required,
  multiple,
  accept,
  hint,
  className,
  inputClassName,
  onChange,
  rightLabel,
  children,
  id,
}: FileInputProps) {
  return (
    <div className={className}>
      {(label || rightLabel) && (
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          {label ? (
            <label
              htmlFor={id}
              className="block text-[0.875rem] font-semibold text-neutral-800"
            >
              {label}
              {required && <span className="ml-0.5 text-rose-500">*</span>}
            </label>
          ) : (
            <span />
          )}
          {rightLabel && (
            <span className="text-[0.75rem] text-neutral-500">{rightLabel}</span>
          )}
        </div>
      )}
      {children}
      <input
        id={id}
        type="file"
        name={name}
        required={required}
        multiple={multiple}
        accept={accept}
        onChange={onChange}
        className={`${inputCls} ${inputClassName ?? ''}`}
      />
      {hint && (
        <p className="mt-1.5 text-[0.75rem] leading-[1.7] text-neutral-500">
          {hint}
        </p>
      )}
    </div>
  )
}
