import Link from 'next/link'
import Image from 'next/image'
import {
  deleteClientLogo,
  toggleClientLogoActive,
  setClientsSectionEnabled,
} from '../actions'
import { createClient } from '@/lib/supabase/server'
import {
  CLIENT_LOGOS_MAX,
  CLIENTS_SECTION_ENABLED_KEY,
  type ClientLogo,
} from '@/lib/types'

export const revalidate = 0

export default async function AdminClientsPage() {
  const supabase = await createClient()
  const [{ data }, { data: setting }] = await Promise.all([
    supabase
      .from('client_logos')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true }),
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', CLIENTS_SECTION_ENABLED_KEY)
      .maybeSingle(),
  ])

  const logos = (data ?? []) as ClientLogo[]
  const enabled = setting?.value !== 'false'
  const reachedMax = logos.length >= CLIENT_LOGOS_MAX
  const publicUrl = (path: string) =>
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/clients/${path}`

  const toggleSection = setClientsSectionEnabled.bind(null, !enabled)

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-12">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">고객사 로고 관리</h1>
        {reachedMax ? (
          <span className="rounded bg-neutral-200 px-3 py-2 text-sm text-neutral-500">
            최대 {CLIENT_LOGOS_MAX}개 등록됨
          </span>
        ) : (
          <Link
            href="/mng/clients/new"
            className="rounded bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            + 로고 추가
          </Link>
        )}
      </div>
      <p className="mb-5 text-[0.875rem] text-neutral-500">
        메인 페이지 하단 &ldquo;고객사&rdquo; 마퀴에 노출되는 로고를 관리해요. 최대{' '}
        {CLIENT_LOGOS_MAX}개까지 등록할 수 있고, 정렬값(작은 숫자가 먼저)으로 순서를 정할 수 있어요.
        업로드한 이미지는 200×84 카드에 맞춰 잘려(크롭) 표시됩니다.
      </p>

      {/* 섹션 전체 on/off */}
      <div className="mb-6 flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
        <div>
          <p className="text-sm font-semibold">고객사 섹션 노출</p>
          <p className="mt-0.5 text-[0.8125rem] text-neutral-500">
            {enabled
              ? '메인 페이지에 고객사 섹션이 노출됩니다 (활성 로고가 1개 이상일 때).'
              : '메인 페이지에서 고객사 섹션이 숨겨집니다.'}
          </p>
        </div>
        <form action={toggleSection}>
          <button
            type="submit"
            className={
              'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ' +
              (enabled ? 'bg-emerald-500' : 'bg-neutral-300')
            }
            role="switch"
            aria-checked={enabled}
            aria-label="고객사 섹션 노출 토글"
          >
            <span
              className={
                'inline-block h-5 w-5 transform rounded-full bg-white shadow transition ' +
                (enabled ? 'translate-x-6' : 'translate-x-1')
              }
            />
          </button>
        </form>
      </div>

      {logos.length === 0 ? (
        <p className="rounded border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          등록된 로고가 없어요. 첫 로고를 추가해보세요.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {logos.map((logo) => {
            const handleDelete = deleteClientLogo.bind(null, logo.id)
            const handleToggle = toggleClientLogoActive.bind(null, logo.id, logo.is_active)
            return (
              <div
                key={logo.id}
                className="overflow-hidden rounded-lg border border-neutral-200 bg-white"
              >
                <div className="relative h-[84px] w-full bg-neutral-100">
                  <Image
                    src={publicUrl(logo.image_path)}
                    alt={logo.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-[0.75rem] font-semibold text-white">
                    #{logo.sort_order}
                  </span>
                  {!logo.is_active && (
                    <span className="absolute right-2 top-2 rounded bg-neutral-700/80 px-2 py-0.5 text-[0.6875rem] font-semibold text-white">
                      숨김
                    </span>
                  )}
                </div>
                <div className="px-3 py-2.5">
                  <p className="truncate text-[0.9375rem] font-semibold">
                    {logo.name || <span className="text-neutral-400">(이름 없음)</span>}
                  </p>
                  {logo.link_url ? (
                    <p className="mt-0.5 truncate text-[0.75rem] text-blue-600">{logo.link_url}</p>
                  ) : (
                    <p className="mt-0.5 text-[0.75rem] text-neutral-400">링크 없음</p>
                  )}
                  <div className="mt-2.5 flex gap-1.5">
                    <form action={handleToggle} className="flex-1">
                      <button
                        type="submit"
                        className="w-full rounded border border-neutral-300 px-2 py-1.5 text-xs hover:bg-neutral-100"
                      >
                        {logo.is_active ? '숨기기' : '노출'}
                      </button>
                    </form>
                    <Link
                      href={`/mng/clients/${logo.id}/edit`}
                      className="flex-1 rounded border border-neutral-300 px-2 py-1.5 text-center text-xs hover:bg-neutral-100"
                    >
                      수정
                    </Link>
                    <form action={handleDelete} className="flex-1">
                      <button
                        type="submit"
                        className="w-full rounded border border-red-300 px-2 py-1.5 text-xs text-red-700 hover:bg-red-50"
                      >
                        삭제
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
