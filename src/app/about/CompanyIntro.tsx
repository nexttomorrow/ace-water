'use client'

import { useEffect, useRef, useState } from 'react'

function useReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.2) {
  const ref = useRef<T>(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          obs.disconnect()
        }
      },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, shown }
}

export default function CompanyIntro() {
  return (
    <main className="bg-white text-neutral-900">
      <Hero />
      <BrandStatement />
      <CeoMessage />
      <ByTheNumbers />
      <BusinessAreas />
      <Certifications />
    </main>
  )
}

// ───────────────────────── 1) HERO ─────────────────────────

function Hero() {
  const { ref, shown } = useReveal<HTMLElement>(0.1)
  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-white"
    >
      {/* 배경 추상 도형 */}
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute -left-32 top-20 h-[460px] w-[460px] rounded-full bg-blue-100/60 blur-3xl transition-all duration-[1400ms] ${
            shown ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
        />
        <div
          className={`absolute -right-40 bottom-0 h-[520px] w-[520px] rounded-full bg-cyan-100/50 blur-3xl transition-all duration-[1600ms] delay-200 ${
            shown ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
        />
      </div>

      <div className="relative mx-auto max-w-[1200px] px-6 pb-28 pt-24 md:pb-40 md:pt-32">
        <p
          className={`text-[12px] font-semibold uppercase tracking-[0.4em] text-blue-700 transition-all duration-700 ${
            shown ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
          }`}
        >
          About ACEWATER
        </p>

        <h1
          className={`mt-6 text-[40px] font-extrabold leading-[1.15] tracking-tight md:text-[72px] transition-all duration-1000 delay-150 ${
            shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          물이 있는 모든 공간을,
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            아트로 디자인합니다.
          </span>
        </h1>

        <p
          className={`mt-8 max-w-[640px] text-[15px] leading-[1.9] text-neutral-600 md:text-[17px] transition-all duration-1000 delay-300 ${
            shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          1991년 출발한 에이스엔지니어링이 만든 환경·산업디자인 전문 브랜드, 에이스워터.
          국내 최대 생산시설과 제품 디자인연구소가 만나, 일상의 물 공간을 새롭게 정의합니다.
        </p>

        <div
          className={`mt-16 flex items-center gap-3 text-[12px] text-neutral-400 transition-opacity duration-1000 delay-700 ${
            shown ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span className="h-px w-12 bg-neutral-300" />
          SCROLL
        </div>
      </div>
    </section>
  )
}

// ───────────────────────── 2) BRAND STATEMENT ─────────────────────────

function BrandStatement() {
  const { ref, shown } = useReveal<HTMLElement>(0.25)
  return (
    <section ref={ref} className="border-t border-neutral-100">
      <div className="mx-auto max-w-[1200px] px-6 py-24 md:py-32">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <p
              className={`text-[11px] font-semibold uppercase tracking-[0.4em] text-blue-700 transition-all duration-700 ${
                shown ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
              }`}
            >
              Our Brand
            </p>
            <h2
              className={`mt-3 text-[28px] font-bold leading-[1.3] md:text-[34px] transition-all duration-1000 delay-100 ${
                shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              에이스워터는
              <br />
              일상의 물을 다시 그립니다.
            </h2>
          </div>

          <div className="md:col-span-7 md:col-start-6">
            <div
              className={`space-y-6 text-[15px] leading-[1.95] text-neutral-700 md:text-[16px] transition-all duration-1000 delay-200 ${
                shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              <p>
                <strong className="font-semibold text-neutral-900">
                  에이스워터(Acewater)
                </strong>
                는 에이스엔지니어링이 30여 년간 축적해온 정수 기술과 산업 디자인 노하우를
                결집한 환경·산업디자인 전문 브랜드입니다.
              </p>
              <p>
                음수기·정수기에서 시작해 세정대·세족대, 아트에어건, 차양, 조형 벤치까지 —
                물과 공공의 영역이 만나는 모든 접점을 디자인합니다. &lsquo;가장 깨끗한 물&rsquo;을
                넘어 &lsquo;공간을 바꾸는 사물&rsquo;로, 우리는 매일의 환경을 한 걸음 더
                나은 곳으로 만들어 갑니다.
              </p>
              <p className="text-neutral-500">
                Water Public Art — 물이 머무는 자리를 예술로 다듬는 일.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ───────────────────────── 3) CEO MESSAGE ─────────────────────────

function CeoMessage() {
  const { ref, shown } = useReveal<HTMLElement>(0.2)
  return (
    <section ref={ref} className="bg-neutral-50">
      <div className="mx-auto max-w-[1200px] px-6 py-24 md:py-32">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p
              className={`text-[11px] font-semibold uppercase tracking-[0.4em] text-blue-700 transition-all duration-700 ${
                shown ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
              }`}
            >
              CEO Message
            </p>
            <h2
              className={`mt-3 text-[28px] font-bold leading-[1.3] md:text-[34px] transition-all duration-1000 delay-100 ${
                shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              <span className="text-blue-700">&ldquo;</span>편리하고
              위생적인 환경,
              <br />
              우리가 가장 앞에서 만들어 갑니다.<span className="text-blue-700">&rdquo;</span>
            </h2>

            <div
              className={`mt-10 flex items-center gap-4 transition-all duration-1000 delay-300 ${
                shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-[20px] font-bold text-white shadow-md">
                구
              </div>
              <div>
                <p className="text-[12px] uppercase tracking-[0.2em] text-neutral-500">
                  CEO
                </p>
                <p className="mt-0.5 text-[16px] font-bold tracking-tight">구 종 철</p>
                <p className="text-[12px] text-neutral-500">
                  에이스엔지니어링 대표이사
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-6 md:col-start-7">
            <div
              className={`space-y-5 text-[15px] leading-[1.95] text-neutral-700 md:text-[16px] transition-all duration-1000 delay-200 ${
                shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              <p>
                안녕하십니까. 에이스엔지니어링·에이스워터를 찾아주신 여러분께 진심으로
                감사드립니다.
              </p>
              <p>
                저희는 1991년 설립 이래 국내 최대 규모의 생산시설과 자체 제품 디자인연구소를
                기반으로, 음수·정수기, 세정·세족대, 아트에어건, 차양, 조형 벤치에 이르기까지
                다양한 환경·산업 제품을 디자인하고 만들어왔습니다.
              </p>
              <p>
                끊임없는 연구·개발을 통한 지속적인 품질 향상과, 차별화된 디자인을 통한 사용자
                경험의 확장 — 두 가지 축을 흔들림 없이 지켜 가겠습니다. 더 깨끗하고, 더
                편리하며, 더 아름다운 공공의 일상을 위해 에이스워터가 가장 앞에서 함께
                하겠습니다.
              </p>
              <p className="pt-2 text-[14px] text-neutral-500">감사합니다.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ───────────────────────── 4) BY THE NUMBERS ─────────────────────────

const STATS = [
  { value: '1991', suffix: '', label: '설립연도', sub: 'Since 1991' },
  { value: '30', suffix: '+', label: '년의 역사', sub: 'Years' },
  { value: '7', suffix: '+', label: '주요 제품군', sub: 'Product Lines' },
  { value: '#1', suffix: '', label: '국내 최대 생산시설', sub: 'Production' },
]

function ByTheNumbers() {
  const { ref, shown } = useReveal<HTMLElement>(0.2)
  return (
    <section ref={ref} className="border-t border-neutral-100">
      <div className="mx-auto max-w-[1200px] px-6 py-24 md:py-32">
        <header className="mb-12">
          <p
            className={`text-[11px] font-semibold uppercase tracking-[0.4em] text-blue-700 transition-all duration-700 ${
              shown ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
            }`}
          >
            By the Numbers
          </p>
          <h2
            className={`mt-3 text-[28px] font-bold leading-[1.3] md:text-[34px] transition-all duration-1000 delay-100 ${
              shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            숫자로 보는 에이스워터
          </h2>
        </header>

        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-neutral-200 md:grid-cols-4">
          {STATS.map((s, i) => (
            <div
              key={i}
              className={`group relative bg-white p-8 transition-all duration-700 hover:bg-blue-50 md:p-10 ${
                shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
              style={{ transitionDelay: shown ? `${200 + i * 100}ms` : '0ms' }}
            >
              <p className="text-[11px] uppercase tracking-[0.3em] text-neutral-400 transition group-hover:text-blue-700">
                {s.sub}
              </p>
              <p className="mt-3 flex items-baseline gap-1">
                <span className="text-[44px] font-extrabold leading-none tracking-tight text-neutral-900 md:text-[56px]">
                  {s.value}
                </span>
                <span className="text-[24px] font-bold text-blue-600 md:text-[28px]">
                  {s.suffix}
                </span>
              </p>
              <p className="mt-4 text-[14px] font-medium text-neutral-600">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ───────────────────────── 5) BUSINESS AREAS ─────────────────────────

const AREAS = [
  { name: '음수기', en: 'Drinking Fountain', desc: '공공·교육·산업 현장의 안전한 음수 솔루션' },
  { name: '정수기', en: 'Water Purifier', desc: '맞춤형 여과 기술과 위생을 결합한 정수 시스템' },
  { name: '세정·세족대', en: 'Wash Station', desc: '공공시설을 위한 위생적이고 디자인된 손·발 세정 시설' },
  { name: '아트에어건', en: 'Art Air Gun', desc: '에어건의 기능과 조형미를 함께 담은 공간 가구' },
  { name: '차양', en: 'Shade Structure', desc: '도시·공원의 휴식 공간을 정의하는 구조물' },
  { name: '조형 벤치', en: 'Sculptural Bench', desc: '앉음과 조형의 경계를 허무는 공공 가구' },
]

function BusinessAreas() {
  const { ref, shown } = useReveal<HTMLElement>(0.15)
  return (
    <section ref={ref} className="bg-neutral-50">
      <div className="mx-auto max-w-[1200px] px-6 py-24 md:py-32">
        <header className="mb-12 max-w-[640px]">
          <p
            className={`text-[11px] font-semibold uppercase tracking-[0.4em] text-blue-700 transition-all duration-700 ${
              shown ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
            }`}
          >
            What We Do
          </p>
          <h2
            className={`mt-3 text-[28px] font-bold leading-[1.3] md:text-[34px] transition-all duration-1000 delay-100 ${
              shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            6개 핵심 영역, 하나의 일관된 디자인 언어
          </h2>
          <p
            className={`mt-4 text-[15px] leading-[1.85] text-neutral-600 transition-all duration-1000 delay-200 ${
              shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            물·위생·휴식이 만나는 모든 접점에서, 우리는 같은 질문을 던집니다 — &ldquo;이
            공간이 더 친절해질 수 있을까?&rdquo;
          </p>
        </header>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {AREAS.map((a, i) => (
            <article
              key={a.name}
              className={`group relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-7 transition-all duration-700 hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_24px_48px_-24px_rgba(37,99,235,0.25)] ${
                shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
              style={{ transitionDelay: shown ? `${200 + i * 80}ms` : '0ms' }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-400 transition group-hover:text-blue-600">
                {a.en}
              </p>
              <h3 className="mt-3 text-[20px] font-bold tracking-tight">{a.name}</h3>
              <p className="mt-3 text-[13.5px] leading-[1.7] text-neutral-600">{a.desc}</p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-[12px] font-semibold text-neutral-400 transition group-hover:text-blue-600">
                <span className="transition-all duration-300 group-hover:tracking-wider">
                  자세히 보기
                </span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </span>
              <span className="absolute left-0 top-7 h-8 w-[3px] origin-top scale-y-0 bg-gradient-to-b from-blue-500 to-cyan-400 transition-transform duration-500 group-hover:scale-y-100" />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// ───────────────────────── 6) CERTIFICATIONS ─────────────────────────

function Certifications() {
  const { ref, shown } = useReveal<HTMLElement>(0.15)
  return (
    <section ref={ref} className="border-t border-neutral-100">
      <div className="mx-auto max-w-[1200px] px-6 py-24 md:py-32">
        <header className="mb-12">
          <p
            className={`text-[11px] font-semibold uppercase tracking-[0.4em] text-blue-700 transition-all duration-700 ${
              shown ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
            }`}
          >
            Certifications
          </p>
          <h2
            className={`mt-3 text-[28px] font-bold leading-[1.3] md:text-[34px] transition-all duration-1000 delay-100 ${
              shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            품질을 증명하는 인증
          </h2>
        </header>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6 md:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="group aspect-[3/4] cursor-pointer overflow-hidden rounded-md bg-white ring-1 ring-neutral-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_32px_-16px_rgba(0,0,0,0.18)] hover:ring-blue-300"
              style={{
                opacity: shown ? 1 : 0,
                transform: shown ? 'translateY(0)' : 'translateY(16px)',
                transition: 'opacity 700ms ease, transform 700ms ease',
                transitionDelay: shown ? `${200 + i * 50}ms` : '0ms',
              }}
            >
              <div className="flex h-full flex-col items-center justify-center text-neutral-400">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  className="transition-all duration-300 group-hover:scale-110 group-hover:text-blue-500"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6M9 13l2 2 4-4" />
                </svg>
                <span className="mt-3 text-[11px] font-medium tracking-wide group-hover:text-blue-700">
                  Cert {String(i + 1).padStart(2, '0')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
