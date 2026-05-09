/**
 * 메인 페이지·제품 리스트 등 어디서나 재사용 가능한 제품 카드.
 * - 이미지 hover 시 부드러운 zoom
 * - 태그 배지 (NEW/BEST/PICK 등) 좌상단 노출 (최대 1개)
 * - 클릭 시 /products/{id} 상세로 이동
 */

import Image from 'next/image'
import Link from 'next/link'
import { PRODUCT_TAG_BY_VALUE } from '@/lib/types'

export type ProductCardItem = {
  id: number
  name: string
  modelName: string | null
  imageUrl: string
  tags?: string[]
}

const BADGE_TONE: Record<string, string> = {
  blue: 'bg-blue-600 text-white',
  red: 'bg-red-600 text-white',
  amber: 'bg-amber-500 text-white',
  neutral: 'bg-neutral-900 text-white',
}

/**
 * 우선순위 — 카드에 표시할 단일 태그 결정.
 * (여러 태그가 있어도 가장 강조할 하나만 보여 카드가 시끄럽지 않게)
 */
const TAG_PRIORITY = ['best', 'new', 'recommended', 'featured']

function pickPrimaryTag(tags: string[] | undefined) {
  if (!tags || tags.length === 0) return null
  for (const t of TAG_PRIORITY) {
    if (tags.includes(t)) return PRODUCT_TAG_BY_VALUE[t] ?? null
  }
  return null
}

export default function ProductCard({ item }: { item: ProductCardItem }) {
  const tag = pickPrimaryTag(item.tags)

  return (
    <Link href={`/products/${item.id}`} className="group block">
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          unoptimized
          sizes="(min-width: 768px) 20vw, 50vw"
        />

        {tag && (
          <span
            className={`absolute left-3 top-3 z-10 rounded-full px-2.5 py-0.5 text-[0.75rem] font-bold tracking-wider ${
              BADGE_TONE[tag.tone] ?? BADGE_TONE.neutral
            }`}
          >
            {tag.label}
          </span>
        )}
      </div>
      <div className="mt-4">
        {item.modelName && (
          <p className="text-[0.875rem] font-bold text-neutral-900">{item.modelName}</p>
        )}
        <p
          className={`text-[0.75rem] text-neutral-600 transition group-hover:text-blue-700 ${
            item.modelName ? 'mt-1' : 'font-bold text-neutral-900'
          }`}
        >
          {item.name}
        </p>
      </div>
    </Link>
  )
}
