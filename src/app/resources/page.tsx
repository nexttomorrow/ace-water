import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatBytes, getFileColor } from '@/lib/files'
import SubPageBanner from '@/components/SubPageBanner'

export const revalidate = 0

const PAGE_SIZE = 10

export default async function ResourcesListPage({
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

  const { data, error, count } = await supabase
    .from('resources')
    .select('id, title, file_name, file_size, download_count, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  const total = count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)

  return (
    <>
      <SubPageBanner
        href="/resources"
        fallbackTitle="자료실"
        fallbackSubtitle=""
      />

      <div className="mx-auto max-w-[1440px] px-6 py-12">
        <div className="mb-5 flex items-center justify-between">
        <p className="text-[0.875rem] text-neutral-500">
          총 <span className="font-semibold text-neutral-900">{total}</span>개의 자료
        </p>
        {isAdmin && (
          <Link
            href="/resources/new"
            className="inline-flex items-center gap-1.5 rounded bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            자료 등록
          </Link>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error.message}</p>
      )}

      {!data || data.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 p-12 text-center text-neutral-500">
          <svg className="mx-auto mb-3 h-10 w-10 text-neutral-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
          </svg>
          <p className="text-[0.875rem]">등록된 자료가 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
            {/* Table header (desktop) */}
            <div className="hidden grid-cols-12 gap-4 border-b border-neutral-200 bg-neutral-50 px-5 py-3 text-[0.75rem] font-semibold text-neutral-600 md:grid">
              <div className="col-span-1 text-center">번호</div>
              <div className="col-span-6">제목</div>
              <div className="col-span-2 text-center">파일</div>
              <div className="col-span-2 text-center">등록일</div>
              <div className="col-span-1 text-center">다운로드</div>
            </div>

            <ul className="divide-y divide-neutral-100">
              {data.map((r, i) => {
                const num = total - (currentPage - 1) * PAGE_SIZE - i
                const color = getFileColor(r.file_name)
                return (
                  <li key={r.id} className="group transition hover:bg-neutral-50">
                    <div className="grid grid-cols-12 items-center gap-4 px-5 py-4 text-[0.875rem]">
                      <div className="col-span-12 hidden text-center text-neutral-400 md:col-span-1 md:block">
                        {num}
                      </div>
                      <Link
                        href={`/resources/${r.id}`}
                        className="col-span-12 flex min-w-0 items-center gap-3 md:col-span-6"
                      >
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${color.bg} ${color.text} text-[0.75rem] font-bold`}>
                          {color.label}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[0.875rem] font-semibold text-neutral-900 group-hover:underline">
                            {r.title}
                          </p>
                          <p className="mt-0.5 truncate text-[0.75rem] text-neutral-500">
                            {r.file_name}
                          </p>
                        </div>
                      </Link>
                      <div className="col-span-12 hidden text-center text-[0.75rem] text-neutral-500 md:col-span-2 md:block">
                        {formatBytes(r.file_size)}
                      </div>
                      <div className="col-span-12 hidden text-center text-[0.75rem] text-neutral-500 md:col-span-2 md:block">
                        {new Date(r.created_at).toLocaleDateString('ko-KR')}
                      </div>
                      <div className="col-span-12 flex items-center justify-end md:col-span-1 md:justify-center">
                        <a
                          href={`/resources/${r.id}/download`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-[0.75rem] font-medium text-neutral-700 transition hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
                          aria-label="다운로드"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                          </svg>
                          <span>{r.download_count}</span>
                        </a>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

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

  const hrefFor = (p: number) => (p === 1 ? '/resources' : `/resources?page=${p}`)

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
