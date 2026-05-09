import { createClient } from '@/lib/supabase/server'
import type { Tag, TagScope } from '@/lib/types'

/**
 * 활성화된 태그 목록을 scope 별로 조회.
 * sort_order → id 순으로 정렬.
 */
export async function fetchTags(scope: TagScope, includeInactive = false): Promise<Tag[]> {
  const supabase = await createClient()
  let q = supabase.from('tags').select('*').eq('scope', scope)
  if (!includeInactive) q = q.eq('is_active', true)
  const { data } = await q
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true })
  return (data ?? []) as Tag[]
}

/**
 * value → Tag lookup map. 디스플레이 컴포넌트에서 빠르게 라벨/톤 조회용.
 */
export function buildTagMap(tags: Tag[]): Map<string, Tag> {
  const m = new Map<string, Tag>()
  for (const t of tags) m.set(t.value, t)
  return m
}
