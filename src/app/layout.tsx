import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FloatingButtons, { type QuickMenuView } from '@/components/FloatingButtons'
import PopupSystem from '@/components/popups/PopupSystem'
import { createClient } from '@/lib/supabase/server'
import { resolveIconNode } from '@/lib/quickMenuIconNode'
import type { QuickMenuItem, Popup } from '@/lib/types'

export const metadata: Metadata = {
  title: 'ACEWATER',
  description: '갤러리 + 게시판 + 어드민',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()

  // 퀵메뉴 + 팝업을 병렬 조회. 팝업은 활성 + 노출기간 내인 것만 서버에서 걸러 페이로드 최소화.
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
    <html lang="ko" className="h-full">
      <body className="flex min-h-full flex-col overflow-x-clip bg-white text-black">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingButtons quickMenu={quickMenu} />
        {popups.length > 0 && <PopupSystem popups={popups} />}
      </body>
    </html>
  )
}
