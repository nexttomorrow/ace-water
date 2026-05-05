import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import type { GalleryItem, Post } from '@/lib/types'

export const revalidate = 0

export default async function Home() {
  const supabase = await createClient()

  const [{ data: gallery }, { data: posts }] = await Promise.all([
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
  ])

  const items = (gallery ?? []) as GalleryItem[]
  const recentPosts = (posts ?? []) as Pick<Post, 'id' | 'title' | 'created_at' | 'author_id'>[]

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

  return (
    <>
      {/* HERO */}
      <section className="relative h-[560px] w-full overflow-hidden bg-neutral-900 text-white">
        <Image
          src={placeholder('jasper-hero', 1920, 900)}
          alt=""
          fill
          priority
          className="object-cover opacity-80"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="relative z-10 mx-auto flex h-full max-w-[1440px] flex-col justify-end px-6 pb-16">
          <p className="mb-3 text-[13px] font-medium tracking-widest text-white/80">
            JASPERAGC SIGNATURE
          </p>
          <h1 className="mb-4 max-w-2xl text-[44px] font-extrabold leading-[1.15] md:text-[56px]">
            지금, 새로운 시선을<br />만나보세요
          </h1>
          <p className="mb-8 max-w-xl text-[16px] text-white/90">
            엄선된 작품과 이야기를 통해, 일상을 더 풍부하게.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/gallery"
              className="rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-black hover:bg-neutral-200"
            >
              갤러리 보기
            </Link>
            <Link
              href="/board"
              className="rounded-full border border-white/60 px-6 py-3 text-[14px] font-semibold text-white hover:bg-white/10"
            >
              자세히 알아보기
            </Link>
          </div>
        </div>
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
        <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-6 px-6 py-20 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <h2 className="text-[28px] font-bold leading-tight md:text-[36px]">
              지금, JASPERAGC 와 함께하세요
            </h2>
            <p className="mt-2 text-[14px] text-white/75">
              가입하고 새로운 작품과 소식을 가장 먼저 만나보세요.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/signup"
              className="rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-black hover:bg-neutral-200"
            >
              회원가입
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-white/60 px-6 py-3 text-[14px] font-semibold text-white hover:bg-white/10"
            >
              로그인
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
