import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CaseForm from '@/components/CaseForm'
import { updateGalleryItem } from '../../../actions'
import { fetchProductOptions } from '@/lib/products'
import type { GalleryItem, ConstructionCaseCategory } from '@/lib/types'

export default async function EditGalleryItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const itemId = Number(id)
  if (!Number.isFinite(itemId)) notFound()

  const supabase = await createClient()
  const { data: item } = await supabase
    .from('gallery_items')
    .select('*')
    .eq('id', itemId)
    .single()
  if (!item) notFound()

  const [{ data: catData }, products] = await Promise.all([
    supabase
      .from('construction_case_categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true }),
    fetchProductOptions(),
  ])
  const categories = (catData ?? []) as ConstructionCaseCategory[]

  const cs = item as GalleryItem
  const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gallery/`
  const imageUrl = cs.image_path ? `${base}${cs.image_path}` : null
  const additional = (cs.additional_images ?? []).map((p) => ({
    path: p,
    url: `${base}${p}`,
  }))
  const action = updateGalleryItem.bind(null, itemId)

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-1 text-2xl font-bold">시공사례 수정</h1>
      <p className="mb-6 text-[13px] text-neutral-500">{cs.title}</p>
      <CaseForm
        action={action}
        categories={categories}
        products={products}
        initial={cs}
        errorMessage={sp.error}
        submitLabel="저장"
        cancelHref="/admin/gallery"
        imageUrl={imageUrl}
        additional={additional}
      />
    </div>
  )
}
