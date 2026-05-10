import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import SubPageBanner from '@/components/SubPageBanner'

export const revalidate = 0

const PAGE_SIZE = 10

export default async function NoticesListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

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

  // 조인 대신 분리 쿼리 — prod DB FK 추론 실패 케이스 회피
  const { data, error, count } = await supabase
    .from('notices')
    .select('id, title, created_at, author_id', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  const total = count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)

  const authorIds = Array.from(
    new Set(
      ((data ?? []) as Array<{ author_id: string | null }>)
        .map((r) => r.author_id)
        .filter((v): v is string => !!v)
    )
  )
  const nicknameById = new Map<string, string>()
  if (authorIds.length > 0) {
    const { data: profs } = await supabase
      .from('profiles')
      .select('id, nickname')
      .in('id', authorIds)
    for (const p of (profs ?? []) as Array<{ id: string; nickname: string | null }>) {
      if (p.nickname) nicknameById.set(p.id, p.nickname)
    }
  }

  return (
    <>
      <SubPageBanner href="/notices" fallbackTitle="공지사항" />

      <div className="mx-auto max-w-[1440px] px-6 py-12">
        <div className="mb-5 flex items-center justify-between">
        <p className="text-[0.875rem] text-neutral-500">
          총 <span className="font-semibold text-neutral-900">{total}</span>개의 공지
        </p>
        {isAdmin && (
          <Link
            href="/notices/new"
            className="inline-flex items-center gap-1.5 rounded bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            공지 등록
          </Link>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error.message}</p>
      )}

      {!data || data.length === 0 ? (
        <p className="rounded border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          등록된 공지사항이 없습니다.
        </p>
      ) : (
        <>
          <ul className="divide-y divide-neutral-200 rounded border border-neutral-200 bg-white">
            {data.map((p) => {
              const nickname = p.author_id ? nicknameById.get(p.author_id) : null
              return (
                <li key={p.id}>
                  <Link
                    href={`/notices/${p.id}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50"
                  >
                    <span className="truncate">
                      <span className="mr-2 inline-flex items-center rounded bg-neutral-900 px-1.5 py-0.5 text-[0.75rem] font-bold text-white">
                        공지
                      </span>
                      {p.title}
                    </span>
                    <span className="ml-3 shrink-0 text-xs text-neutral-500">
                      {nickname ?? '관리자'} ·{' '}
                      {new Date(p.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>

          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} />
          )}
        </>
      )}
      </div>
    </>
  )
}

function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number
  totalPages: number
}) {
  const windowSize = 5
  const start = Math.max(1, currentPage - Math.floor(windowSize / 2))
  const end = Math.min(totalPages, start + windowSize - 1)
  const adjustedStart = Math.max(1, end - windowSize + 1)
  const pages = Array.from({ length: end - adjustedStart + 1 }, (_, i) => adjustedStart + i)

  const baseLayout =
    'inline-flex h-9 min-w-9 items-center justify-center rounded border px-3 text-sm transition'
  const inactive = 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100'
  const active = 'border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800'
  const disabled = 'pointer-events-none opacity-40'

  const hrefFor = (p: number) => (p === 1 ? '/notices' : `/notices?page=${p}`)

  return (
    <nav className="mt-6 flex items-center justify-center gap-1">
      <Link
        href={hrefFor(Math.max(1, currentPage - 1))}
        className={`${baseLayout} ${inactive} ${currentPage === 1 ? disabled : ''}`}
        aria-label="이전 페이지"
      >
        ‹
      </Link>
      {pages.map((p) => (
        <Link
          key={p}
          href={hrefFor(p)}
          className={`${baseLayout} ${p === currentPage ? active : inactive}`}
          aria-current={p === currentPage ? 'page' : undefined}
        >
          {p}
        </Link>
      ))}
      <Link
        href={hrefFor(Math.min(totalPages, currentPage + 1))}
        className={`${baseLayout} ${inactive} ${currentPage === totalPages ? disabled : ''}`}
        aria-label="다음 페이지"
      >
        ›
      </Link>
    </nav>
  )
}
