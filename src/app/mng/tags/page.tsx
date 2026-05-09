import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { deleteTag } from './actions'
import { TAG_TONE_BADGE_CLS, type Tag, type TagScope } from '@/lib/types'

export const revalidate = 0

const SCOPE_LABEL: Record<TagScope, string> = {
  product: '제품',
  qna: 'Q&A',
}

export default async function AdminTagsPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>
}) {
  const sp = await searchParams
  const activeScope = (sp.scope as TagScope) || 'product'
  const scopes: TagScope[] = ['product', 'qna']

  const supabase = await createClient()
  const { data } = await supabase
    .from('tags')
    .select('*')
    .eq('scope', activeScope)
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true })

  const items = (data ?? []) as Tag[]

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">태그 관리</h1>
          <p className="mt-1 text-[0.875rem] text-neutral-500">
            제품·Q&amp;A 등 사이트 곳곳에서 사용되는 태그를 한 곳에서 관리합니다.
          </p>
        </div>
        <Link
          href={`/mng/tags/new?scope=${activeScope}`}
          className="rounded bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          + 태그 추가
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-neutral-200 pb-2">
        {scopes.map((s) => {
          const active = s === activeScope
          return (
            <Link
              key={s}
              href={`/mng/tags?scope=${s}`}
              className={`rounded-full px-3 py-1.5 text-[0.75rem] font-medium transition ${
                active
                  ? 'bg-neutral-900 text-white'
                  : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              {SCOPE_LABEL[s]}
            </Link>
          )
        })}
      </div>

      {items.length === 0 ? (
        <p className="mt-6 rounded border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          등록된 {SCOPE_LABEL[activeScope]} 태그가 없습니다.
        </p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <div className="hidden grid-cols-12 gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-[0.6875rem] font-semibold uppercase tracking-wider text-neutral-500 md:grid">
            <div className="col-span-1">순서</div>
            <div className="col-span-2">미리보기</div>
            <div className="col-span-2">value</div>
            <div className="col-span-2">label</div>
            <div className="col-span-2">tone</div>
            <div className="col-span-1">상태</div>
            <div className="col-span-2 text-right">액션</div>
          </div>

          <ul className="divide-y divide-neutral-100">
            {items.map((tag) => {
              const handleDelete = deleteTag.bind(null, tag.id)
              return (
                <li key={tag.id} className="grid grid-cols-12 items-center gap-3 px-4 py-3 text-[0.875rem]">
                  <div className="col-span-12 text-neutral-500 md:col-span-1">
                    {tag.sort_order}
                  </div>
                  <div className="col-span-12 md:col-span-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.75rem] font-bold tracking-wider ${
                        TAG_TONE_BADGE_CLS[tag.tone]
                      }`}
                    >
                      {tag.label}
                    </span>
                  </div>
                  <div className="col-span-12 font-mono text-[0.75rem] text-neutral-600 md:col-span-2">
                    {tag.value}
                  </div>
                  <div className="col-span-12 text-neutral-900 md:col-span-2">{tag.label}</div>
                  <div className="col-span-12 text-neutral-500 md:col-span-2">{tag.tone}</div>
                  <div className="col-span-12 md:col-span-1">
                    {tag.is_active ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[0.6875rem] font-medium text-emerald-700">
                        활성
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-[0.6875rem] font-medium text-neutral-500">
                        비활성
                      </span>
                    )}
                  </div>
                  <div className="col-span-12 flex justify-end gap-2 md:col-span-2">
                    <Link
                      href={`/mng/tags/${tag.id}/edit`}
                      className="rounded border border-neutral-300 bg-white px-2.5 py-1 text-[0.75rem] hover:bg-neutral-100"
                    >
                      수정
                    </Link>
                    <form action={handleDelete}>
                      <button
                        type="submit"
                        className="rounded border border-red-300 bg-white px-2.5 py-1 text-[0.75rem] text-red-700 hover:bg-red-50"
                      >
                        삭제
                      </button>
                    </form>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
