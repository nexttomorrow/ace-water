import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductDetail from './ProductDetail'
import type { Product, GalleryItem, ProductComponent } from '@/lib/types'

export const revalidate = 0

const fileUrl = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${path}`

const galleryUrl = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gallery/${path}`

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const itemId = Number(id)
  if (!Number.isFinite(itemId)) notFound()

  const supabase = await createClient()
  const { data: row } = await supabase
    .from('products')
    .select('*')
    .eq('id', itemId)
    .single()
  if (!row) notFound()

  const product = row as Product

  // 카테고리 (breadcrumb / eyebrow)
  let categoryName: string | null = null
  if (product.category_id) {
    const { data: cat } = await supabase
      .from('categories')
      .select('name')
      .eq('id', product.category_id)
      .maybeSingle()
    if (cat) categoryName = (cat as { name: string }).name
  }

  // 연결된 시공사례 — Supabase jsonb contains 가 환경에 따라 까다로워 JS 필터로 안전 처리
  // 비공개(is_active=false) 사례는 제외
  const productHref = `/products/${itemId}`
  const { data: cases } = await supabase
    .from('gallery_items')
    .select('id, title, site_name, image_path, product_hrefs')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const linkedCases = ((cases ?? []) as Array<
    Pick<GalleryItem, 'id' | 'title' | 'site_name' | 'image_path' | 'product_hrefs'>
  >)
    .filter((c) => Array.isArray(c.product_hrefs) && c.product_hrefs.includes(productHref))
    .map((c) => ({
      id: c.id,
      title: c.title,
      siteName: c.site_name ?? null,
      imageUrl: galleryUrl(c.image_path),
    }))

  // 구성품 → 연결된 제품명 lookup
  const components = (product.components ?? []) as ProductComponent[]
  const targetIds = Array.from(
    new Set(
      components
        .map((c) => c.target_id)
        .filter((v): v is number => v != null)
    )
  )
  const targetNameById = new Map<number, string>()
  if (targetIds.length > 0) {
    const { data: targets } = await supabase
      .from('products')
      .select('id, name, model_name')
      .in('id', targetIds)
    for (const t of (targets ?? []) as Array<{
      id: number
      name: string
      model_name: string | null
    }>) {
      targetNameById.set(t.id, t.model_name ? `${t.model_name}` : t.name)
    }
  }
  const componentTags = components.map((c) => ({
    name: c.name,
    targetId: c.target_id,
    targetName: c.target_id ? targetNameById.get(c.target_id) ?? null : null,
  }))

  const mainImage = fileUrl(product.main_image_path)
  const additionalImages = (product.additional_images ?? []).map(fileUrl)
  const allImages = [mainImage, ...additionalImages]
  const specSheetUrl = product.spec_sheet_path ? fileUrl(product.spec_sheet_path) : null

  return (
    <article className="mx-auto max-w-[1440px] px-6 py-8 md:py-12">
      {/* breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex flex-wrap items-center gap-1.5 text-[0.875rem] text-neutral-500"
      >
        <Link href="/" className="transition hover:text-neutral-900">
          HOME
        </Link>
        <span className="text-neutral-300">›</span>
        <span className="font-medium text-neutral-700">제품안내</span>
        {categoryName && (
          <>
            <span className="text-neutral-300">›</span>
            <span className="font-medium text-neutral-700">{categoryName}</span>
          </>
        )}
      </nav>

      <ProductDetail
        product={product}
        categoryName={categoryName}
        images={allImages}
        componentTags={componentTags}
        specSheetUrl={specSheetUrl}
        linkedCases={linkedCases}
      />
    </article>
  )
}
