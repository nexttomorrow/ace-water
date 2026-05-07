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

// ───────────────────────── 데이터 ─────────────────────────

type Dept = {
  key: string
  title: string
  label: string
  desc: string
  duties: string[]
  Icon: () => React.ReactElement
}

const DEPARTMENTS: Dept[] = [
  {
    key: 'sales',
    title: '영업',
    label: 'Sales',
    desc: '시장과 고객을 잇는 최전선에서, 신뢰를 만드는 사람들',
    duties: ['영업', '고객 관리', '발주 관리'],
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="20" height="20">
        <path d="M3 12l9-9 9 9M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </svg>
    ),
  },
  {
    key: 'management',
    title: '경영·관리',
    label: 'Management',
    desc: '조직의 흐름을 정확하고 단단하게 유지하는 백본',
    duties: ['재무·회계', '인사 관리', '영업 지원'],
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="20" height="20">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M7 9h10M7 13h10M7 17h6" />
      </svg>
    ),
  },
  {
    key: 'design',
    title: '디자인연구소',
    label: 'Design Lab',
    desc: '제품의 다음 모습을 가장 먼저 그리는 곳',
    duties: ['연구·개발', '디자인', '설계'],
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="20" height="20">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" />
      </svg>
    ),
  },
  {
    key: 'production',
    title: '생산팀',
    label: 'Production',
    desc: '아이디어가 단단한 실체로 완성되는 현장',
    duties: ['제품 생산', '설비 관리', '품질 관리', '시공'],
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="20" height="20">
        <path d="M3 21h18M5 21V10l4-3v14M9 21V13l5 2v6M14 21V8l5 3v10" />
      </svg>
    ),
  },
]

// ───────────────────────── 메인 ─────────────────────────

