import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

export type Viewer = {
  id: string
  email: string | null
  nickname: string | null
  isAdmin: boolean
} | null

/**
 * 요청 단위로 캐시되는 로그인 사용자 정보.
 *
 * 기존에는 Header(루트 레이아웃)와 각 page.tsx 가 따로 `auth.getUser()` +
 * profiles 조회를 돌려서, 한 번 페이지를 여는 데 인증 왕복이 2~3번 발생했습니다
 * (측정: 각 ~90ms). React `cache` 로 감싸면 같은 렌더 패스 안에서는
 * 몇 번을 호출해도 실제 네트워크 요청은 1회입니다.
 *
 * 주의: 캐시 범위는 "한 번의 서버 렌더" 입니다. 요청 간에는 공유되지 않으므로
 * 사용자별 정보가 섞일 위험은 없습니다.
 */
export const getViewer = cache(async (): Promise<Viewer> => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, nickname')
    .eq('id', user.id)
    .single()

  return {
    id: user.id,
    email: user.email ?? null,
    nickname: profile?.nickname ?? null,
    isAdmin: profile?.role === 'admin',
  }
})
