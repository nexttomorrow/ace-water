import { createClient } from '@/lib/supabase/server'

type Props = {
  /** 현재 페이지 경로 — categories.href와 매칭됩니다 */
  href: string
  /** 카테고리에 매칭되는 항목이 없을 때 사용할 기본 제목 */
  fallbackTitle: string
  /** 카테고리에 description이 없을 때 사용할 기본 설명 */
  fallbackDescription?: string
}

export default async function PageHeader({
  href,
  fallbackTitle,
  fallbackDescription,
}: Props) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('name, description')
    .eq('href', href)
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle()

  const title = data?.name ?? fallbackTitle
  const description = data?.description ?? fallbackDescription ?? ''

  return (
    <div className="text-center">
      <h1 className="text-[1.75rem] font-bold leading-tight md:text-[2.25rem]">{title}</h1>
      <div className="mx-auto mt-3 h-[2px] w-10 bg-neutral-900" />
      {description && (
        <p className="mt-4 text-[0.875rem] text-neutral-500">{description}</p>
      )}
    </div>
  )
}
