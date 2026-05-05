import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import type { GalleryItem, HeroSlide, Post } from '@/lib/types'
import HeroSlider, { type HeroSliderItem } from '@/components/HeroSlider'
import PortfolioSlider, { type PortfolioItem } from '@/components/PortfolioSlider'

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

  const [{ data: gallery }, { data: posts }, { data: heroData }] = await Promise.all([
    supabase
      .from('gallery_items')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('posts')
      .select('id, title, created_at, author_id')
      .order('created_at', { ascending: false })
      .limit(4),
    supabase
      .from('hero_slides')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true }),
  ])

  const items = (gallery ?? []) as GalleryItem[]
  const recentPosts = (posts ?? []) as Pick<Post, 'id' | 'title' | 'created_at' | 'author_id'>[]
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

  const publicUrl = (path: string) =>
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gallery/${path}`

  const placeholder = (seed: string, w = 1200, h = 600) =>
    `https://picsum.photos/seed/${seed}/${w}/${h}`

  const featureCards = [
    { seed: 'jasper-feature-1', title: '새로운 컬렉션', sub: '봄을 여는 첫 번째 이야기', cta: '둘러보기' },
    { seed: 'jasper-feature-2', title: '에디터스 픽', sub: '큐레이터가 선정한 작품', cta: '자세히' },
    { seed: 'jasper-feature-3', title: '한정 프로모션', sub: '이번 주만 만나는 혜택', cta: '바로가기' },
  ]

  const promoTiles = [
    { seed: 'jasper-tile-1', label: '갤러리', href: '/gallery' },
    { seed: 'jasper-tile-2', label: '게시판', href: '/board' },
    { seed: 'jasper-tile-3', label: '공지', href: '/board' },
    { seed: 'jasper-tile-4', label: '이벤트', href: '#' },
  ]

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
            <div className="mb-8 text-center">
              <h2 className="text-[26px] font-bold tracking-tight md:text-[30px]">Best Seller</h2>
              <div className="mx-auto mt-3 h-[2px] w-10 bg-neutral-900" />
            </div>
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
            <div className="mb-8 text-center">
              <h2 className="text-[26px] font-bold tracking-tight md:text-[30px]">New Product</h2>
              <div className="mx-auto mt-3 h-[2px] w-10 bg-neutral-900" />
            </div>
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
          <div className="mb-10 text-center">
            <h2 className="text-[26px] font-bold tracking-tight md:text-[30px]">
              Acewater Solution
            </h2>
            <div className="mx-auto mt-3 h-[2px] w-10 bg-neutral-900" />
            <p className="mt-4 text-[14px] text-neutral-500">
              ACEWATER가 제공하는 차별화된 솔루션을 만나보세요
            </p>
          </div>

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
        <div className="mx-auto mb-12 flex max-w-[1440px] items-end justify-between px-6">
          <h2 className="text-[28px] font-bold tracking-tight md:text-[36px]">시공사례</h2>
          <Link
            href="/portfolio"
            className="text-[14px] font-medium text-neutral-500 transition hover:text-black"
          >
            + 더보기
          </Link>
        </div>
        <PortfolioSlider items={portfolioItems} />
      </section>

      {/* FEATURE CARDS */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-[1440px] px-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {featureCards.map((c) => (
              <Link
                key={c.seed}
                href="/gallery"
                className="group relative h-[420px] overflow-hidden rounded-2xl bg-neutral-200"
              >
                <Image
                  src={placeholder(c.seed, 800, 1000)}
                  alt={c.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <p className="mb-1 text-[12px] tracking-wider opacity-90">{c.sub}</p>
                  <h3 className="mb-3 text-[24px] font-bold leading-tight">{c.title}</h3>
                  <span className="inline-flex items-center gap-1 text-[13px] font-medium opacity-90 group-hover:opacity-100">
                    {c.cta}
                    <span aria-hidden>→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PROMO TILES */}
      <section className="bg-neutral-50 py-16">
        <div className="mx-auto max-w-[1440px] px-6">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-[28px] font-bold leading-tight md:text-[32px]">
                어디서나, 가까이
              </h2>
              <p className="mt-2 text-[14px] text-neutral-600">
                관심 있는 영역으로 바로 이동하세요.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {promoTiles.map((t) => (
              <Link
                key={t.seed}
                href={t.href}
                className="group relative aspect-square overflow-hidden rounded-xl bg-white"
              >
                <Image
                  src={placeholder(t.seed, 600, 600)}
                  alt={t.label}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/15 transition group-hover:bg-black/25" />
                <span className="absolute inset-x-0 bottom-0 p-4 text-[16px] font-bold text-white">
                  {t.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY PREVIEW */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-[1440px] px-6">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="mb-2 text-[12px] font-medium tracking-widest text-neutral-500">
                GALLERY
              </p>
              <h2 className="text-[28px] font-bold leading-tight md:text-[32px]">
                최근 등록된 작품
              </h2>
            </div>
            <Link
              href="/gallery"
              className="hidden text-[14px] font-medium text-neutral-700 hover:text-black md:inline"
            >
              전체 보기 →
            </Link>
          </div>

          {items.length === 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="relative aspect-[4/5] overflow-hidden rounded-xl bg-neutral-100"
                >
                  <Image
                    src={placeholder(`gallery-skel-${i}`, 600, 750)}
                    alt=""
                    fill
                    className="object-cover opacity-90"
                    unoptimized
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/40 to-transparent p-4">
                    <p className="text-[14px] font-semibold text-white">샘플 이미지</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href="/gallery"
                  className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-neutral-100"
                >
                  <Image
                    src={publicUrl(item.image_path)}
                    alt={item.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-4">
                    <p className="line-clamp-1 text-[14px] font-semibold text-white">
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="line-clamp-1 text-[12px] text-white/85">
                        {item.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link
              href="/gallery"
              className="inline-block rounded-full border border-neutral-300 px-5 py-2 text-[13px] font-medium hover:border-black"
            >
              전체 보기
            </Link>
          </div>
        </div>
      </section>

      {/* NEWS / RECENT POSTS */}
      <section className="bg-neutral-50 py-16">
        <div className="mx-auto max-w-[1440px] px-6">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="mb-2 text-[12px] font-medium tracking-widest text-neutral-500">
                NEWS
              </p>
              <h2 className="text-[28px] font-bold leading-tight md:text-[32px]">
                새로운 소식
              </h2>
            </div>
            <Link
              href="/board"
              className="text-[14px] font-medium text-neutral-700 hover:text-black"
            >
              게시판 →
            </Link>
          </div>

          {recentPosts.length === 0 ? (
            <p className="rounded-xl border border-dashed border-neutral-300 bg-white p-10 text-center text-[14px] text-neutral-500">
              아직 게시글이 없어요. 첫 글을 작성해보세요.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              {recentPosts.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/board/${p.id}`}
                  className="group flex flex-col overflow-hidden rounded-xl bg-white transition hover:shadow-lg"
                >
                  <div className="relative aspect-[16/10] bg-neutral-100">
                    <Image
                      src={placeholder(`news-${p.id}-${i}`, 600, 400)}
                      alt=""
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      unoptimized
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="mb-1 text-[12px] font-medium tracking-widest text-neutral-500">
                      NOTICE
                    </p>
                    <h3 className="mb-3 line-clamp-2 flex-1 text-[16px] font-bold leading-snug text-black group-hover:underline">
                      {p.title}
                    </h3>
                    <p className="text-[12px] text-neutral-500">
                      {new Date(p.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black text-white">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-6 px-6 py-20 text-center">
          <h2 className="text-[28px] font-bold leading-tight md:text-[36px]">
            지금, ACEWATER 와 함께하세요
          </h2>
          <p className="text-[14px] text-white/75">
            엄선된 작품과 새로운 소식을 만나보세요.
          </p>
        </div>
      </section>
    </>
  )
}
