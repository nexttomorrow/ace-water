import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CaseDetail from './CaseDetail'
import type { GalleryItem } from '@/lib/types'

export const revalidate = 0

const itemUrl = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gallery/${path}`

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const itemId = Number(id)
  if (!Number.isFinite(itemId)) notFound()

  const supabase = await createClient()
  const { data } = await supabase
    .from('gallery_items')
    .select('*')
    .eq('id', itemId)
    .single()

  if (!data) notFound()

  const item = data as GalleryItem

  // 카테고리는 "제품안내" 하위 categories 에서 lookup
  let category: { id: number; name: string } | null = null
  if (item.category_id) {
    const { data: catRow } = await supabase
      .from('categories')
      .select('id, name')
      .eq('id', item.category_id)
      .maybeSingle()
    if (catRow) category = catRow as { id: number; name: string }
  }

  const mainImage = itemUrl(item.image_path)
  const additionalImages = (item.additional_images ?? []).map(itemUrl)
  const allImages = [mainImage, ...additionalImages]

  // 연결 제품 — href 로부터 이름 lookup (categories + products 둘 다 조회)
  const productHrefs = item.product_hrefs ?? []
  let productLinks: { href: string; name: string }[] = []
  if (productHrefs.length > 0) {
    const nameByHref = new Map<string, string>()

    // categories 의 href 매칭 (예: /wash-stand)
    const { data: catRows } = await supabase
      .from('categories')
      .select('name, href')
      .in('href', productHrefs)
    for (const c of (catRows ?? []) as { name: string; href: string | null }[]) {
      if (c.href) nameByHref.set(c.href, c.name)
    }

    // /products/{id} 형식 → products 테이블에서 이름 조회
    const productIds = productHrefs
      .map((h) => {
        const m = /^\/products\/(\d+)$/.exec(h)
        return m ? Number(m[1]) : null
      })
      .filter((v): v is number => v != null)
    if (productIds.length > 0) {
      const { data: prodRows } = await supabase
        .from('products')
        .select('id, name, model_name')
        .in('id', productIds)
      for (const p of (prodRows ?? []) as {
        id: number
        name: string
        model_name: string | null
      }[]) {
        const label = p.model_name ? `${p.model_name} ${p.name}` : p.name
        nameByHref.set(`/products/${p.id}`, label)
      }
    }

    productLinks = productHrefs.map((href) => ({
      href,
      name: nameByHref.get(href) ?? href,
    }))
  }

  // 이전/다음 사례 — 같은 카테고리 내 (없으면 전체) created_at desc 정렬 기준 인접
  // 비공개(is_active=false) 사례는 prev/next 에서 제외 (직접 URL 진입은 허용)
  const siblingsQuery = supabase
    .from('gallery_items')
    .select('id')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  const { data: siblingsData } = item.category_id
    ? await siblingsQuery.eq('category_id', item.category_id)
    : await siblingsQuery
  const siblings = (siblingsData ?? []) as { id: number }[]
  const myIdx = siblings.findIndex((s) => s.id === itemId)
  const prevId = myIdx > 0 ? siblings[myIdx - 1].id : null
  const nextId = myIdx >= 0 && myIdx < siblings.length - 1 ? siblings[myIdx + 1].id : null

  return (
    <article className="mx-auto max-w-[1440px] px-6 py-10 md:py-14">
      {/* breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-8 flex flex-wrap items-center gap-1.5 text-[0.875rem] text-neutral-500"
      >
        <Link href="/" className="transition hover:text-neutral-900">
          HOME
        </Link>
        <span className="text-neutral-300">›</span>
        <Link href="/construction-cases" className="transition hover:text-neutral-900">
          시공사례
        </Link>
        {category && (
          <>
            <span className="text-neutral-300">›</span>
            <Link
              href={`/construction-cases?category=${category.id}`}
              className="font-medium text-neutral-700 transition hover:text-neutral-900"
            >
              {category.name}
            </Link>
          </>
        )}
      </nav>

      <CaseDetail
        title={item.title}
        description={item.description}
        modelName={item.model_name}
        siteName={item.site_name}
        clientName={item.client_name}
        productLinks={productLinks}
        images={allImages}
        categoryName={category?.name ?? null}
        prevHref={prevId ? `/construction-cases/${prevId}` : null}
        nextHref={nextId ? `/construction-cases/${nextId}` : null}
      />
    </article>
  )
}
