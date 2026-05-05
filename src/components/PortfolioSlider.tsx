'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import Image from 'next/image'
import Link from 'next/link'

import 'swiper/css'

export type PortfolioItem = {
  key: string
  src: string
  title: string
  desc: string
  href: string
}

export default function PortfolioSlider({ items }: { items: PortfolioItem[] }) {
  return (
    <div className="portfolio-slider">
      <Swiper
        modules={[Autoplay]}
        autoplay={{
          delay: 2800,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop
        speed={800}
        centeredSlides
        slidesPerView={1.3}
        spaceBetween={20}
        breakpoints={{
          640: { slidesPerView: 2.3, spaceBetween: 24 },
          1024: { slidesPerView: 3.3, spaceBetween: 28 },
          1280: { slidesPerView: 3.6, spaceBetween: 32 },
        }}
      >
        {items.map((item) => (
          <SwiperSlide key={item.key}>
            <Link
              href={item.href}
              className="group relative block aspect-[4/3] overflow-hidden bg-neutral-200"
            >
              <Image
                src={item.src}
                alt={item.title}
                fill
                className="object-cover transition duration-700 group-hover:scale-105"
                unoptimized
              />
              <div className="pointer-events-none absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/65" />
              <div className="pointer-events-none absolute inset-0 flex translate-y-2 flex-col items-center justify-center px-5 text-center opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <h3 className="text-[18px] font-bold text-white md:text-[20px]">{item.title}</h3>
                <div className="my-2 h-[1px] w-6 bg-white/60" />
                <p className="line-clamp-2 text-[0.875rem] leading-relaxed text-white/85">
                  {item.desc}
                </p>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
      <style jsx global>{`
        .portfolio-slider .swiper-slide {
          opacity: 0.5;
          transform: scale(0.95);
          transition:
            opacity 700ms ease,
            transform 700ms ease;
        }
        .portfolio-slider .swiper-slide-active {
          opacity: 1;
          transform: scale(1);
        }
      `}</style>
    </div>
  )
}
