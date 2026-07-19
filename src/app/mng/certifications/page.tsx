import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { deleteCertification } from '../actions'
import { CERTIFICATIONS_INITIAL_VISIBLE, type Certification } from '@/lib/types'

export const revalidate = 0

export default async function AdminCertificationsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('certifications')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true })

  const items = (data ?? []) as Certification[]
  const publicUrl = (path: string) =>
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/certifications/${path}`

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-12">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">인증서 관리</h1>
        <Link
          href="/mng/certifications/new"
          className="rounded bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          + 인증서 추가
        </Link>
      </div>
      <p className="mb-6 text-[0.875rem] text-neutral-500">
        회사소개 페이지 하단의 인증서 섹션을 관리해요. 정렬값(작은 숫자가 먼저)으로 노출 순서를
        정할 수 있고, {CERTIFICATIONS_INITIAL_VISIBLE}개까지는 바로 보이며 그 이상은
        &lsquo;더보기&rsquo;로 접혀요.
      </p>

      {items.length === 0 ? (
        <p className="rounded border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          등록된 인증서가 없어요. 첫 인증서를 추가해보세요.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((item, i) => {
            const handleDelete = deleteCertification.bind(null, item.id)
            const foldedHere = i === CERTIFICATIONS_INITIAL_VISIBLE
            return (
              <div
                key={item.id}
                className={
                  'overflow-hidden rounded-lg border bg-white ' +
                  (i >= CERTIFICATIONS_INITIAL_VISIBLE
                    ? 'border-dashed border-neutral-300'
                    : 'border-neutral-200')
                }
              >
                <div className="relative aspect-[3/4] bg-neutral-100">
                  <Image
                    src={publicUrl(item.image_path)}
                    alt={item.title}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                  <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-[0.75rem] font-semibold text-white">
                    #{item.sort_order}
                  </span>
                  {foldedHere && (
                    <span className="absolute right-2 top-2 rounded bg-amber-500 px-2 py-0.5 text-[0.6875rem] font-semibold text-white">
                      더보기부터
                    </span>
                  )}
                </div>
                <div className="px-3 py-3">
                  <p className="line-clamp-2 text-[0.9375rem] font-bold leading-snug">
                    {item.title}
                  </p>
                  {item.subtitle && (
                    <p className="mt-1 line-clamp-2 text-[0.75rem] text-neutral-500">
                      {item.subtitle}
                    </p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <Link
                      href={`/mng/certifications/${item.id}/edit`}
                      className="flex-1 rounded border border-neutral-300 px-2 py-1.5 text-center text-xs hover:bg-neutral-100"
                    >
                      수정
                    </Link>
                    <form action={handleDelete} className="flex-1">
                      <button
                        type="submit"
                        className="w-full rounded border border-red-300 px-2 py-1.5 text-xs text-red-700 hover:bg-red-50"
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
