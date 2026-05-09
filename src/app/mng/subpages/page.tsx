import { redirect } from 'next/navigation'

/**
 * 서브페이지 배너 관리는 /mng/categories 로 통합되었습니다.
 * 외부 북마크 호환성을 위해 redirect 만 남깁니다.
 */
export default function SubpagesRedirect() {
  redirect('/mng/categories')
}
