import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AdminHome() {
  const supabase = await createClient()
  const [
    { count: galleryCount },
    { count: postCount },
    { count: userCount },
    { count: categoryCount },
  ] = await Promise.all([
    supabase.from('gallery_items').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: '카테고리', count: categoryCount ?? 0, href: '/admin/categories' },
    { label: '갤러리', count: galleryCount ?? 0, href: '/admin/gallery' },
    { label: '게시글', count: postCount ?? 0, href: '/admin/board' },
    { label: '회원', count: userCount ?? 0, href: '/admin' },
  ]

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-12">
      <h1 className="mb-6 text-2xl font-bold">어드민</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-xl border border-neutral-200 bg-white p-5 hover:border-neutral-400"
          >
            <div className="text-[13px] text-neutral-500">{s.label}</div>
            <div className="mt-1 text-3xl font-bold">{s.count}</div>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/admin/categories"
          className="rounded-full bg-black px-4 py-2 text-[13px] font-medium text-white hover:bg-neutral-800"
        >
          카테고리 관리
        </Link>
        <Link
          href="/admin/gallery"
          className="rounded-full border border-neutral-300 px-4 py-2 text-[13px] hover:bg-neutral-100"
        >
          갤러리 관리
        </Link>
        <Link
          href="/admin/board"
          className="rounded-full border border-neutral-300 px-4 py-2 text-[13px] hover:bg-neutral-100"
        >
          게시판 관리
        </Link>
      </div>

      <div className="mt-10 rounded-xl border border-blue-200 bg-blue-50 p-5 text-[13px] text-blue-900">
        <p className="font-semibold">처음이세요?</p>
        <p className="mt-1 leading-6">
          헤더의 GNB(메가메뉴)는 <strong>카테고리</strong> 데이터로 자동 구성됩니다.{' '}
          <Link href="/admin/categories/new" className="underline">
            카테고리 추가
          </Link>{' '}
          에서 상위 카테고리(메뉴 아이템)를 먼저 만들고, 그 아래에 하위 카테고리(타일/링크)를
          등록하세요.
        </p>
      </div>
    </div>
  )
}
