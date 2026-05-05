import { createClient } from '@/lib/supabase/server'
import CategoryForm from '@/components/CategoryForm'
import { createCategory } from '../../actions'

export default async function NewCategoryPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const sp = await searchParams
  const supabase = await createClient()

  const { data: tops } = await supabase
    .from('categories')
    .select('id, name')
    .is('parent_id', null)
    .order('sort_order', { ascending: true })

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <h1 className="mb-6 text-2xl font-bold">카테고리 추가</h1>
      <CategoryForm
        action={createCategory}
        topLevelOptions={tops ?? []}
        errorMessage={sp.error}
        submitLabel="등록"
        cancelHref="/admin/categories"
      />
    </div>
  )
}
