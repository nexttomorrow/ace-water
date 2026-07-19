'use client'

import { usePathname } from 'next/navigation'

/**
 * 공개 사이트 전용 크롬(헤더/푸터/퀵메뉴/팝업)을 감싸는 경계.
 *
 * 어드민(/mng)에서는 자체 사이드바를 쓰므로 사이트 GNB·푸터·플로팅 버튼이
 * 같이 뜨면 화면이 겹쳐 보입니다. 팝업까지 어드민 작업 중에 떠서 특히 방해됩니다.
 * 여기서 한 번에 걸러냅니다.
 */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname === '/mng' || pathname.startsWith('/mng/')) return null
  return <>{children}</>
}
