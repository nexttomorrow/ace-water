import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TagForm from '@/components/TagForm'
import { updateTag } from '../../actions'
import type { Tag } from '@/lib/types'

export default async function EditTagPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const tagId = Number(id)
  if (!Number.isFinite(tagId)) notFound()

  const supabase = await createClient()
  const { data } = await supabase.from('tags').select('*').eq('id', tagId).single()
  if (!data) notFound()

  const tag = data as Tag
  const action = updateTag.bind(null, tagId)

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-6 text-2xl font-bold">태그 수정</h1>
      <TagForm
        action={action}
        initial={tag}
        errorMessage={sp.error}
        submitLabel="저장"
        cancelHref={`/mng/tags?scope=${tag.scope}`}
      />
    </div>
  )
}
