import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import type { GalleryItem } from '@/lib/types'
import PageHeader from '@/components/PageHeader'

export const revalidate = 0

export default async function GalleryPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('gallery_items')
    .select('*')
    .order('created_at', { ascending: false })

  const items = (data ?? []) as GalleryItem[]
  const publicUrl = (path: string) =>
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gallery/${path}`

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-12">
      <PageHeader href="/gallery" fallbackTitle="갤러리" />

      <div className="mb-5 mt-10 flex items-center justify-between">
        <p className="text-[13px] text-neutral-500">
          총 <span className="font-semibold text-neutral-900">{items.length}</span>개의 이미지
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error.message}</p>
      )}

      {items.length === 0 ? (
        <p className="rounded border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          아직 등록된 이미지가 없어요.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item) => (
            <figure
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
              <figcaption className="px-3 py-2">
                <p className="truncate text-sm font-medium">{item.title}</p>
                {item.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-neutral-500">{item.description}</p>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  )
}
