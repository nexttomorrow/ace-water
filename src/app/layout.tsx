import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FloatingButtons, { type QuickMenuView } from '@/components/FloatingButtons'
import { createClient } from '@/lib/supabase/server'
import { resolveIconNode } from '@/lib/quickMenuIconNode'
import type { QuickMenuItem } from '@/lib/types'

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
  const { data } = await supabase
    .from('quick_menu_items')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true })

  const quickMenu: QuickMenuView[] = await Promise.all(
    ((data ?? []) as QuickMenuItem[]).map(async (it) => ({
      id: it.id,
      title: it.title,
      href: it.href,
      iconNode: await resolveIconNode(it.icon_key),
      external: /^https?:\/\//i.test(it.href),
    }))
  )

  return (
    <html lang="ko" className="h-full">
      <body className="flex min-h-full flex-col overflow-x-clip bg-white text-black">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingButtons quickMenu={quickMenu} />
      </body>
    </html>
  )
}
