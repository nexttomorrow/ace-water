import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { fetchProductCategories } from '@/lib/products'
import SubPageBanner from '@/components/SubPageBanner'
import type { Product } from '@/lib/types'

export const revalidate = 0

const fileUrl = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${path}`

type ListItem = Pick<
  Product,
  'id' | 'name' | 'model_name' | 'category_id' | 'main_image_path'
>

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const sp = await searchParams
  const supabase = await createClient()

  const categories = await fetchProductCategories()
  const activeCatId =
    sp.category && sp.category !== 'all' ? Number(sp.category) : null

  let q = supabase
    .from('products')
    .select('id, name, model_name, category_id, main_image_path')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('id', { ascending: false })
  if (activeCatId) q = q.eq('category_id', activeCatId)

  const { data } = await q
  const items = (data ?? []) as ListItem[]

  const activeCat = activeCatId
    ? categories.find((c) => c.id === activeCatId) ?? null
    : null

  // 활성 카테고리에 따라 SubPageBanner 가 카테고리를 찾아낼 href 결정
  const bannerHref = activeCatId ? `/products?category=${activeCatId}` : '/products'

  return (
    <>
      <SubPageBanner
        href={bannerHref}
        fallbackTitle="제품안내"
        fallbackSubtitle="ACEWATER의 제품 라인업을 만나보세요"
      />

      <div className="mx-auto max-w-[1440px] px-6 py-12">
        <div className="mb-5 flex items-center justify-between">
        <p className="text-[13px] text-neutral-500">
          {activeCat ? (
            <>
              <span className="font-semibold text-neutral-900">{activeCat.name}</span>
              {' · '}
            </>
          ) : null}
          총 <span className="font-semibold text-neutral-900">{items.length}</span>개의 제품
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 p-12 text-center text-neutral-500">
          <svg
            className="mx-auto mb-3 h-10 w-10 text-neutral-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
          <p className="text-[14px]">등록된 제품이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 md:grid-cols-4">
          {items.map((p) => (
            <Link key={p.id} href={`/products/${p.id}`} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100">
                <Image
                  src={fileUrl(p.main_image_path)}
                  alt={p.name}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  sizes="(min-width: 768px) 25vw, 50vw"
                />
              </div>
              <div className="mt-4">
                {p.model_name && (
                  <p className="text-[12px] font-bold tracking-tight text-blue-700">
                    {p.model_name}
                  </p>
                )}
                <p className="mt-1 truncate text-[15px] font-semibold text-neutral-900 transition group-hover:text-blue-700">
                  {p.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
      </div>
    </>
  )
}
