'use client'

import { useEffect, useState } from 'react'

/**
 * 다음(카카오) 우편번호 서비스 — API 키 없이 popup overlay 로 동작.
 * 스크립트는 lazy-load 되며 한 번만 로드된다.
 */
const SCRIPT_SRC = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'

type DaumAddressData = {
  address: string
  roadAddress: string
  jibunAddress: string
  buildingName?: string
  bname?: string
  zonecode: string
  addressType: 'R' | 'J'
}

declare global {
  interface Window {
    daum?: {
      Postcode: new (config: {
        oncomplete: (data: DaumAddressData) => void
        width?: string | number
        height?: string | number
      }) => { open: () => void }
    }
  }
}

type Props = {
  name: string
  required?: boolean
  placeholder?: string
  defaultValue?: string
  className?: string
  /** 주소 외에 상세주소 input 도 같이 받고 싶을 때 사용 */
  withDetailField?: boolean
  detailName?: string
}

export default function AddressSearchInput({
  name,
  required,
  placeholder,
  defaultValue,
  className,
  withDetailField,
  detailName = 'site_address_detail',
}: Props) {
  const [value, setValue] = useState(defaultValue ?? '')
  const [scriptReady, setScriptReady] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.daum?.Postcode) {
      setScriptReady(true)
      return
    }
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`) as
      | HTMLScriptElement
      | null
    if (existing) {
      existing.addEventListener('load', () => setScriptReady(true), { once: true })
      return
    }
    const s = document.createElement('script')
    s.src = SCRIPT_SRC
    s.async = true
    s.onload = () => setScriptReady(true)
    document.head.appendChild(s)
  }, [])

  const open = () => {
    if (!window.daum?.Postcode) return
    new window.daum.Postcode({
      oncomplete: (data) => {
        const base = data.roadAddress || data.address
        const extra = data.buildingName ? ` (${data.buildingName})` : ''
        setValue(`${base}${extra}`)
      },
    }).open()
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required={required}
          placeholder={placeholder}
          readOnly
          className={(className ?? '') + ' bg-neutral-50'}
        />
        <button
          type="button"
          onClick={open}
          disabled={!scriptReady}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-neutral-900 px-4 text-[0.875rem] font-medium text-white transition hover:bg-neutral-700 disabled:cursor-wait disabled:bg-neutral-400"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          주소 검색
        </button>
      </div>
      {withDetailField && (
        <input
          type="text"
          name={detailName}
          placeholder="상세주소 (동·호수, 층 등)"
          className={className}
        />
      )}
    </div>
  )
}
