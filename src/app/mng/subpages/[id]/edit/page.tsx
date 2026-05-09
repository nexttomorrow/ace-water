import { redirect } from 'next/navigation'

/**
 * 서브페이지 배너 단독 편집 라우트는 폐지되었습니다.
 * 카테고리 통합 편집(/mng/categories/{id}/edit) 의 "서브페이지 배너" 섹션에서 함께 수정합니다.
 */
export default async function EditSubpageBannerRedirect({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/mng/categories/${id}/edit`)
}
