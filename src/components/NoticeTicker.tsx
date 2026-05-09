'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

export type TickerNotice = { id: number; title: string }

const ITEM_HEIGHT = 28
const SLIDE_INTERVAL = 3500
const TRANSITION_MS = 500

export default function NoticeTicker({ notices }: { notices: TickerNotice[] }) {
  const [idx, setIdx] = useState(0)
  const [enableTransition, setEnableTransition] = useState(true)
  const pausedRef = useRef(false)

  useEffect(() => {
    if (notices.length <= 1) return
    const t = setInterval(() => {
      if (pausedRef.current) return
      setEnableTransition(true)
      setIdx((i) => i + 1)
    }, SLIDE_INTERVAL)
    return () => clearInterval(t)
  }, [notices.length])

  useEffect(() => {
    if (notices.length <= 1) return
    if (idx === notices.length) {
      const t = setTimeout(() => {
        setEnableTransition(false)
        setIdx(0)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setEnableTransition(true))
        })
      }, TRANSITION_MS)
      return () => clearTimeout(t)
    }
  }, [idx, notices.length])

  if (notices.length === 0) return null

  const items = notices.length > 1 ? [...notices, notices[0]] : notices

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="shrink-0 rounded bg-neutral-900 px-1.5 py-0.5 text-[0.75rem] font-bold tracking-tight text-white">
        공지
      </span>
      <div
        className="relative min-w-0 flex-1 overflow-hidden"
        style={{ height: ITEM_HEIGHT }}
        onMouseEnter={() => {
          pausedRef.current = true
        }}
        onMouseLeave={() => {
          pausedRef.current = false
        }}
      >
        <div
          className="flex flex-col"
          style={{
            transform: `translateY(-${idx * ITEM_HEIGHT}px)`,
            transition: enableTransition ? `transform ${TRANSITION_MS}ms ease` : 'none',
          }}
        >
          {items.map((n, i) => (
            <Link
              key={`${n.id}-${i}`}
              href={`/notices/${n.id}`}
              className="flex shrink-0 items-center truncate text-[0.75rem] text-neutral-700 transition hover:text-black"
              style={{ height: ITEM_HEIGHT }}
            >
              <span className="truncate">{n.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
