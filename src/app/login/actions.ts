'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * 내부 어드민 계정용 합성 도메인.
 * id 만 입력해도 admin@acewater.local / master@acewater.local 등으로 매핑되어 로그인됨.
 * 일반 이메일 입력은 그대로 통과.
 */
const INTERNAL_DOMAIN = '@acewater.local'

function resolveLoginEmail(input: string): string {
  const v = input.trim()
  if (!v) return v
  if (v.includes('@')) return v
  return `${v.toLowerCase()}${INTERNAL_DOMAIN}`
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  // 'email' 또는 'id' 어느 필드명으로 들어와도 수용
  const raw =
    String(formData.get('email') ?? '').trim() ||
    String(formData.get('id') ?? '').trim()
  const email = resolveLoginEmail(raw)
  const password = String(formData.get('password') ?? '')
  const redirectTo = String(formData.get('redirect') ?? '/mng')

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect(redirectTo || '/mng')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const nickname = String(formData.get('nickname') ?? '').trim()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nickname: nickname || email.split('@')[0] },
    },
  })

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/login?message=' + encodeURIComponent('가입 완료. 로그인해주세요. (이메일 확인이 필요할 수 있어요)'))
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
