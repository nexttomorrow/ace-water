import FloatingButtons, { type QuickMenuView } from '@/components/FloatingButtons'
import PopupSystem from '@/components/popups/PopupSystem'
import { createClient } from '@/lib/supabase/server'
import { resolveIconNode } from '@/lib/quickMenuIconNode'
import type { QuickMenuItem, Popup } from '@/lib/types'

/**
 * 퀵메뉴 + 팝업. 루트 레이아웃에서 <Suspense> 로 감싸 쓴다.
 *
 * 예전에는 이 두 쿼리를 루트 레이아웃 본문에서 await 했기 때문에,
 * 화면 구석의 플로팅 버튼 데이터를 기다리느라 **모든 페이지의 본문 렌더가 밀렸다**.
 * 별도 컴포넌트로 떼어내면 본문은 즉시 나가고 이 부분만 나중에 스트리밍된다.
 */
export default async function SiteFloating() {
  const supabase = await createClient()

  // 팝업은 활성 + 노출기간 내인 것만 서버에서 걸러 페이로드 최소화.
  const nowIso = new Date().toISOString()
  const [quickMenuRes, popupRes] = await Promise.all([
    supabase
      .from('quick_menu_items')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true }),
    supabase
      .from('popups')
      .select('*')
      .eq('is_active', true)
      .lte('starts_at', nowIso)
      .gte('ends_at', nowIso)
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true }),
  ])

  const quickMenu: QuickMenuView[] = await Promise.all(
    ((quickMenuRes.data ?? []) as QuickMenuItem[]).map(async (it) => ({
      id: it.id,
      title: it.title,
      href: it.href,
      iconNode: await resolveIconNode(it.icon_key),
      external: /^https?:\/\//i.test(it.href),
    }))
  )

  const popups = (popupRes.data ?? []) as Popup[]

  return (
    <>
      <FloatingButtons quickMenu={quickMenu} />
      {popups.length > 0 && <PopupSystem popups={popups} />}
    </>
  )
}
