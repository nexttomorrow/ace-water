import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CategoryForm from '@/components/CategoryForm'
import { updateCategory } from '../../../actions'
import type { Category } from '@/lib/types'

export default async function EditCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const catId = Number(id)
  if (!Number.isFinite(catId)) notFound()

  const supabase = await createClient()
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('id', catId)
    .single()

  if (!category) notFound()

  const { data: tops } = await supabase
    .from('categories')
    .select('id, name')
    .is('parent_id', null)
    .neq('id', catId)
    .order('sort_order', { ascending: true })

  const action = updateCategory.bind(null, catId)

  const cat = category as Category
  const imageUrl = cat.image_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/categories/${cat.image_path}`
    : null
  const bannerImageUrl = cat.banner_image_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/category-banners/${cat.banner_image_path}`
    : null

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <h1 className="mb-6 text-2xl font-bold">카테고리 수정</h1>
      <CategoryForm
        action={action}
        topLevelOptions={tops ?? []}
        initial={cat}
        errorMessage={sp.error}
        submitLabel="저장"
        cancelHref="/mng/categories"
        imageUrl={imageUrl}
        showRemoveImage={!!cat.image_path}
        bannerImageUrl={bannerImageUrl}
        showRemoveBannerImage={!!cat.banner_image_path}
      />
    </div>
  )
}
