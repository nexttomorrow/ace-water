import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * 세션 쿠키가 하나라도 있는지 (네트워크 없이 판정).
 * @supabase/ssr 은 `sb-<ref>-auth-token` (길면 `.0`, `.1` 청크) 로 저장한다.
 */
function hasSessionCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some((c) => /^sb-.+-auth-token(\.\d+)?$/.test(c.name))
}

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname

  // /signup 차단 — 인증 조회가 필요 없다
  if (path === '/signup') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // /login 은 /mng 로 돌아가는 경우에만 — 역시 인증 조회 불필요
  if (path === '/login') {
    const redirectParam = request.nextUrl.searchParams.get('redirect') ?? ''
    if (!redirectParam.startsWith('/mng')) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  const requiresAuth =
    path.startsWith('/mng') ||
    path.startsWith('/board/new') ||
    /^\/board\/\d+\/edit$/.test(path)

  // 쿠키가 없으면 확실히 비로그인 → Supabase 왕복(~90ms)을 통째로 건너뛴다.
  // 공개 페이지 트래픽 대부분이 여기에 해당한다.
  if (!hasSessionCookie(request)) {
    if (requiresAuth) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', path)
      return NextResponse.redirect(url)
    }
    return NextResponse.next({ request })
  }

  // 여기부터는 세션이 있는 경우 — 토큰 갱신을 위해 실제로 조회한다.
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (requiresAuth && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }

  // admin gate
  if (path.startsWith('/mng') && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return response
}
