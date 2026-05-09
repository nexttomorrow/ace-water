import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CaseCategoryForm from '@/components/CaseCategoryForm'
import { updateCaseCategory } from '../../../../actions'
import type { ConstructionCaseCategory } from '@/lib/types'

export default async function EditCaseCategoryPage({
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
  const { data } = await supabase
    .from('construction_case_categories')
    .select('*')
    .eq('id', catId)
    .single()
  if (!data) notFound()

  const action = updateCaseCategory.bind(null, catId)

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <h1 className="mb-6 text-2xl font-bold">시공사례 카테고리 수정</h1>
      <CaseCategoryForm
        action={action}
        initial={data as ConstructionCaseCategory}
        errorMessage={sp.error}
        submitLabel="저장"
        cancelHref="/mng/gallery/categories"
      />
    </div>
  )
}
