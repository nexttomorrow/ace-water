'use client'

type Logo = { name: string; hue: string }

const ROW_1: Logo[] = [
  { name: '삼성전자', hue: 'text-blue-600' },
  { name: 'LG화학', hue: 'text-rose-600' },
  { name: 'SK하이닉스', hue: 'text-orange-500' },
  { name: '현대자동차', hue: 'text-sky-700' },
  { name: 'POSCO', hue: 'text-blue-700' },
  { name: 'CJ제일제당', hue: 'text-red-600' },
  { name: '롯데케미칼', hue: 'text-rose-700' },
  { name: '한화솔루션', hue: 'text-amber-600' },
]

const ROW_2: Logo[] = [
  { name: 'NAVER', hue: 'text-emerald-600' },
  { name: 'KAKAO', hue: 'text-yellow-500' },
  { name: '쿠팡', hue: 'text-rose-500' },
  { name: '배달의민족', hue: 'text-teal-500' },
  { name: 'TOSS', hue: 'text-blue-500' },
  { name: '당근마켓', hue: 'text-orange-500' },
  { name: '야놀자', hue: 'text-pink-500' },
  { name: '직방', hue: 'text-indigo-500' },
]

const ROW_3: Logo[] = [
  { name: '한국전력', hue: 'text-blue-700' },
  { name: 'K-water', hue: 'text-cyan-600' },
  { name: '서울대병원', hue: 'text-sky-700' },
  { name: '아산병원', hue: 'text-emerald-700' },
  { name: '세브란스', hue: 'text-blue-800' },
  { name: '서울시청', hue: 'text-indigo-700' },
  { name: '인천국제공항', hue: 'text-sky-600' },
  { name: 'KOICA', hue: 'text-teal-700' },
]

function LogoCard({ logo }: { logo: Logo }) {
  return (
    <div className="group/logo mx-3 flex h-[84px] w-[200px] shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white opacity-60 grayscale transition duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.03] hover:opacity-100 hover:grayscale-0 hover:border-neutral-300 hover:shadow-md hover:shadow-neutral-300/40">
      <span className={`text-[1rem] font-extrabold tracking-tight ${logo.hue}`}>
        {logo.name}
      </span>
    </div>
  )
}

function MarqueeRow({
  items,
  direction,
  duration,
}: {
  items: Logo[]
  direction: 'left' | 'right'
  duration: number
}) {
  const animationName = direction === 'left' ? 'aw-marquee-left' : 'aw-marquee-right'
  return (
    <div
      className="group/row relative overflow-hidden py-2"
      style={{
        WebkitMaskImage:
          'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
        maskImage:
          'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
      }}
    >
      <div
        className="flex w-max group-hover/row:[animation-play-state:paused]"
        style={{ animation: `${animationName} ${duration}s linear infinite` }}
      >
        {[...items, ...items].map((logo, i) => (
          <LogoCard key={`${logo.name}-${i}`} logo={logo} />
        ))}
      </div>
    </div>
  )
}

export default function ClientsMarquee() {
  return (
    <div className="space-y-3">
      <style>{`
        @keyframes aw-marquee-left {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes aw-marquee-right {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
      `}</style>
      <MarqueeRow items={ROW_1} direction="left" duration={48} />
      <MarqueeRow items={ROW_2} direction="right" duration={42} />
      <MarqueeRow items={ROW_3} direction="left" duration={54} />
    </div>
  )
}
