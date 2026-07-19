import AdminHeader from './AdminHeader'
import AdminNav from './AdminNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminNav />
      {/*
        사이드바는 fixed 라 본문을 그만큼 밀어준다.
        폭은 --admin-nav-w (globals.css) — AdminNav 가 html[data-admin-nav] 를 토글하면
        CSS 변수만 바뀌므로 리렌더 없이 본문 여백이 따라온다.
      */}
      <div className="transition-[padding] duration-200 ease-out lg:pl-[var(--admin-nav-w)]">
        <AdminHeader />
        <main>{children}</main>
      </div>
    </div>
  )
}
