import CaseCategoryForm from '@/components/CaseCategoryForm'
import { createCaseCategory } from '../../../actions'

export default async function NewCaseCategoryPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const sp = await searchParams
  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <h1 className="mb-6 text-2xl font-bold">시공사례 카테고리 추가</h1>
      <CaseCategoryForm
        action={createCaseCategory}
        errorMessage={sp.error}
        submitLabel="등록"
        cancelHref="/mng/gallery/categories"
      />
    </div>
  )
}
