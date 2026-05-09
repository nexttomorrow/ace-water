import TagForm from '@/components/TagForm'
import { createTag } from '../actions'
import type { TagScope } from '@/lib/types'

export default async function NewTagPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; scope?: string }>
}) {
  const sp = await searchParams
  const initialScope = (sp.scope as TagScope) || 'product'

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-6 text-2xl font-bold">태그 추가</h1>
      <TagForm
        action={createTag}
        initial={{ scope: initialScope, tone: 'neutral', is_active: true, sort_order: 0 }}
        errorMessage={sp.error}
        submitLabel="등록"
        cancelHref={`/mng/tags?scope=${initialScope}`}
      />
    </div>
  )
}
