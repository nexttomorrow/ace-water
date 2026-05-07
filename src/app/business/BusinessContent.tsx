'use client'

import { useEffect, useRef, useState } from 'react'

function useReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.15) {
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

export default function BusinessContent() {
  return (
    <main className="bg-white text-neutral-900">
      <Areas />
      <WhyUs />
      <Process />
      <ContactCta />
    </main>
  )
}

// 1) 협력 가능한 비즈니스 영역
function Areas() {
  const { ref, shown } = useReveal<HTMLElement>(0.1)
  const items = [
    {
      title: '시공 파트너십',
      desc: '전국 시공 협력사를 모집합니다. 공동 시공·기술 지원으로 함께 성장합니다.',
      tags: ['전국 협력', '기술 교육', '공동 견적'],
    },
    {
      title: '도매 / 대량 공급',
      desc: '대규모 프로젝트, 관공서 납품에 적합한 대량 공급 조건을 제공합니다.',
      tags: ['관공서', '대형 현장', '단가 협상'],
    },
    {
      title: 'OEM / ODM',
      desc: '디자인부터 제조·검수까지 통합된 자체 설비로 맞춤 제작이 가능합니다.',
      tags: ['자체 공장', '디자인연구소', '맞춤 설계'],
    },
    {
      title: '기술 협력',
      desc: '신규 제품·솔루션 공동 개발, 정수 시스템 컨설팅 등 기술 영역 협력.',
      tags: ['공동 개발', '컨설팅', '특허 보유'],
    },
  ]

  return (
    <section ref={ref} className="bg-white py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="text-center">
          <p
            className={`text-[14px] font-semibold uppercase tracking-[0.4em] text-blue-700 transition-all duration-700 ${
              shown ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
            }`}
          >
            Partnership Areas
          </p>
          <h2
            className={`text-[28px] font-bold leading-[1.3] md:text-[36px] transition-all duration-1000 delay-100 ${
              shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            함께할 수 있는 비즈니스
          </h2>
          <p
            className={`mt-4 text-[14px] leading-relaxed text-neutral-600 md:text-[15px] transition-all duration-1000 delay-200 ${
              shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            ACEWATER는 다양한 형태의 파트너와 함께합니다. 가장 잘 맞는 영역을 골라보세요.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
          {items.map((it, i) => (
            <div
              key={it.title}
              className={`group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-7 transition-all duration-700 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_24px_48px_-24px_rgba(37,99,235,0.25)] ${
                shown ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              }`}
              style={{ transitionDelay: shown ? `${250 + i * 110}ms` : '0ms' }}
            >
              <div
                aria-hidden
                className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-50 opacity-0 transition group-hover:opacity-100"
              />
              <div className="relative">
                <h3 className="text-[20px] font-bold leading-tight">{it.title}</h3>
                <p className="mt-3 text-[14px] leading-relaxed text-neutral-600">{it.desc}</p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {it.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-[11px] font-medium text-neutral-600"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// 2) ACEWATER와 함께해야 하는 이유
function WhyUs() {
  const { ref, shown } = useReveal<HTMLElement>(0.1)
  const reasons = [
    { stat: '20+', label: '년 업력' },
    { stat: '2,000+', label: '디자인 보유' },
    { stat: '전국', label: '시공 가능' },
    { stat: 'KC·ISO', label: '인증 보유' },
  ]

  return (
    <section ref={ref} className="bg-gradient-to-b from-neutral-50 to-white py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div>
            <p
              className={`text-[14px] font-semibold uppercase tracking-[0.4em] text-blue-700 transition-all duration-700 ${
                shown ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
              }`}
            >
              Why ACEWATER
            </p>
            <h2
              className={`mt-3 text-[28px] font-bold leading-[1.3] md:text-[36px] transition-all duration-1000 delay-100 ${
                shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              검증된 인프라,
              <br />
              증명된 신뢰
            </h2>
            <p
              className={`mt-5 text-[14px] leading-relaxed text-neutral-600 md:text-[15px] transition-all duration-1000 delay-200 ${
                shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              자체 제조 공장, 도색 설비, 디자인 연구소까지 통합된 라인을 갖추고 있어 어떤 규모의
              프로젝트도 단일 창구로 진행할 수 있습니다. 다수의 관공서·기업과의 납품 이력으로 신뢰성도
              검증되었습니다.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {reasons.map((r, i) => (
              <div
                key={r.label}
                className={`rounded-2xl border border-neutral-200 bg-white p-6 transition-all duration-700 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_24px_48px_-24px_rgba(37,99,235,0.25)] ${
                  shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
                style={{ transitionDelay: shown ? `${300 + i * 120}ms` : '0ms' }}
              >
                <p className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-[36px] font-extrabold leading-none tracking-tight text-transparent">
                  {r.stat}
                </p>
                <p className="mt-2 text-[13px] font-medium text-neutral-700">{r.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// 3) 진행 프로세스
function Process() {
  const { ref, shown } = useReveal<HTMLElement>(0.1)
  const steps = [
    { num: '01', title: '문의', desc: '연락처와 사업 분야, 관심 영역을 보내주세요.' },
    { num: '02', title: '상담', desc: '담당자가 1:1 미팅 또는 화상 상담을 진행합니다.' },
    { num: '03', title: '제안', desc: '맞춤 견적 / 협력 모델을 제안서로 정리해드립니다.' },
    { num: '04', title: '계약', desc: '조건 협의 후 계약 체결, 즉시 프로젝트를 시작합니다.' },
  ]

  return (
    <section ref={ref} className="bg-white py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="text-center">
          <p
            className={`text-[14px] font-semibold uppercase tracking-[0.4em] text-blue-700 transition-all duration-700 ${
              shown ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
            }`}
          >
            How It Works
          </p>
          <h2
            className={`text-[28px] font-bold leading-[1.3] md:text-[36px] transition-all duration-1000 delay-100 ${
              shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            진행 프로세스
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-4">
          {steps.map((s, i) => (
            <div
              key={s.num}
              className={`relative rounded-2xl bg-neutral-50 p-7 transition-all duration-700 ${
                shown ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              }`}
              style={{ transitionDelay: shown ? `${200 + i * 120}ms` : '0ms' }}
            >
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-[36px] font-extrabold leading-none tracking-tight text-transparent">
                {s.num}
              </span>
              <h3 className="mt-3 text-[18px] font-bold">{s.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-neutral-600">{s.desc}</p>
              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute right-[-22px] top-1/2 hidden -translate-y-1/2 text-neutral-300 md:block"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// 4) Contact CTA
function ContactCta() {
  const { ref, shown } = useReveal<HTMLElement>(0.1)
  return (
    <section ref={ref} className="bg-neutral-50 pb-28 pt-16">
      <div className="mx-auto max-w-[1200px] px-6">
        <div
          className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-500 px-8 py-12 md:px-14 md:py-16 transition-all duration-1000 ${
            shown ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
        >
          <div aria-hidden className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div aria-hidden className="absolute -bottom-24 -left-12 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

          <div className="relative grid grid-cols-1 items-center gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <p className="text-[12px] font-semibold uppercase tracking-[0.4em] text-white/80">
                Let&apos;s Talk
              </p>
              <h3 className="mt-3 text-[24px] font-bold leading-[1.3] text-white md:text-[32px]">
                지금 바로 비즈니스 문의를 시작해보세요
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-white/85 md:text-[15px]">
                회사명·담당자·관심 영역만 알려주시면 영업팀이 빠르게 회신드립니다. 비밀유지가 필요한
                안건은 별도로 NDA 진행이 가능합니다.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 md:items-end">
              <a
                href="tel:031-944-2903"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-bold text-blue-700 shadow-lg transition hover:scale-[1.02]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 2.08 4.18 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72 13 13 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 13 13 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                031-944-2903
              </a>
              <a
                href="mailto:acewater@acewater.net"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-3 text-[14px] font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16v16H4z" />
                  <path d="m22 6-10 7L2 6" />
                </svg>
                이메일로 제안서 받기
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
