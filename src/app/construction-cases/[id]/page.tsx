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

  // 연결 제품 — href 로부터 이름 lookup
  const productHrefs = item.product_hrefs ?? []
  let productLinks: { href: string; name: string }[] = []
  if (productHrefs.length > 0) {
    const { data: prodData } = await supabase
      .from('categories')
      .select('name, href')
      .in('href', productHrefs)
    const nameByHref = new Map<string, string>(
      (prodData ?? []).map((p: { name: string; href: string | null }) => [
        p.href ?? '',
        p.name,
      ])
    )
    productLinks = productHrefs.map((href) => ({
      href,
      name: nameByHref.get(href) ?? href,
    }))
  }

  return (
    <article className="mx-auto max-w-[1440px] px-6 py-10 md:py-14">
      {/* breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-8 flex flex-wrap items-center gap-1.5 text-[13px] text-neutral-500"
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
      />
    </article>
  )
}
