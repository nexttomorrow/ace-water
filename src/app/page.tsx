import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import type { HeroSlide, GalleryItem, Product } from '@/lib/types'
import HeroSlider, { type HeroSliderItem } from '@/components/HeroSlider'
import PortfolioSlider, { type PortfolioItem } from '@/components/PortfolioSlider'
import SectionHeader from '@/components/SectionHeader'
import ClientsMarquee from '@/components/ClientsMarquee'
import ProductCard, { type ProductCardItem } from '@/components/ProductCard'

export const revalidate = 0

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.role === 'admin'
  }

  const [{ data: heroData }, { data: caseData }, { data: productData }] = await Promise.all([
    supabase
      .from('hero_slides')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true }),
    supabase
      .from('gallery_items')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(12),
    // 활성 제품 — 태그별 메인 노출용 (jsonb contains 호환성을 위해 JS 필터)
    supabase
      .from('products')
      .select('id, name, model_name, main_image_path, tags, sort_order, created_at')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false }),
  ])

  const heroSlides = (heroData ?? []) as HeroSlide[]
  const caseItems = (caseData ?? []) as GalleryItem[]
  const allProducts = (productData ?? []) as Pick<
    Product,
    'id' | 'name' | 'model_name' | 'main_image_path' | 'tags'
  >[]

  const productImageUrl = (path: string) =>
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${path}`

  const galleryUrl = (path: string) =>
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gallery/${path}`

  const heroPublicUrl = (path: string) =>
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/hero/${path}`

  const toCardItem = (p: (typeof allProducts)[number]): ProductCardItem => ({
    id: p.id,
    name: p.name,
    modelName: p.model_name,
    imageUrl: productImageUrl(p.main_image_path),
    tags: p.tags ?? [],
  })

  const bestSellerProducts = allProducts
    .filter((p) => Array.isArray(p.tags) && p.tags.includes('best'))
    .slice(0, 5)
    .map(toCardItem)

  const newProductItems = allProducts
    .filter((p) => Array.isArray(p.tags) && p.tags.includes('new'))
    .slice(0, 5)
    .map(toCardItem)

  const fallbackHero: HeroSliderItem[] = [
    {
      key: 'fallback-1',
      src: 'https://picsum.photos/seed/ace-hero-water-1/1920/1080',
      eyebrow: 'ACE WATER',
      title: '깨끗한 물, 더 나은 일상',
    },
    {
      key: 'fallback-2',
      src: 'https://picsum.photos/seed/ace-hero-water-2/1920/1080',
      eyebrow: 'TECHNOLOGY',
      title: '검증된 기술, 신뢰의 약속',
    },
  ]

  const sliderItems: HeroSliderItem[] =
    heroSlides.length > 0
      ? heroSlides.map((s) => ({
          key: String(s.id),
          src: heroPublicUrl(s.image_path),
          eyebrow: s.eyebrow || undefined,
          title: s.title,
        }))
      : fallbackHero

  const placeholder = (seed: string, w = 1200, h = 600) =>
    `https://picsum.photos/seed/${seed}/${w}/${h}`

  // 시공사례: gallery_items 실데이터를 사용, 비어있을 때만 placeholder fallback
  const portfolioItems: PortfolioItem[] =
    caseItems.length > 0
      ? caseItems.map((item) => ({
          key: String(item.id),
          src: galleryUrl(item.image_path),
          title: item.title,
          desc:
            item.site_name ||
            item.model_name ||
            item.description ||
            '시공사례',
          href: `/construction-cases/${item.id}`,
        }))
      : [
          {
            key: 'placeholder-1',
            src: 'https://picsum.photos/seed/ace-portfolio-1/800/600',
            title: '서울 강남 OO 빌딩',
            desc: '오피스 정수 시스템 시공',
            href: '/construction-cases',
          },
          {
            key: 'placeholder-2',
            src: 'https://picsum.photos/seed/ace-portfolio-2/800/600',
            title: '부산 사하 OO 공장',
            desc: '산업용 대용량 정수 설비',
            href: '/construction-cases',
          },
          {
            key: 'placeholder-3',
            src: 'https://picsum.photos/seed/ace-portfolio-3/800/600',
            title: '대구 수성 OO 아파트',
            desc: '단지 전체 미네랄 워터 시스템',
            href: '/construction-cases',
          },
          {
            key: 'placeholder-4',
            src: 'https://picsum.photos/seed/ace-portfolio-4/800/600',
            title: '인천 송도 OO 호텔',
            desc: '객실 정수 솔루션',
            href: '/construction-cases',
          },
        ]

  const solutions = [
    {
      seed: 'ace-solution-1',
      title: '국내 최대 규모',
      desc: '국내 최대 규모 제조공장 및\n자체도색설비 보유',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18" />
          <path d="M5 21V8l5 3V8l5 3V5l4 3v13" />
        </svg>
      ),
    },
    {
      seed: 'ace-solution-2',
      title: '세계 최대 디자인 보유',
      desc: '2000가지 이상의\n환경 제품 디자인 보유',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
      ),
    },
    {
      seed: 'ace-solution-3',
      title: '산업디자인 전문 기업',
      desc: '전문 디자인연구소 보유 &\n디자인등록 다수',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
        </svg>
      ),
    },
    {
      seed: 'ace-solution-4',
      title: '맞춤제작 가능',
      desc: '현장의 목적과\n고객의 니즈에 맞는 컨설팅',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-2.5z" />
        </svg>
      ),
    },
    {
      seed: 'ace-solution-5',
      title: '각종 인증 완료',
      desc: 'KC, ISO 및 벤처기업인증,\n특허, 디자인등록 등',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2 4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
    },
  ]

  return (
    <>
      <div className="relative">
        <HeroSlider slides={sliderItems} />
        {/* 슬라이드 관리 단축 버튼 — 일단 숨김 (필요 시 isAdmin && false → isAdmin 으로 복구) */}
        {isAdmin && false && (
          <Link
            href="/mng/hero"
            className="absolute right-6 top-6 z-30 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-[0.75rem] font-semibold text-neutral-900 shadow-lg backdrop-blur transition hover:bg-white"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z" />
            </svg>
            슬라이드 관리
          </Link>
        )}
      </div>

      {/* PRODUCT SHOWCASE — Best Seller / New Product (실데이터, 태그 기반) */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-[1440px] px-6">
          {/* Best Seller */}
          {bestSellerProducts.length > 0 && (
            <div className="mb-16">
              <SectionHeader
                title="Best Seller"
                desc="가장 많은 사랑을 받은 베스트셀러 제품입니다"
                moreHref="/products?tag=best"
              />
              <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-5">
                {bestSellerProducts.map((p) => (
                  <ProductCard key={p.id} item={p} />
                ))}
              </div>
            </div>
          )}

          {/* New Product */}
          {newProductItems.length > 0 && (
            <div>
              <SectionHeader
                title="New Product"
                desc="새롭게 출시된 ACEWATER의 신제품입니다"
                moreHref="/products?tag=new"
              />
              <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-5">
                {newProductItems.map((p) => (
                  <ProductCard key={p.id} item={p} />
                ))}
              </div>
            </div>
          )}

          {/* 양쪽 다 비어있을 때 — 어드민에게 안내 */}
          {bestSellerProducts.length === 0 && newProductItems.length === 0 && isAdmin && (
            <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-8 text-center text-[0.875rem] text-blue-900">
              <p className="font-semibold">제품 태그 안내</p>
              <p className="mt-1.5 leading-6">
                <Link href="/mng/products" className="underline hover:no-underline">
                  /mng/products
                </Link>
                에서 제품을 등록하고 <strong>BEST</strong> 또는 <strong>NEW</strong>{' '}
                태그를 추가하면 이 영역에 자동으로 노출됩니다.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ACEWATER SOLUTION */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-[1440px] px-6">
          <SectionHeader
            title="Acewater Solution"
            desc="ACEWATER가 제공하는 차별화된 솔루션을 만나보세요"
          />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 md:gap-2">
            {solutions.map((s) => (
              <div
                key={s.seed}
                className="group relative aspect-[3/5] overflow-hidden bg-neutral-300"
              >
                <Image
                  src={placeholder(s.seed, 600, 1000)}
                  alt={s.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />
                <div className="relative z-10 flex h-full flex-col items-center justify-end px-4 pb-10 text-center text-white">
                  <div className="mb-3 text-white/90">{s.icon}</div>
                  <h3 className="mb-3 text-[1rem] font-bold leading-tight md:text-[1.125rem]">
                    {s.title}
                  </h3>
                  <div className="mx-auto mb-3 h-[1px] w-6 bg-white/60" />
                  <p className="whitespace-pre-line text-[0.75rem] leading-relaxed text-white/85">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PORTFOLIO / 시공사례 */}
      <section className="bg-neutral-50 py-28">
        <div className="mx-auto max-w-[1440px] px-6">
          <SectionHeader
            title="시공사례"
            desc="ACEWATER가 함께해온 다양한 현장을 만나보세요"
            moreHref="/construction-cases"
          />
        </div>
        <PortfolioSlider items={portfolioItems} />
      </section>

      {/* CLIENTS / 고객사 */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-[1440px] px-6">
          <SectionHeader
            title="고객사"
            desc="ACEWATER와 함께하는 신뢰의 파트너입니다"
          />
        </div>
        <ClientsMarquee />
      </section>

    </>
  )
}
