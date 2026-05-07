'use client'

import { useEffect, useRef, useState } from 'react'

const ADDRESS_KO = '경기도 파주시 탄현면 방촌로 449-58'
const ADDRESS_SHORT = '경기 파주시 탄현면 방촌로 449-58'
const PHONE = '031-944-2903'
const FAX = '031-944-2901'
const EMAIL = 'acewater@acewater.net'

const Q = encodeURIComponent(ADDRESS_KO)
const GOOGLE_EMBED = `https://maps.google.com/maps?q=${Q}&z=16&output=embed`
const KAKAO_LINK = `https://map.kakao.com/link/search/${Q}`
const NAVER_LINK = `https://map.naver.com/p/search/${Q}`
const GOOGLE_LINK = `https://www.google.com/maps?q=${Q}`

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

export default function LocationContent() {
  return (
    <main className="bg-white text-neutral-900">
      <Hero />
      <MapSection />
      <ContactCards />
      <Directions />
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
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute -left-32 top-12 h-[420px] w-[420px] rounded-full bg-blue-100/60 blur-3xl transition-all duration-[1400ms] ${
            shown ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
        />
        <div
          className={`absolute -right-40 bottom-0 h-[480px] w-[480px] rounded-full bg-cyan-100/50 blur-3xl transition-all duration-[1600ms] delay-200 ${
            shown ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
        />
      </div>

      <div className="relative mx-auto max-w-[1200px] px-6 pb-20 pt-24 md:pb-28 md:pt-32">
        <p
          className={`text-[12px] font-semibold uppercase tracking-[0.4em] text-blue-700 transition-all duration-700 ${
            shown ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
          }`}
        >
          Visit Us
        </p>

        <h1
          className={`mt-6 text-[40px] font-extrabold leading-[1.15] tracking-tight md:text-[64px] transition-all duration-1000 delay-150 ${
            shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          에이스엔지니어링이
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            자리한 자리.
          </span>
        </h1>

        <p
          className={`mt-8 max-w-[640px] text-[15px] leading-[1.9] text-neutral-600 md:text-[17px] transition-all duration-1000 delay-300 ${
            shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          파주의 작업 현장에서 디자인부터 제작·시공까지, 한 자리에서 이어지는 흐름을 만나보세요.
          방문 전 가능하면 연락 한 번 주시면 더 깊은 안내가 가능합니다.
        </p>

        {/* 주소 큰 글씨 */}
        <div
          className={`mt-10 inline-flex items-center gap-3 rounded-full bg-white/60 px-5 py-2.5 ring-1 ring-blue-100 backdrop-blur transition-all duration-1000 delay-500 ${
            shown ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
          }`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="text-blue-600"
          >
            <path d="M12 22s7-7 7-13a7 7 0 1 0-14 0c0 6 7 13 7 13z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          <span className="text-[14px] font-medium tracking-tight text-neutral-800 md:text-[15px]">
            {ADDRESS_SHORT}
          </span>
        </div>
      </div>
    </section>
  )
}

// ───────────────────────── 2) MAP ─────────────────────────

function MapSection() {
  const { ref, shown } = useReveal<HTMLElement>(0.1)
  return (
    <section ref={ref} className="border-t border-neutral-100">
      <div className="mx-auto max-w-[1200px] px-6 py-20 md:py-24">
        {/* 지도 컨테이너 */}
        <div
          className={`relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.18)] transition-all duration-1000 ${
            shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="aspect-[16/9] w-full md:aspect-[21/9]">
            <iframe
              title="에이스엔지니어링 위치"
              src={GOOGLE_EMBED}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full"
              style={{ border: 0 }}
            />
          </div>

          {/* 좌상단 라벨 */}
          <div className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-[12px] font-medium text-neutral-700 shadow-sm ring-1 ring-neutral-200 backdrop-blur md:left-6 md:top-6">
            <span className="block h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600" />
            ACEWATER · 파주 본사
          </div>
        </div>

        {/* 외부 지도 열기 */}
        <div
          className={`mt-4 flex flex-wrap items-center justify-between gap-3 transition-all duration-1000 delay-200 ${
            shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <p className="text-[12px] text-neutral-500">
            지도가 표시되지 않으면 아래 외부 지도 서비스에서 열어주세요.
          </p>
          <div className="flex flex-wrap gap-2">
            <ExternalLink href={KAKAO_LINK} label="카카오맵" />
            <ExternalLink href={NAVER_LINK} label="네이버 지도" />
            <ExternalLink href={GOOGLE_LINK} label="Google Maps" />
          </div>
        </div>
      </div>
    </section>
  )
}

function ExternalLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-[12px] font-medium text-neutral-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
    >
      {label}
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      >
        <path d="M7 17L17 7M9 7h8v8" />
      </svg>
    </a>
  )
}

// ───────────────────────── 3) CONTACT CARDS ─────────────────────────

function ContactCards() {
  const { ref, shown } = useReveal<HTMLElement>(0.2)
  const [copied, setCopied] = useState(false)

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(ADDRESS_KO)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // ignore
    }
  }

  return (
    <section ref={ref} className="bg-neutral-50">
      <div className="mx-auto max-w-[1200px] px-6 py-24 md:py-32">
        <header className="mb-12 max-w-[640px]">
          <p
            className={`text-[11px] font-semibold uppercase tracking-[0.4em] text-blue-700 transition-all duration-700 ${
              shown ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
            }`}
          >
            Contact
          </p>
          <h2
            className={`mt-3 text-[28px] font-bold leading-[1.3] md:text-[34px] transition-all duration-1000 delay-100 ${
              shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            연락처와 주소
          </h2>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* 주소 카드 */}
          <article
            className={`group relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-7 transition-all duration-700 hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_24px_48px_-24px_rgba(37,99,235,0.25)] md:col-span-2 ${
              shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: shown ? '200ms' : '0ms' }}
          >
            <CardHeader label="Address" title="주소" />
            <p className="mt-4 text-[16px] font-semibold leading-[1.6] tracking-tight md:text-[18px]">
              {ADDRESS_KO}
            </p>
            <p className="mt-1 text-[12px] text-neutral-500">
              헤이리·통일동산 인근 · 우편번호 10860
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyAddress}
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-[12px] font-medium text-neutral-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                {copied ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                    복사됨
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="9" y="9" width="11" height="11" rx="2" />
                      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                    </svg>
                    주소 복사
                  </>
                )}
              </button>
              <a
                href={KAKAO_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-3.5 py-1.5 text-[12px] font-medium text-white transition hover:bg-neutral-700"
              >
                길찾기
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            <span className="absolute left-0 top-7 h-12 w-[3px] origin-top scale-y-0 bg-gradient-to-b from-blue-500 to-cyan-400 transition-transform duration-500 group-hover:scale-y-100" />
          </article>

          {/* 전화 카드 */}
          <article
            className={`group relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-7 transition-all duration-700 hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_24px_48px_-24px_rgba(37,99,235,0.25)] ${
              shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: shown ? '300ms' : '0ms' }}
          >
            <CardHeader label="Phone" title="전화·팩스" />
            <a
              href={`tel:${PHONE.replaceAll('-', '')}`}
              className="mt-4 inline-flex items-center gap-2 text-[20px] font-extrabold tracking-tight text-neutral-900 transition hover:text-blue-700 md:text-[22px]"
            >
              {PHONE}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="opacity-50 transition group-hover:opacity-100">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </a>
            <p className="mt-2 text-[12px] text-neutral-500">
              팩스 <span className="font-mono text-neutral-700">{FAX}</span>
            </p>
            <p className="mt-3 text-[12px] leading-[1.7] text-neutral-500">
              평일 09:00 – 18:00 · 주말·공휴일 휴무
            </p>

            <span className="absolute left-0 top-7 h-12 w-[3px] origin-top scale-y-0 bg-gradient-to-b from-blue-500 to-cyan-400 transition-transform duration-500 group-hover:scale-y-100" />
          </article>

          {/* 이메일 카드 */}
          <article
            className={`group relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-7 transition-all duration-700 hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_24px_48px_-24px_rgba(37,99,235,0.25)] md:col-span-3 ${
              shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: shown ? '400ms' : '0ms' }}
          >
            <CardHeader label="Email" title="이메일 문의" />
            <a
              href={`mailto:${EMAIL}`}
              className="mt-4 inline-flex items-center gap-2 text-[18px] font-bold tracking-tight text-neutral-900 transition hover:text-blue-700 md:text-[20px]"
            >
              {EMAIL}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </a>
            <p className="mt-3 text-[13px] leading-[1.75] text-neutral-500">
              견적·도면 문의, 시공 협의 등은 위 메일로 보내주시면 영업일 기준 1~2일 내에
              답변드리겠습니다.
            </p>

            <span className="absolute left-0 top-7 h-12 w-[3px] origin-top scale-y-0 bg-gradient-to-b from-blue-500 to-cyan-400 transition-transform duration-500 group-hover:scale-y-100" />
          </article>
        </div>
      </div>
    </section>
  )
}

function CardHeader({ label, title }: { label: string; title: string }) {
  return (
    <>
      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-blue-700">
        {label}
      </p>
      <h3 className="mt-1.5 text-[16px] font-bold tracking-tight">{title}</h3>
    </>
  )
}

// ───────────────────────── 4) DIRECTIONS ─────────────────────────

function Directions() {
  const { ref, shown } = useReveal<HTMLElement>(0.15)
  return (
    <section ref={ref} className="border-t border-neutral-100">
      <div className="mx-auto max-w-[1200px] px-6 py-24 md:py-32">
        <header className="mb-12 max-w-[640px]">
          <p
            className={`text-[11px] font-semibold uppercase tracking-[0.4em] text-blue-700 transition-all duration-700 ${
              shown ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
            }`}
          >
            Directions
          </p>
          <h2
            className={`mt-3 text-[28px] font-bold leading-[1.3] md:text-[34px] transition-all duration-1000 delay-100 ${
              shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            오시는 길 안내
          </h2>
          <p
            className={`mt-4 text-[14px] leading-[1.85] text-neutral-600 md:text-[15px] transition-all duration-1000 delay-200 ${
              shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            파주 통일동산·헤이리 인근에 위치합니다. 처음 방문하실 경우 자가용 이용을
            권장드리며, 방문 전 전화로 한 번 확인해주시면 길안내가 더 수월합니다.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DirectionCard
            label="By Car"
            title="자가용으로 오시는 길"
            shown={shown}
            delay={300}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="22" height="22">
                <path d="M5 17h14M3 13l1.5-5a2 2 0 0 1 2-1.5h11a2 2 0 0 1 2 1.5L21 13M3 13v5h2v-2h14v2h2v-5M3 13h18" />
                <circle cx="7" cy="16" r="1" />
                <circle cx="17" cy="16" r="1" />
              </svg>
            }
            steps={[
              {
                from: '서울 방면',
                detail:
                  '자유로 → 통일동산IC 진출 → 헤이리·통일전망대 방향 → 방촌로 진입 후 약 5분',
              },
              {
                from: '일산 방면',
                detail:
                  '자유로 또는 송포대교 경유 → 통일동산IC → 방촌로 따라 우회전 → 약 7분',
              },
              {
                from: '주차',
                detail: '본사 부지 내 무료 주차 가능 (방문 전 연락 부탁드립니다)',
              },
            ]}
          />
          <DirectionCard
            label="Public Transit"
            title="대중교통으로 오시는 길"
            shown={shown}
            delay={400}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="22" height="22">
                <rect x="6" y="3" width="12" height="14" rx="2" />
                <path d="M6 11h12M9 21l-1-2M16 21l-1-2" />
                <circle cx="9.5" cy="14" r="0.6" fill="currentColor" />
                <circle cx="14.5" cy="14" r="0.6" fill="currentColor" />
              </svg>
            }
            steps={[
              {
                from: '경의중앙선',
                detail:
                  '운정역 또는 금촌역 하차 → 마을버스/택시 환승 (택시 기준 약 15~20분)',
              },
              {
                from: '광역버스',
                detail:
                  '서울 합정역·홍대입구역 → 9710·2200번 등 광역버스 → 일산 환승 후 마을버스',
              },
              {
                from: '안내',
                detail:
                  '대중교통은 환승 횟수가 많아 처음 방문 시 사전 연락 부탁드립니다',
              },
            ]}
          />
        </div>

        {/* 전화 CTA */}
        <div
          className={`mt-12 flex flex-col items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-8 text-white shadow-[0_24px_48px_-24px_rgba(37,99,235,0.45)] transition-all duration-1000 md:flex-row md:px-10 ${
            shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
          style={{ transitionDelay: shown ? '600ms' : '0ms' }}
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/80">
              Before You Visit
            </p>
            <p className="mt-2 text-[18px] font-bold tracking-tight md:text-[20px]">
              방문 전 전화 한 통이면 더 정확한 안내를 받을 수 있습니다.
            </p>
          </div>
          <a
            href={`tel:${PHONE.replaceAll('-', '')}`}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-bold text-blue-700 transition hover:bg-blue-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            {PHONE}로 전화하기
          </a>
        </div>
      </div>
    </section>
  )
}

function DirectionCard({
  label,
  title,
  icon,
  steps,
  shown,
  delay,
}: {
  label: string
  title: string
  icon: React.ReactNode
  steps: { from: string; detail: string }[]
  shown: boolean
  delay: number
}) {
  return (
    <article
      className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-7 transition-all duration-700 hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_24px_48px_-24px_rgba(37,99,235,0.25)]"
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 700ms ease, transform 700ms ease, border-color 300ms, box-shadow 500ms',
        transitionDelay: shown ? `${delay}ms` : '0ms',
      }}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">
          {icon}
        </span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-blue-700">
            {label}
          </p>
          <h3 className="mt-0.5 text-[18px] font-bold tracking-tight">{title}</h3>
        </div>
      </div>

      <ul className="mt-6 space-y-4 border-t border-neutral-100 pt-5">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3">
            <span className="mt-[7px] block h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-neutral-900">{s.from}</p>
              <p className="mt-1 text-[13px] leading-[1.7] text-neutral-600">{s.detail}</p>
            </div>
          </li>
        ))}
      </ul>

      <span className="absolute left-0 top-7 h-12 w-[3px] origin-top scale-y-0 bg-gradient-to-b from-blue-500 to-cyan-400 transition-transform duration-500 group-hover:scale-y-100" />
    </article>
  )
}
