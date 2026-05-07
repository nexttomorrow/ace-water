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

// 진행 라인 — 페이지 스크롤에 따라 0% → 100%
function useScrollProgress<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null)
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const calc = () => {
      const rect = el.getBoundingClientRect()
      const winH = window.innerHeight
      const total = rect.height + winH
      const passed = winH - rect.top
      const p = Math.max(0, Math.min(1, passed / total))
      setProgress(p)
    }
    calc()
    window.addEventListener('scroll', calc, { passive: true })
    window.addEventListener('resize', calc)
    return () => {
      window.removeEventListener('scroll', calc)
      window.removeEventListener('resize', calc)
    }
  }, [])
  return { ref, progress }
}

// ───────────────────────── 데이터 ─────────────────────────

type Era = 'highlight' | 'tech' | 'cert' | 'project' | 'origin'

type TimelineYear = {
  year: string
  events: { text: string; tag?: Era }[]
}

const TIMELINE: TimelineYear[] = [
  { year: '2025', events: [{ text: '레이저 절단장비 교체', tag: 'tech' }] },
  { year: '2022', events: [{ text: '도색 집진장비 교체', tag: 'tech' }] },
  {
    year: '2019',
    events: [
      { text: '경기도 공공디자인 장애인용 음수대 등록', tag: 'project' },
    ],
  },
  {
    year: '2017',
    events: [
      { text: '경기도 교육청 세월호 추모 조형물 제작·시공', tag: 'project' },
    ],
  },
  { year: '2016', events: [{ text: '레이저(스텐 판 절단) 시설 보유', tag: 'tech' }] },
  {
    year: '2013',
    events: [
      { text: '디자인 연구소 설립', tag: 'highlight' },
      { text: '금속 구조물·창호 건설 면허 획득', tag: 'cert' },
    ],
  },
  {
    year: '2012',
    events: [
      { text: 'ISO 9001 품질 인증', tag: 'cert' },
      { text: 'ISO 14001 환경 인증', tag: 'cert' },
      { text: '연구개발 전담부서 설립', tag: 'highlight' },
      { text: 'INNO-BIZ 벤처기업 인증', tag: 'cert' },
    ],
  },
  {
    year: '2010',
    events: [
      { text: '파주공장 확장 이전', tag: 'highlight' },
      { text: '도색 라인 생산시설 구축 (분체/액체)', tag: 'tech' },
      { text: '판금 자동화 설비 교체', tag: 'tech' },
    ],
  },
  {
    year: '2005',
    events: [
      { text: '판금설비 구축', tag: 'tech' },
      { text: '프레스 시설 마련', tag: 'tech' },
    ],
  },
  {
    year: '2002',
    events: [
      { text: '실용신안 등록', tag: 'cert' },
      { text: '발명특허 등록', tag: 'cert' },
      { text: '디자인 등록', tag: 'cert' },
    ],
  },
  {
    year: '1992',
    events: [
      { text: '실용신안 등록', tag: 'cert' },
      { text: '외장 등록', tag: 'cert' },
      { text: '발명특허 등록', tag: 'cert' },
    ],
  },
  {
    year: '1991',
    events: [{ text: '에이스엔지니어링 설립', tag: 'origin' }],
  },
]

const TAG_LABEL: Record<Era, string> = {
  highlight: 'Milestone',
  tech: 'Tech',
  cert: 'Certification',
  project: 'Project',
  origin: 'Origin',
}

const TAG_COLOR: Record<Era, string> = {
  highlight: 'bg-blue-50 text-blue-700 ring-blue-100',
  tech: 'bg-neutral-100 text-neutral-700 ring-neutral-200',
  cert: 'bg-amber-50 text-amber-700 ring-amber-100',
  project: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  origin: 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white ring-blue-200',
}

// ───────────────────────── 메인 ─────────────────────────

export default function HistoryTimeline() {
  return (
    <main className="bg-white text-neutral-900">
      <Hero />
      <Timeline />
      <Closing />
    </main>
  )
}

// ───────────────────────── 1) HERO ─────────────────────────

