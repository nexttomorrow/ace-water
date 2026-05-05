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
    <Swiper
      modules={[Autoplay]}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
      loop
      speed={700}
      slidesPerView={5}
      spaceBetween={6}
      breakpoints={{
        0: { slidesPerView: 1.4, spaceBetween: 6 },
        640: { slidesPerView: 2.4, spaceBetween: 6 },
        1024: { slidesPerView: 3.4, spaceBetween: 6 },
        1280: { slidesPerView: 5, spaceBetween: 6 },
      }}
      className="!overflow-visible"
    >
      {items.map((item) => (
        <SwiperSlide key={item.key}>
          <Link href={item.href} className="group relative block aspect-[4/3] overflow-hidden bg-neutral-200">
            <Image
              src={item.src}
              alt={item.title}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              unoptimized
            />
            <div className="pointer-events-none absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/65" />
            <div className="pointer-events-none absolute inset-0 flex translate-y-2 flex-col items-center justify-center px-5 text-center opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <h3 className="text-[16px] font-bold text-white md:text-[18px]">{item.title}</h3>
              <div className="my-2 h-[1px] w-6 bg-white/60" />
              <p className="line-clamp-2 text-[12px] leading-relaxed text-white/85">
                {item.desc}
              </p>
            </div>
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
