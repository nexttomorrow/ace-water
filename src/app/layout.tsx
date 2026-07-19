import type { Metadata } from 'next'
import { Suspense } from 'react'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SiteChrome from '@/components/SiteChrome'
import SiteFloating from '@/components/SiteFloating'

export const metadata: Metadata = {
  title: 'ACEWATER',
  description: '갤러리 + 게시판 + 어드민',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="flex min-h-full flex-col overflow-x-clip bg-white text-black">
        {/* 어드민(/mng)에서는 사이트 헤더·푸터·퀵메뉴·팝업을 숨긴다 */}
        <SiteChrome>
          <Header />
        </SiteChrome>
        <main className="flex-1">{children}</main>
        <SiteChrome>
          <Footer />
          {/*
            퀵메뉴/팝업 조회는 본문 렌더를 막지 않도록 Suspense 로 분리.
            레이아웃에서 await 하면 모든 페이지가 이 두 쿼리를 기다리게 된다.
          */}
          <Suspense fallback={null}>
            <SiteFloating />
          </Suspense>
        </SiteChrome>
      </body>
    </html>
  )
}
