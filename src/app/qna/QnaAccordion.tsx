'use client'

import Link from 'next/link'
import { useState } from 'react'

export type QnaItem = {
  id: number
  question: string
  answer: string
}

export default function QnaAccordion({
  items,
  isAdmin,
}: {
  items: QnaItem[]
  isAdmin: boolean
}) {
  const [openId, setOpenId] = useState<number | null>(null)

  return (
    <ul className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      {items.map((item) => {
        const isOpen = openId === item.id
        return (
          <li key={item.id} className="border-b border-neutral-100 last:border-none">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              className="flex w-full items-start gap-4 px-5 py-5 text-left transition hover:bg-neutral-50"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[12px] font-extrabold text-white">
                Q
              </span>
              <span className="flex-1 pt-0.5 text-[15px] font-semibold leading-6 text-neutral-900">
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
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[12px] font-extrabold text-white">
                    A
                  </span>
                  <div
                    className="prose prose-neutral prose-sm min-w-0 max-w-none flex-1 [&_a]:text-blue-600 [&_img]:rounded [&_table]:border [&_table]:border-collapse [&_td]:border [&_td]:border-neutral-300 [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-neutral-300 [&_th]:bg-neutral-100 [&_th]:px-2 [&_th]:py-1"
                    dangerouslySetInnerHTML={{ __html: item.answer }}
                  />
                  {isAdmin && (
                    <Link
                      href={`/qna/${item.id}/edit`}
                      className="shrink-0 rounded border border-neutral-300 bg-white px-3 py-1.5 text-[12px] text-neutral-700 hover:bg-neutral-100"
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
  )
}
