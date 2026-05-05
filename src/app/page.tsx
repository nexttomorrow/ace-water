import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import type { HeroSlide } from '@/lib/types'
import HeroSlider, { type HeroSliderItem } from '@/components/HeroSlider'
import PortfolioSlider, { type PortfolioItem } from '@/components/PortfolioSlider'
import SectionHeader from '@/components/SectionHeader'
import ClientsMarquee from '@/components/ClientsMarquee'

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

  const { data: heroData } = await supabase
    .from('hero_slides')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true })

  const heroSlides = (heroData ?? []) as HeroSlide[]

  const heroPublicUrl = (path: string) =>
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/hero/${path}`

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

  const bestSellers = [
    { seed: 'ace-best-1', model: 'AW-100', name: '정수기' },
    { seed: 'ace-best-2', model: 'AW-200', name: '연수기' },
    { seed: 'ace-best-3', model: 'AW-300', name: '냉온정수기' },
    { seed: 'ace-best-4', model: 'AW-400', name: '필터 시스템' },
    { seed: 'ace-best-5', model: 'AW-500', name: '산업용 정수' },
  ]

  const newProducts = [
    { seed: 'ace-new-1', model: 'AW-N01', name: '신제품 정수기' },
    { seed: 'ace-new-2', model: 'AW-N02', name: '소형 정수기' },
    { seed: 'ace-new-3', model: 'AW-N03', name: '대용량 정수기' },
    { seed: 'ace-new-4', model: 'AW-N04', name: '미네랄 필터' },
    { seed: 'ace-new-5', model: 'AW-N05', name: '스마트 정수' },
  ]

  const portfolioItems: PortfolioItem[] = [
    {
      key: 'ace-portfolio-1',
      src: 'https://picsum.photos/seed/ace-portfolio-1/800/600',
      title: '서울 강남 OO 빌딩',
      desc: '오피스 정수 시스템 시공',
      href: '/portfolio',
    },
    {
      key: 'ace-portfolio-2',
      src: 'https://picsum.photos/seed/ace-portfolio-2/800/600',
      title: '부산 사하 OO 공장',
      desc: '산업용 대용량 정수 설비',
      href: '/portfolio',
    },
    {
      key: 'ace-portfolio-3',
      src: 'https://picsum.photos/seed/ace-portfolio-3/800/600',
      title: '대구 수성 OO 아파트',
      desc: '단지 전체 미네랄 워터 시스템',
      href: '/portfolio',
    },
    {
      key: 'ace-portfolio-4',
      src: 'https://picsum.photos/seed/ace-portfolio-4/800/600',
      title: '인천 송도 OO 호텔',
      desc: '객실 정수 솔루션',
      href: '/portfolio',
    },
    {
      key: 'ace-portfolio-5',
      src: 'https://picsum.photos/seed/ace-portfolio-5/800/600',
      title: '광주 OO 종합병원',
      desc: '의료용 정수 시스템',
      href: '/portfolio',
    },
    {
      key: 'ace-portfolio-6',
      src: 'https://picsum.photos/seed/ace-portfolio-6/800/600',
      title: '대전 OO 학교',
      desc: '교내 직수형 정수기 시공',
      href: '/portfolio',
    },
    {
      key: 'ace-portfolio-7',
      src: 'https://picsum.photos/seed/ace-portfolio-7/800/600',
      title: '제주 OO 리조트',
      desc: '풀빌라 정수 솔루션',
      href: '/portfolio',
    },
    {
      key: 'ace-portfolio-8',
      src: 'https://picsum.photos/seed/ace-portfolio-8/800/600',
      title: '울산 OO 산업단지',
      desc: '공정수 시스템 구축',
      href: '/portfolio',
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
        {isAdmin && (
          <Link
            href="/admin/hero"
            className="absolute right-6 top-6 z-30 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-[12px] font-semibold text-neutral-900 shadow-lg backdrop-blur transition hover:bg-white"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z" />
            </svg>
            슬라이드 관리
          </Link>
        )}
      </div>

      {/* PRODUCT SHOWCASE — Best Seller / New Product */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-[1440px] px-6">
          {/* Best Seller */}
          <div className="mb-16">
            <SectionHeader
              title="Best Seller"
              desc="가장 많은 사랑을 받은 베스트셀러 제품입니다"
            />
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-5">
              {bestSellers.map((p) => (
                <Link
                  key={p.seed}
                  href="#"
                  className="group block"
                >
                  <div className="relative aspect-square overflow-hidden bg-neutral-100">
                    <Image
                      src={placeholder(p.seed, 600, 600)}
                      alt={p.name}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      unoptimized
                    />
                  </div>
                  <div className="mt-4">
                    <p className="text-[13px] font-bold text-neutral-900">{p.model}</p>
                    <p className="mt-1 text-[12px] text-neutral-600">{p.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* New Product */}
          <div>
            <SectionHeader
              title="New Product"
              desc="새롭게 출시된 ACEWATER의 신제품입니다"
            />
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-5">
              {newProducts.map((p) => (
                <Link
                  key={p.seed}
                  href="#"
                  className="group block"
                >
                  <div className="relative aspect-square overflow-hidden bg-neutral-100">
                    <Image
                      src={placeholder(p.seed, 600, 600)}
                      alt={p.name}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      unoptimized
                    />
                    <span className="absolute left-3 top-3 z-10 rounded-full bg-neutral-900 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-white">NEW</span>
                  </div>
                  <div className="mt-4">
                    <p className="text-[13px] font-bold text-neutral-900">{p.model}</p>
                    <p className="mt-1 text-[12px] text-neutral-600">{p.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
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
                  <h3 className="mb-3 text-[16px] font-bold leading-tight md:text-[18px]">
                    {s.title}
                  </h3>
                  <div className="mx-auto mb-3 h-[1px] w-6 bg-white/60" />
                  <p className="whitespace-pre-line text-[12px] leading-relaxed text-white/85">
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
            moreHref="/portfolio"
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