export default function OrgChart() {
  return (
    <main className="bg-white text-neutral-900">
      <Hero />
      <Diagram />
      <Closing />
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

      <div className="relative mx-auto max-w-[1200px] px-6 pb-24 pt-24 md:pb-32 md:pt-32">
        <p
          className={`text-[12px] font-semibold uppercase tracking-[0.4em] text-blue-700 transition-all duration-700 ${
            shown ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
          }`}
        >
          Organization
        </p>

        <h1
          className={`mt-6 text-[40px] font-extrabold leading-[1.15] tracking-tight md:text-[68px] transition-all duration-1000 delay-150 ${
            shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          사람과 기능이 만나
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            하나의 흐름이 됩니다.
          </span>
        </h1>

        <p
          className={`mt-8 max-w-[620px] text-[15px] leading-[1.9] text-neutral-600 md:text-[17px] transition-all duration-1000 delay-300 ${
            shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          영업·경영·디자인·생산. 네 개의 축이 서로 다른 시야로 한 방향을 바라봅니다. 우리 일은
          그 시야들이 겹쳐지는 자리에서 시작됩니다.
        </p>
      </div>
    </section>
  )
}

// ───────────────────────── 2) DIAGRAM ─────────────────────────

function Diagram() {
  const wrapper = useReveal<HTMLDivElement>(0.15)
  const [activeKey, setActiveKey] = useState<string | null>(null)

  return (
    <section className="border-t border-neutral-100">
      <div className="mx-auto max-w-[1200px] px-6 py-24 md:py-32">
        <header className="mb-16 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-blue-700">
            Org Chart
          </p>
          <h2 className="mt-3 text-[28px] font-bold leading-[1.3] md:text-[34px]">조직 구조</h2>
        </header>

        <div ref={wrapper.ref} className="relative">
          {/*
            정렬 보장:
              - CEO + 트렁크는 flex flex-col items-center 컨테이너 안에 두어 강제 가운데 정렬
                (mx-auto 보다 신뢰도 높음 — 어떤 브라우저/렌더 상황에서도 한 픽셀씩 어긋나지 않음)
              - 가로선: left/right calc(12.5% - 6px) → grid-cols-4 gap-4 의 col 0/3 중심 정확히 일치
              - 세로선: 카드와 동일한 grid-cols-4 gap-4 안에서 left-1/2 -translate-x-1/2 로 col 중심 정렬
          */}

          {/* 1) CEO + 트렁크 — flex 강제 정렬 */}
          <div className="flex flex-col items-center">
            <div
              className={`transition-all duration-700 ${
                wrapper.shown ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
              }`}
            >
              <CeoCard active={activeKey !== null} />
            </div>

            <div className="relative h-12 w-px md:h-14">
              <span className="absolute inset-0 bg-neutral-200" />
              <span
                className="absolute inset-0 origin-top bg-gradient-to-b from-blue-500 to-cyan-400 transition-transform duration-700 delay-300"
                style={{ transform: wrapper.shown ? 'scaleY(1)' : 'scaleY(0)' }}
              />
            </div>
          </div>

          {/* 2) 가로 분기 라인 (데스크톱 전용) — wrapper 기준 col 0/3 중심에 맞춤 */}
          <div className="relative hidden h-0 md:block">
            <span
              className="absolute top-0 h-px bg-neutral-200"
              style={{ left: 'calc(12.5% - 6px)', right: 'calc(12.5% - 6px)' }}
            />
            <span
              className="absolute top-0 h-px origin-center bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 transition-transform duration-700 delay-700"
              style={{
                left: 'calc(12.5% - 6px)',
                right: 'calc(12.5% - 6px)',
                transform: wrapper.shown ? 'scaleX(1)' : 'scaleX(0)',
              }}
            />
          </div>

          {/* 3) 4개 세로 드롭선 — 카드와 동일한 grid-cols-4 gap-4 */}
          <div className="hidden h-12 grid-cols-4 gap-4 md:grid md:h-14">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="relative h-full">
                <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-neutral-200" />
                <span
                  className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 origin-top bg-gradient-to-b from-blue-500 to-cyan-400 transition-transform duration-700"
                  style={{
                    transform: wrapper.shown ? 'scaleY(1)' : 'scaleY(0)',
                    transitionDelay: wrapper.shown ? `${1100 + i * 80}ms` : '0ms',
                  }}
                />
              </div>
            ))}
          </div>

          {/* 모바일 전용: CEO 트렁크 아래 추가 짧은 트렁크 */}
          <div className="flex justify-center md:hidden">
            <div className="h-8 w-px bg-neutral-200" />
          </div>

          {/* 부서 카드 */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {DEPARTMENTS.map((d, i) => (
              <DeptCard
                key={d.key}
                dept={d}
                active={activeKey === d.key}
                dimmed={activeKey !== null && activeKey !== d.key}
                onActivate={() => setActiveKey(d.key)}
                onDeactivate={() =>
                  setActiveKey((cur) => (cur === d.key ? null : cur))
                }
                shown={wrapper.shown}
                delay={1500 + i * 120}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function CeoCard({ active }: { active: boolean }) {
  return (
    <div
      className={`relative inline-flex flex-col items-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 px-12 py-7 text-white shadow-[0_24px_48px_-20px_rgba(37,99,235,0.45)] ring-1 ring-blue-300/40 transition-all duration-300 ${
        active ? 'scale-[1.02]' : 'scale-100'
      }`}
    >
      {/* 펄스 링 */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-blue-300/0"
        style={{
          animation: 'ceoPulse 2.6s ease-out infinite',
        }}
      />
      <p className="text-[10px] font-semibold uppercase tracking-[0.45em] text-white/75">
        CEO
      </p>
      <p className="mt-1.5 text-[22px] font-extrabold tracking-tight md:text-[24px]">
        대표이사
      </p>
      <p className="mt-1 text-[12px] font-medium text-white/85">구 종 철</p>

      <style jsx>{`
        @keyframes ceoPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(96, 165, 250, 0.45);
          }
          70% {
            box-shadow: 0 0 0 18px rgba(96, 165, 250, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(96, 165, 250, 0);
          }
        }
      `}</style>
    </div>
  )
}

function DeptCard({
  dept,
  active,
  dimmed,
  onActivate,
  onDeactivate,
  shown,
  delay,
}: {
  dept: Dept
  active: boolean
  dimmed: boolean
  onActivate: () => void
  onDeactivate: () => void
  shown: boolean
  delay: number
}) {
  const Icon = dept.Icon
  return (
    <button
      type="button"
      onMouseEnter={onActivate}
      onMouseLeave={onDeactivate}
      onFocus={onActivate}
      onBlur={onDeactivate}
      className={`group relative w-full overflow-hidden rounded-xl border bg-white p-6 text-left transition-all duration-500 ${
        active
          ? 'border-blue-300 shadow-[0_24px_48px_-20px_rgba(37,99,235,0.3)] -translate-y-1'
          : dimmed
            ? 'border-neutral-200 opacity-50'
            : 'border-neutral-200 hover:-translate-y-0.5 hover:border-neutral-300'
      }`}
      style={{
        opacity: shown ? (dimmed ? 0.5 : 1) : 0,
        transform: shown
          ? active
            ? 'translateY(-4px)'
            : 'translateY(0)'
          : 'translateY(16px)',
        transition: 'opacity 700ms ease, transform 500ms ease, border-color 300ms, box-shadow 500ms',
        transitionDelay: shown ? `${delay}ms` : '0ms',
      }}
    >
      {/* 좌측 액센트 바 */}
      <span
        className={`absolute left-0 top-6 h-12 w-[3px] origin-top rounded-full bg-gradient-to-b from-blue-500 to-cyan-400 transition-transform duration-500 ${
          active ? 'scale-y-100' : 'scale-y-0'
        }`}
      />

      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
            active ? 'bg-blue-600 text-white' : 'bg-neutral-100 text-neutral-500'
          }`}
        >
          <Icon />
        </span>
        <div className="min-w-0">
          <p
            className={`text-[10px] font-semibold uppercase tracking-[0.3em] transition-colors ${
              active ? 'text-blue-700' : 'text-neutral-400'
            }`}
          >
            {dept.label}
          </p>
          <h3 className="mt-0.5 truncate text-[17px] font-bold tracking-tight md:text-[18px]">
            {dept.title}
          </h3>
        </div>
      </div>

      {/* 설명 */}
      <p className="mt-4 text-[13px] leading-[1.7] text-neutral-600">{dept.desc}</p>

      {/* 업무 리스트 — 호버 시 좌측 점이 채워짐 */}
      <ul className="mt-5 space-y-2.5 border-t border-neutral-100 pt-4">
        {dept.duties.map((duty, i) => (
          <li
            key={duty}
            className="flex items-center gap-2.5 text-[13px] text-neutral-700"
            style={{
              transitionDelay: active ? `${i * 60}ms` : '0ms',
            }}
          >
            <span
              className={`block h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-300 ${
                active
                  ? 'scale-125 bg-blue-600'
                  : 'scale-100 bg-neutral-300 group-hover:bg-neutral-400'
              }`}
            />
            <span
              className={`transition-colors ${
                active ? 'text-neutral-900' : 'text-neutral-700'
              }`}
            >
              {duty}
            </span>
          </li>
        ))}
      </ul>

      {/* 호버 글로우 백그라운드 */}
      <span
        className={`pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-blue-50/0 via-transparent to-cyan-50/0 transition-all duration-500 ${
          active ? 'from-blue-50/60 to-cyan-50/40' : ''
        }`}
      />
    </button>
  )
}

// ───────────────────────── 3) CLOSING ─────────────────────────

function Closing() {
  const { ref, shown } = useReveal<HTMLElement>(0.3)
  return (
    <section ref={ref} className="border-t border-neutral-100 bg-neutral-50">
      <div className="mx-auto max-w-[900px] px-6 py-24 text-center md:py-32">
        <p
          className={`text-[11px] font-semibold uppercase tracking-[0.4em] text-blue-700 transition-all duration-700 ${
            shown ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
          }`}
        >
          One Direction
        </p>
        <h3
          className={`mt-3 text-[26px] font-bold leading-[1.4] md:text-[34px] transition-all duration-1000 delay-100 ${
            shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          서로 다른 시야가 모여
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            한 방향의 일을 만듭니다.
          </span>
        </h3>
      </div>
    </section>
  )
}
