import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SubPageBanner from '@/components/SubPageBanner'
import type { Category } from '@/lib/types'

export const revalidate = 0

/**
 * 카테고리에 등록된 href URL이지만 전용 페이지 파일이 없을 때 자동으로 처리되는 캐치올 페이지.
 * Next.js는 정적 라우트(/board, /mng 등)를 캐치올보다 우선해서 매칭하므로 안전.
 *
 * 동작:
 * - 현재 pathname을 categories.href에서 찾아본다
 * - 있으면 SubPageBanner 렌더 + 콘텐츠 자리 표시
 * - 없으면 404
 */
export default async function CatchAllSubPage({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params
  const pathname = '/' + slug.join('/')

  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('href', pathname)
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle()

  const cat = data as Category | null
  if (!cat) notFound()

  return (
    <>
      <SubPageBanner
        href={pathname}
        fallbackTitle={cat.name}
        fallbackSubtitle={cat.description ?? ''}
      />

      <div className="mx-auto max-w-[1440px] px-6 py-12">
        <p className="rounded-lg border border-dashed border-neutral-300 p-12 text-center text-neutral-500">
          {cat.name} 콘텐츠 영역 (준비 중)
        </p>
      </div>
    </>
  )
}
