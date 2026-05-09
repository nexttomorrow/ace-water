import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import type { Category } from '@/lib/types'

export const revalidate = 0

const bannerUrl = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/category-banners/${path}`

export default async function AdminSubpagesPage() {
  const supabase = await createClient()

  // 모든 카테고리를 한 번에 가져와 부모-자식 트리로 구성
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('parent_id', { ascending: true, nullsFirst: true })
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true })

  const all = (data ?? []) as Category[]
  const tops = all.filter((c) => c.parent_id === null)
  const childrenOf = (parentId: number) =>
    all.filter((c) => c.parent_id === parentId)

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-12">
      <div className="mb-2">
        <h1 className="text-2xl font-bold">서브페이지 배너 관리</h1>
        <p className="mt-1 text-[0.875rem] text-neutral-500">
          각 페이지 상단에 노출되는 큰 배너를 관리합니다. <strong>상위 카테고리에 배너를 등록하면
          모든 하위 페이지에 자동 상속</strong>되니, 보통은 상위 1개만 설정하면 됩니다. 특정
          하위 페이지만 다른 배너를 쓰고 싶으면 그 행에서 따로 등록하세요.
        </p>
      </div>

      {tops.length === 0 ? (
        <p className="mt-6 rounded border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          상위 카테고리가 없습니다.{' '}
          <Link href="/mng/categories" className="text-blue-600 hover:underline">
            카테고리 관리
          </Link>
          에서 먼저 등록해주세요.
        </p>
      ) : (
        <div className="mt-6 space-y-6">
          {tops.map((parent) => {
            const kids = childrenOf(parent.id)
            const parentHasBanner = !!parent.banner_image_path
            return (
              <section
                key={parent.id}
                className="overflow-hidden rounded-xl border border-neutral-200 bg-white"
              >
                {/* parent row */}
                <BannerRow
                  cat={parent}
                  inheritedFrom={null}
                  isTopLevel
                  hasOwnBanner={parentHasBanner}
                />

                {/* children */}
                {kids.length > 0 && (
                  <ul className="divide-y divide-neutral-100 border-t border-neutral-200 bg-neutral-50/40">
                    {kids.map((kid) => (
                      <li key={kid.id}>
                        <BannerRow
                          cat={kid}
                          inheritedFrom={parentHasBanner ? parent : null}
                          isTopLevel={false}
                          hasOwnBanner={!!kid.banner_image_path}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}

function BannerRow({
  cat,
  inheritedFrom,
  isTopLevel,
  hasOwnBanner,
}: {
  cat: Category
  inheritedFrom: Category | null // 부모로부터 상속받는 경우 부모 카테고리, 아니면 null
  isTopLevel: boolean
  hasOwnBanner: boolean
}) {
  // 표시될 배너 = 자체 배너 ?? 부모 배너
  const effectiveBannerPath =
    cat.banner_image_path ?? inheritedFrom?.banner_image_path ?? null

  const status: 'own' | 'inherited' | 'none' = hasOwnBanner
    ? 'own'
    : inheritedFrom
      ? 'inherited'
      : 'none'

  const statusBadge = {
    own: { text: '자체 배너', cls: 'bg-green-50 text-green-700' },
    inherited: {
      text: `상위(${inheritedFrom?.name})에서 상속`,
      cls: 'bg-blue-50 text-blue-700',
    },
    none: { text: '배너 없음 (텍스트 헤더로 표시)', cls: 'bg-neutral-100 text-neutral-500' },
  }[status]

  const hasRealHref = !!cat.href && cat.href !== '#'

  return (
    <div
      className={`flex items-start gap-4 px-5 py-4 ${
        isTopLevel ? 'bg-white' : ''
      }`}
    >
      {!isTopLevel && (
        <span className="mt-2 shrink-0 text-neutral-300" aria-hidden>
          └
        </span>
      )}

      <div className="h-16 w-32 shrink-0 overflow-hidden rounded bg-neutral-100">
        {effectiveBannerPath ? (
          <Image
            src={bannerUrl(effectiveBannerPath)}
            alt=""
            width={256}
            height={128}
            className="h-full w-full object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[0.75rem] text-neutral-400">
            배너 없음
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={`truncate ${isTopLevel ? 'text-[1rem] font-semibold' : 'text-[0.875rem] font-medium'}`}>
            {cat.banner_title || cat.name}
          </p>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[0.75rem] font-medium ${statusBadge.cls}`}>
            {statusBadge.text}
          </span>
          {!cat.is_active && (
            <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[0.75rem] font-medium text-neutral-500">
              비활성
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate font-mono text-[0.75rem] text-neutral-500">
          {cat.href || '(href 없음 — 페이지 없음)'}
        </p>
        {(cat.banner_subtitle || cat.description) && (
          <p className="mt-1 line-clamp-1 text-[0.75rem] text-neutral-500">
            {cat.banner_subtitle || cat.description}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {hasRealHref && (
          <Link
            href={cat.href!}
            target="_blank"
            className="rounded border border-neutral-300 px-3 py-1.5 text-[0.75rem] hover:bg-neutral-100"
          >
            페이지 보기 ↗
          </Link>
        )}
        <Link
          href={`/mng/subpages/${cat.id}/edit`}
          className="rounded bg-neutral-900 px-3 py-1.5 text-[0.75rem] font-medium text-white hover:bg-neutral-700"
        >
          배너 수정
        </Link>
      </div>
    </div>
  )
}
