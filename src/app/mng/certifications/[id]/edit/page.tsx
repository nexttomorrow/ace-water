import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateCertification } from '../../../actions'
import OptimizedImageInput from '@/components/OptimizedImageInput'
import type { Certification } from '@/lib/types'

export default async function EditCertificationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const certId = Number(id)
  if (!Number.isFinite(certId)) notFound()

  const supabase = await createClient()
  const { data } = await supabase
    .from('certifications')
    .select('*')
    .eq('id', certId)
    .single()
  if (!data) notFound()
  const cert = data as Certification

  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/certifications/${cert.image_path}`
  const action = updateCertification.bind(null, certId)

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <h1 className="mb-5 text-2xl font-bold">인증서 수정</h1>

      {sp.error && (
        <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</p>
      )}

      <div className="mb-4 overflow-hidden rounded border border-neutral-200 bg-neutral-50">
        <Image
          src={publicUrl}
          alt={cert.title}
          width={600}
          height={800}
          className="mx-auto h-auto w-full max-w-[280px]"
          unoptimized
        />
      </div>

      <form action={action} className="flex flex-col gap-3">
        <label className="flex flex-col text-sm">
          타이틀
          <input
            name="title"
            required
            defaultValue={cert.title}
            className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
          />
        </label>
        <label className="flex flex-col text-sm">
          서브타이틀 (선택)
          <input
            name="subtitle"
            defaultValue={cert.subtitle}
            className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
          />
        </label>
        <label className="flex flex-col text-sm">
          정렬 순서
          <input
            name="sort_order"
            type="number"
            defaultValue={cert.sort_order}
            className="mt-1 rounded border border-neutral-300 bg-white px-3 py-2"
          />
        </label>
        <label className="flex flex-col text-sm">
          이미지 교체 (선택)
          <OptimizedImageInput
            name="image"
            maxWidth={1600}
            maxHeight={2200}
            quality={88}
            className="mt-1"
          />
        </label>

        <div className="mt-2 flex gap-2">
          <button
            type="submit"
            className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            저장
          </button>
          <Link
            href="/mng/certifications"
            className="rounded border border-neutral-300 bg-white px-4 py-2 text-sm hover:bg-neutral-100"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  )
}
