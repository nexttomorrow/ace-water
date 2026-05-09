'use client'

/**
 * 견적 폼들이 공유하는 입력 부품.
 * 모양/스타일을 한 곳에서 관리하면 4~5개 폼 톤앤매너가 자동으로 통일됨.
 */

import AddressSearchInput from '@/components/AddressSearchInput'
import Select from '@/components/ui/Select'

export const inputCls =
  'w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-[0.875rem] text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100'

export function Section({
  english,
  title,
  description,
  children,
}: {
  english: string
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section>
      <header className="mb-5 border-b border-neutral-200 pb-3">
        <p className="text-[0.75rem] font-semibold uppercase tracking-[0.35em] text-blue-700">
          {english}
        </p>
        <h2 className="mt-1.5 text-[1.125rem] font-bold tracking-tight md:text-[1.25rem]">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-[0.75rem] text-neutral-500">{description}</p>
        )}
      </header>
      {children}
    </section>
  )
}

export function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-3">{children}</div>
}

export function FieldGrid2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">{children}</div>
}

function Label({
  label,
  required,
}: {
  label: string
  required?: boolean
}) {
  return (
    <label className="mb-1.5 flex items-baseline gap-1 text-[0.875rem] font-medium text-neutral-800">
      {required && <span className="text-red-600">*</span>}
      {label}
    </label>
  )
}

function FieldWrap({
  label,
  required,
  className,
  children,
}: {
  label: string
  required?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={className}>
      <Label label={label} required={required} />
      {children}
    </div>
  )
}

export function TextField({
  name,
  label,
  required,
  type = 'text',
  placeholder,
  defaultValue,
  className,
}: {
  name: string
  label: string
  required?: boolean
  type?: 'text' | 'tel' | 'email' | 'url' | 'number'
  placeholder?: string
  defaultValue?: string
  className?: string
}) {
  return (
    <FieldWrap label={label} required={required} className={className}>
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={inputCls}
      />
    </FieldWrap>
  )
}

export function SelectField({
  name,
  label,
  required,
  options,
  defaultValue,
  onChange,
  className,
  placeholder = '선택',
}: {
  name: string
  label: string
  required?: boolean
  options: readonly { value: string; label: string }[]
  defaultValue?: string
  /** value 만 콜백으로 받도록 단순화 (기존 e.target.value 대체) */
  onChange?: (value: string) => void
  className?: string
  placeholder?: string
}) {
  return (
    <FieldWrap label={label} required={required} className={className}>
      <Select
        name={name}
        required={required}
        defaultValue={defaultValue ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        options={options.map((o) => ({ value: o.value, label: o.label }))}
      />
    </FieldWrap>
  )
}

export function DateField({
  name,
  label,
  required,
  min,
  className,
}: {
  name: string
  label: string
  required?: boolean
  min?: string
  className?: string
}) {
  return (
    <FieldWrap label={label} required={required} className={className}>
      <input type="date" name={name} required={required} min={min} className={inputCls} />
    </FieldWrap>
  )
}

export function TextareaField({
  name,
  label,
  required,
  placeholder,
  defaultValue,
  rows = 4,
  className,
}: {
  name: string
  label?: string
  required?: boolean
  placeholder?: string
  defaultValue?: string
  rows?: number
  className?: string
}) {
  return (
    <div className={className}>
      {label && <Label label={label} required={required} />}
      <textarea
        name={name}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        rows={rows}
        className={`${inputCls} resize-y`}
      />
    </div>
  )
}

export function AddressField({
  name,
  label,
  required,
  withDetailField,
  className,
}: {
  name: string
  label: string
  required?: boolean
  withDetailField?: boolean
  className?: string
}) {
  return (
    <FieldWrap label={label} required={required} className={className}>
      <AddressSearchInput
        name={name}
        required={required}
        placeholder="주소 검색을 눌러 입력해주세요"
        className={inputCls}
        withDetailField={withDetailField}
      />
    </FieldWrap>
  )
}

export function FileField({
  name,
  label,
  required,
  accept,
  description,
  fileName,
  onChange,
}: {
  name: string
  label?: string
  required?: boolean
  accept?: string
  description?: React.ReactNode
  fileName?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div>
      {label && <Label label={label} required={required} />}
      <label className="block">
        <span className="sr-only">파일 첨부</span>
        <div className="flex items-stretch gap-2">
          <div className="flex flex-1 items-center rounded-lg border border-neutral-300 bg-white px-3 text-[0.875rem] text-neutral-500">
            {fileName || '도면 등 참고용 파일을 선택해주세요'}
          </div>
          <span className="cursor-pointer rounded-lg bg-neutral-900 px-5 py-2.5 text-[0.875rem] font-medium text-white transition hover:bg-neutral-700">
            파일 선택
          </span>
        </div>
        <input
          type="file"
          name={name}
          required={required}
          accept={accept}
          onChange={onChange}
          className="sr-only"
        />
      </label>
      {description && <div className="mt-2 text-[0.75rem] leading-[1.7]">{description}</div>}
    </div>
  )
}

export function CheckboxField({
  name,
  value,
  label,
  description,
  defaultChecked,
}: {
  name: string
  value?: string
  label: string
  description?: string
  defaultChecked?: boolean
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-neutral-200 bg-white p-4 transition hover:border-neutral-300">
      <input
        type="checkbox"
        name={name}
        value={value ?? 'on'}
        defaultChecked={defaultChecked}
        className="mt-1 h-4 w-4 cursor-pointer accent-blue-600"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-[0.875rem] font-semibold text-neutral-900">{label}</span>
        {description && (
          <span className="mt-1 block text-[0.75rem] leading-[1.7] text-neutral-500">
            {description}
          </span>
        )}
      </span>
    </label>
  )
}

export function NoteList({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 space-y-1.5 text-[0.75rem] leading-[1.7] text-red-600">
      {items.map((t, i) => (
        <li key={i}>* {t}</li>
      ))}
    </ul>
  )
}
