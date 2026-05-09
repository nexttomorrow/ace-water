'use client'

import Link from 'next/link'
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

export default function AsContent() {
  return (
    <main className="bg-white text-neutral-900">
      <Promise />
      <Process />
      <Coverage />
      <ContactCta />
    </main>
  )
}

// 1) 우리의 약속
function Promise() {
  const { ref, shown } = useReveal<HTMLElement>(0.1)
  const items = [
    {
      title: '빠른 응답',
      desc: '평균 24시간 이내 1차 응답을 약속합니다.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 7v5l3 2" />
        </svg>
      ),
    },
    {
      title: '전문 엔지니어',
      desc: '본사 인증 엔지니어가 직접 출동·진단·처리합니다.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-2.5z" />
        </svg>
      ),
    },
    {
      title: '정품 부품',
      desc: 'ACEWATER 정품 부품으로만 교체합니다.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2 4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
    },
    {
      title: '안심 보증',
      desc: '시공 후 1년 무상 A/S, 이후에도 책임 케어.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 7L9 18l-5-5" />
        </svg>
      ),
    },
  ]

  return (
    <section ref={ref} className="bg-white py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="text-center">
          <p
            className={`text-[0.875rem] font-semibold uppercase tracking-[0.4em] text-blue-700 transition-all duration-700 ${
              shown ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
            }`}
          >
            Our Promise
          </p>
          <h2
            className={`mt-3 text-[1.75rem] font-bold leading-[1.3] md:text-[2.25rem] transition-all duration-1000 delay-100 ${
              shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            제품 너머의 신뢰까지 함께합니다
          </h2>
          <p
            className={`mt-4 text-[0.875rem] leading-relaxed text-neutral-600 md:text-[1rem] transition-all duration-1000 delay-200 ${
              shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            모든 ACEWATER 제품은 시공 후에도 본사 차원의 사후관리를 받습니다.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
          {items.map((it, i) => (
            <div
              key={it.title}
              className={`group rounded-2xl border border-neutral-200 bg-white p-6 transition-all duration-700 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_24px_48px_-24px_rgba(37,99,235,0.25)] ${
                shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
              style={{ transitionDelay: shown ? `${250 + i * 90}ms` : '0ms' }}
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                {it.icon}
              </div>
              <h3 className="mt-5 text-[1rem] font-bold">{it.title}</h3>
              <p className="mt-2 text-[0.875rem] leading-relaxed text-neutral-600">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// 2) 서비스 프로세스
function Process() {
  const { ref, shown } = useReveal<HTMLElement>(0.1)
  const steps = [
    {
      num: '01',
      title: '접수',
      desc: '전화 또는 이메일로 서비스 요청을 접수합니다.',
    },
    {
      num: '02',
      title: '진단',
      desc: '담당 엔지니어가 1차 원격 진단 후 방문 일정을 조율합니다.',
    },
    {
      num: '03',
      title: '처리',
      desc: '현장 방문 후 정품 부품으로 직접 점검·교체합니다.',
    },
    {
      num: '04',
      title: '완료',
      desc: '처리 결과를 안내드리고 사후 모니터링을 이어갑니다.',
    },
  ]

  return (
    <section ref={ref} className="bg-neutral-50 py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="text-center">
          <p
            className={`text-[0.875rem] font-semibold uppercase tracking-[0.4em] text-blue-700 transition-all duration-700 ${
              shown ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
            }`}
          >
            Process
          </p>
          <h2
            className={`text-[1.75rem] font-bold leading-[1.3] md:text-[2.25rem] transition-all duration-1000 delay-100 ${
              shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            4단계로 끝나는 간단한 처리
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-4">
          {steps.map((s, i) => (
            <div
              key={s.num}
              className={`relative rounded-2xl bg-white p-7 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.08)] transition-all duration-700 ${
                shown ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              }`}
              style={{ transitionDelay: shown ? `${200 + i * 120}ms` : '0ms' }}
            >
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-[2.25rem] font-extrabold leading-none tracking-tight text-transparent">
                {s.num}
              </span>
              <h3 className="mt-3 text-[1.125rem] font-bold">{s.title}</h3>
              <p className="mt-2 text-[0.875rem] leading-relaxed text-neutral-600">{s.desc}</p>
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

// 3) 서비스 시간 / 가능 지역
function Coverage() {
  const { ref, shown } = useReveal<HTMLElement>(0.1)
  return (
    <section ref={ref} className="bg-white py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div
            className={`rounded-2xl border border-neutral-200 bg-white p-8 transition-all duration-700 ${
              shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <p className="text-[0.875rem] font-semibold uppercase tracking-[0.3em] text-blue-700">
              Service Hours
            </p>
            <h3 className="mt-2 text-[1.375rem] font-bold">서비스 시간</h3>
            <dl className="mt-6 space-y-3 text-[0.875rem]">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <dt className="text-neutral-500">평일</dt>
                <dd className="font-medium">09:00 — 18:00</dd>
              </div>
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <dt className="text-neutral-500">토요일</dt>
                <dd className="font-medium">09:00 — 13:00</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-neutral-500">일요일 / 공휴일</dt>
                <dd className="font-medium text-neutral-400">휴무</dd>
              </div>
            </dl>
            <p className="mt-5 text-[0.75rem] leading-relaxed text-neutral-500">
              긴급 상황은 별도 핫라인으로 24시간 접수받으며, 우선순위에 따라 처리됩니다.
            </p>
          </div>

          <div
            className={`rounded-2xl border border-neutral-200 bg-white p-8 transition-all duration-700 delay-100 ${
              shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <p className="text-[0.875rem] font-semibold uppercase tracking-[0.3em] text-blue-700">
              Coverage
            </p>
            <h3 className="mt-2 text-[1.375rem] font-bold">서비스 가능 지역</h3>
            <p className="mt-4 text-[0.875rem] leading-relaxed text-neutral-700">
              전국 어디든 시공한 제품에 대해 사후관리를 진행합니다. 도서 산간 지역의 경우 일정 협의가
              필요할 수 있어요.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                '서울',
                '경기',
                '인천',
                '강원',
                '충청',
                '대전',
                '전라',
                '광주',
                '경상',
                '대구',
                '부산',
                '울산',
                '제주',
              ].map((r) => (
                <span
                  key={r}
                  className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[0.75rem] text-neutral-700"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// 4) Contact CTA
function ContactCta() {
  const { ref, shown } = useReveal<HTMLElement>(0.1)
  return (
    <section ref={ref} className="bg-neutral-50 pb-28 pt-20">
      <div className="mx-auto max-w-[1200px] px-6">
        <div
          className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-500 px-8 py-12 md:px-14 md:py-16 transition-all duration-1000 ${
            shown ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
        >
          <div aria-hidden className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div aria-hidden className="absolute -bottom-20 -left-10 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

          <div className="relative grid grid-cols-1 items-center gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <p className="text-[0.75rem] font-semibold uppercase tracking-[0.4em] text-white/80">
                Need Help?
              </p>
              <h3 className="mt-3 text-[1.5rem] font-bold leading-[1.3] text-white md:text-[2rem]">
                지금 바로 AS를 신청해보세요
              </h3>
              <p className="mt-3 text-[0.875rem] leading-relaxed text-white/85 md:text-[1rem]">
                담당 엔지니어가 빠르게 연락드립니다. 모델명·시공일자·증상을 알려주시면 더 정확한 진단이
                가능해요.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 md:items-end">
              <a
                href="tel:031-944-2903"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-[0.875rem] font-bold text-blue-700 shadow-lg transition hover:scale-[1.02]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 2.08 4.18 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72 13 13 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 13 13 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                031-944-2903
              </a>
              <a
                href="mailto:acewater@acewater.net"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-3 text-[0.875rem] font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16v16H4z" />
                  <path d="m22 6-10 7L2 6" />
                </svg>
                이메일로 문의
              </a>
              <Link
                href="/qna"
                className="text-right text-[0.75rem] text-white/80 underline-offset-4 hover:underline"
              >
                자주 묻는 질문 먼저 보기 →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
