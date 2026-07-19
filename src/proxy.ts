import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Next 16 에서 `middleware` 파일/함수 규약은 `proxy` 로 이름이 바뀌었다 (구 이름 deprecated).
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * 아래를 제외한 모든 경로에서 실행:
     * - _next/static, _next/image, favicon.ico
     * - 확장자가 있는 정적 파일 (이미지 / 폰트 / 문서 등)
     *
     * 폰트·문서 확장자를 추가로 제외해 정적 자산 요청이 프록시를 타지 않게 한다.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff|woff2|ttf|otf|pdf|txt|xml|webmanifest)$).*)',
  ],
}
