import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import QnaAccordion, { type QnaItem } from './QnaAccordion'

export const revalidate = 0

export default async function QnaPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.role === 'admin'
  }

  const { data, error } = await supabase
    .from('qna')
    .select('id, question, answer')
    .order('created_at', { ascending: false })

  const items = (data ?? []) as QnaItem[]

  return (
    <div className="mx-auto max-w-[960px] px-6 py-12">
      <div className="mb-2 text-center">
        <p className="mb-2 text-[12px] font-medium tracking-widest text-neutral-500">FAQ</p>
        <h1 className="text-[28px] font-bold leading-tight md:text-[36px]">자주 묻는 질문</h1>
        <div className="mx-auto mt-3 h-[2px] w-10 bg-neutral-900" />
        <p className="mt-4 text-[14px] text-neutral-500">
          ACEWATER 제품과 서비스에 대한 궁금증을 해결해드립니다
        </p>
      </div>

      <div className="mb-5 mt-10 flex items-center justify-between">
        <p className="text-[13px] text-neutral-500">
          총 <span className="font-semibold text-neutral-900">{items.length}</span>개의 Q&amp;A
        </p>
        {isAdmin && (
          <Link
            href="/qna/new"
            className="inline-flex items-center gap-1.5 rounded bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Q&amp;A 등록
          </Link>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error.message}</p>
      )}

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 p-12 text-center text-neutral-500">
          <svg className="mx-auto mb-3 h-10 w-10 text-neutral-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
          </svg>
          <p className="text-[14px]">등록된 Q&amp;A가 없습니다.</p>
        </div>
      ) : (
        <QnaAccordion items={items} isAdmin={isAdmin} />
      )}
    </div>
  )
}
