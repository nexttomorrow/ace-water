import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { applyProductCategoryHrefs } from '@/lib/products'
import StickySubmenuTabs from './StickySubmenuTabs'
import type { Category } from '@/lib/types'

type Props = {
  /** 현재 페이지 경로 — categories.href와 매칭됩니다 */
  href: string
  /** 매칭되는 카테고리가 없을 때 사용할 기본 제목 */
  fallbackTitle: string
  /** 매칭되는 카테고리에 설명이 없을 때 사용할 기본 부제목 */
  fallbackSubtitle?: string
}

const bannerUrl = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/category-banners/${path}`

export default async function SubPageBanner({
  href,
  fallbackTitle,
  fallbackSubtitle,
}: Props) {
  const supabase = await createClient()

  // 모든 활성 카테고리를 한 번에 받아 helper 로 auto-binding 적용.
  // (제품안내 트리의 href 가 DB 에 없어도 런타임에 자동으로 채워짐)
  const { data: all } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true })
  const cats = applyProductCategoryHrefs((all ?? []) as Category[])

  // 현재 카테고리 — auto-bound 후의 href 로 매칭
  const cat = cats.find((c) => c.href === href) ?? null

  // 부모 + 형제 (depth-2 탭용)
  let parent: Category | null = null
  let siblings: Category[] = []

  if (cat?.parent_id) {
    parent = cats.find((c) => c.id === cat.parent_id) ?? null
    siblings = cats
      .filter((c) => c.parent_id === cat.parent_id)
      .filter((c) => c.href && c.href !== '#')
  } else if (cat) {
    // 자기 자신이 최상위인 경우 — 자식들을 탭으로 노출
    siblings = cats
      .filter((c) => c.parent_id === cat.id)
      .filter((c) => c.href && c.href !== '#')
  }

  const title = cat?.banner_title || cat?.name || fallbackTitle
  const subtitle = cat?.banner_subtitle || cat?.description || fallbackSubtitle || ''
  // 자식 카테고리에 배너 이미지가 없으면 부모의 배너 이미지를 자동 상속
  const imagePath = cat?.banner_image_path ?? parent?.banner_image_path ?? null

  // 텍스트 폴백 (배너 이미지 없을 때) — 기존 PageHeader 와 비슷하지만 좌측 정렬 + breadcrumb 포함
  if (!imagePath) {
    return (
      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-[1440px] px-6 py-12 md:py-16">
          <Breadcrumb parent={parent} current={title} tone="dark" />
          <h1 className="mt-2 text-[28px] font-bold leading-tight md:text-[40px]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-[14px] text-neutral-600 md:text-[15px]">{subtitle}</p>
          )}
          {siblings.length > 0 && (
            <StickySubmenuTabs items={siblings} activeHref={href} tone="dark" className="mt-6" />
          )}
        </div>
      </section>
    )
  }

  // 배너 이미지 모드
  return (
    <section className="relative h-[220px] w-full overflow-hidden md:h-[360px]">
      <Image
        src={bannerUrl(imagePath)}
        alt=""
        fill
        priority
        className="object-cover"
        unoptimized
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 mx-auto flex h-full max-w-[1440px] flex-col px-6 py-8 text-white md:py-10">
        <Breadcrumb parent={parent} current={title} tone="light" />

        <div className="mt-auto">
          <h1 className="text-[28px] font-bold leading-tight md:text-[44px]">{title}</h1>
          {subtitle && (
            <p className="mt-2 max-w-2xl text-[14px] text-white/85 md:text-[16px]">
              {subtitle}
            </p>
          )}
          {siblings.length > 0 && (
            <StickySubmenuTabs items={siblings} activeHref={href} tone="light" className="mt-6" />
          )}
        </div>
      </div>
    </section>
  )
}

function Breadcrumb({
  parent,
  current,
  tone,
}: {
  parent: Category | null
  current: string
  tone: 'light' | 'dark'
}) {
  const baseCls = tone === 'light' ? 'text-white/80' : 'text-neutral-500'
  const sepCls = tone === 'light' ? 'text-white/50' : 'text-neutral-300'
  const currentCls = tone === 'light' ? 'text-white' : 'text-neutral-900'
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex flex-wrap items-center gap-1.5 text-[12px] ${baseCls}`}
    >
      <Link href="/" className="transition hover:opacity-80">
        HOME
      </Link>
      {parent && (
        <>
          <span className={sepCls}>›</span>
          {parent.href && parent.href !== '#' ? (
            <Link href={parent.href} className="transition hover:opacity-80">
              {parent.name}
            </Link>
          ) : (
            <span>{parent.name}</span>
          )}
        </>
      )}
      <span className={sepCls}>›</span>
      <span className={`font-medium ${currentCls}`}>{current}</span>
    </nav>
  )
}

