import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { deleteGalleryItem } from '../actions'
import type { GalleryItem } from '@/lib/types'

export const revalidate = 0

export default async function AdminGalleryPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('gallery_items')
    .select('*')
    .order('created_at', { ascending: false })

  const items = (data ?? []) as GalleryItem[]
  const publicUrl = (path: string) =>
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gallery/${path}`

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-12">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">시공사례 관리</h1>
          <p className="mt-1 text-[13px] text-neutral-500">
            <Link href="/construction-cases" target="_blank" className="hover:underline">
              /construction-cases
            </Link>{' '}
            페이지에 노출되는 시공사례를 관리합니다.
          </p>
        </div>
        <Link
          href="/admin/gallery/new"
          className="rounded bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          + 시공사례 추가
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="mt-6 rounded border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          시공사례를 추가해주세요.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item) => {
            const handleDelete = deleteGalleryItem.bind(null, item.id)
            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-lg border border-neutral-200 bg-white"
              >
                <div className="aspect-square">
                  <Image
                    src={publicUrl(item.image_path)}
                    alt={item.title}
                    width={400}
                    height={400}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                </div>
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <div className="mt-2 flex gap-2">
                    <Link
                      href={`/admin/gallery/${item.id}/edit`}
                      className="flex-1 rounded border border-neutral-300 px-2 py-1 text-center text-xs hover:bg-neutral-100"
                    >
                      수정
                    </Link>
                    <form action={handleDelete} className="flex-1">
                      <button
                        type="submit"
                        className="w-full rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                      >
                        삭제
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