function Hero() {
  const { ref, shown } = useReveal<HTMLElement>(0.1)
  const totalEvents = TIMELINE.reduce((sum, y) => sum + y.events.length, 0)
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
          Our History · Since 1991
        </p>

        <h1
          className={`mt-6 text-[40px] font-extrabold leading-[1.15] tracking-tight md:text-[68px] transition-all duration-1000 delay-150 ${
            shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          시간이 만든 깊이,
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            한 걸음씩 쌓아온 신뢰.
          </span>
        </h1>

        <p
          className={`mt-8 max-w-[620px] text-[15px] leading-[1.9] text-neutral-600 md:text-[17px] transition-all duration-1000 delay-300 ${
            shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          1991년 작은 공장에서 시작해, 디자인 연구소·국내 최대 생산시설을 갖춘 환경·산업디자인
          전문 기업으로. 지난 30여 년간 에이스엔지니어링이 걸어온 길을 기록으로 전합니다.
        </p>

        {/* 미니 스탯 */}
        <div
          className={`mt-12 flex flex-wrap gap-x-12 gap-y-4 text-[13px] transition-all duration-1000 delay-500 ${
            shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <MiniStat value="1991" label="시작" />
          <MiniStat value={`${TIMELINE.length}`} label="기록된 해" />
          <MiniStat value={`${totalEvents}`} label="누적 마일스톤" />
        </div>
      </div>
    </section>
  )
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[24px] font-extrabold tracking-tight text-neutral-900">
        {value}
      </span>
      <span className="text-[12px] uppercase tracking-[0.25em] text-neutral-400">
        {label}
      </span>
    </div>
  )
}

// ───────────────────────── 2) TIMELINE ─────────────────────────

function Timeline() {
  const { ref, progress } = useScrollProgress<HTMLDivElement>()

  return (
    <section className="border-t border-neutral-100">
      <div className="mx-auto max-w-[1100px] px-6 py-24 md:py-32">
        <header className="mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-blue-700">
            Timeline
          </p>
          <h2 className="mt-3 text-[28px] font-bold leading-[1.3] md:text-[34px]">
            우리가 걸어온 길
          </h2>
          <p className="mt-3 max-w-[620px] text-[14px] leading-[1.85] text-neutral-500 md:text-[15px]">
            새로운 순서로 정렬되어 있습니다. 각 해의 마일스톤을 시간 순으로 따라가 보세요.
          </p>
        </header>

        {/* 타임라인 — 좌측 진행라인 + 연도 + 이벤트 카드 */}
        <div ref={ref} className="relative">
          {/* 회색 베이스 라인 */}
          <span
            aria-hidden
            className="absolute top-0 bottom-0 w-px bg-neutral-200 left-[64px] md:left-[140px]"
          />
          {/* 스크롤 진행 라인 */}
          <span
            aria-hidden
            className="absolute top-0 w-px bg-gradient-to-b from-blue-600 via-blue-500 to-cyan-400 left-[64px] md:left-[140px]"
            style={{
              height: `${progress * 100}%`,
              transition: 'height 100ms linear',
            }}
          />

          <ul className="space-y-12 md:space-y-20">
            {TIMELINE.map((row, idx) => (
              <YearRow key={row.year} row={row} index={idx} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function YearRow({ row, index }: { row: TimelineYear; index: number }) {
  const { ref, shown } = useReveal<HTMLLIElement>(0.25)
  const isOrigin = row.year === '1991'

  return (
    <li
      ref={ref}
      className="relative grid grid-cols-[64px_1fr] items-start gap-x-6 md:grid-cols-[140px_1fr] md:gap-x-10"
    >
      {/* 좌측 연도 + 점 */}
      <div className="relative">
        <div
          className={`text-[28px] font-extrabold leading-none tracking-tight md:text-[44px] transition-all duration-700 ${
            shown ? 'translate-x-0 opacity-100' : '-translate-x-3 opacity-0'
          } ${isOrigin ? 'bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent' : 'text-neutral-900'}`}
        >
          {row.year}
        </div>
        {/* 점 — 베이스 라인 위에 정확히 위치 */}
        <span
          aria-hidden
          className={`absolute top-2 right-[-7px] z-10 h-3.5 w-3.5 rounded-full ring-4 ring-white transition-all duration-500 md:top-3 md:right-[-7px] ${
            shown ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          } ${isOrigin ? 'bg-gradient-to-br from-blue-600 to-cyan-500' : 'bg-blue-600'}`}
          style={{ transitionDelay: shown ? `${100 + index * 20}ms` : '0ms' }}
        />
      </div>

      {/* 우측 이벤트 리스트 */}
      <ul className="space-y-3 pt-1 md:pt-2">
        {row.events.map((e, i) => {
          const tag = e.tag
          return (
            <li
              key={i}
              className={`group relative rounded-lg border border-transparent bg-neutral-50/0 px-4 py-3 transition-all duration-500 hover:border-neutral-200 hover:bg-neutral-50 ${
                shown ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
              }`}
              style={{ transitionDelay: shown ? `${200 + i * 100}ms` : '0ms' }}
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[15px] font-medium leading-relaxed text-neutral-800 md:text-[16px]">
                  {e.text}
                </span>
                {tag && (
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 transition ${TAG_COLOR[tag]}`}
                  >
                    {TAG_LABEL[tag]}
                  </span>
                )}
              </div>
              {/* 호버 시 좌측 강조선 */}
              <span className="pointer-events-none absolute left-0 top-3 bottom-3 w-[2px] origin-top scale-y-0 rounded-full bg-blue-500 transition-transform duration-300 group-hover:scale-y-100" />
            </li>
          )
        })}
      </ul>
    </li>
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
          Next Chapter
        </p>
        <h3
          className={`mt-3 text-[26px] font-bold leading-[1.4] md:text-[34px] transition-all duration-1000 delay-100 ${
            shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          앞으로의 걸음은
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            더 깨끗하고, 더 친절한 일상으로.
          </span>
        </h3>
        <p
          className={`mx-auto mt-6 max-w-[640px] text-[14px] leading-[1.85] text-neutral-600 md:text-[15px] transition-all duration-1000 delay-200 ${
            shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          기록은 지나간 시간이지만, 신뢰는 다음 한 걸음을 만듭니다. 에이스엔지니어링은 더 나은
          환경을 위해 멈추지 않고 나아가겠습니다.
        </p>
      </div>
    </section>
  )
}
