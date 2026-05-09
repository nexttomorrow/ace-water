import Image from 'next/image'
import SubPageBanner from '@/components/SubPageBanner'

const ITEMS = [
  { seed: 'ace-portfolio-1', title: '서울 강남 OO 빌딩', desc: '오피스 정수 시스템 시공', region: '서울' },
  { seed: 'ace-portfolio-2', title: '부산 사하 OO 공장', desc: '산업용 대용량 정수 설비', region: '부산' },
  { seed: 'ace-portfolio-3', title: '대구 수성 OO 아파트', desc: '단지 전체 미네랄 워터 시스템', region: '대구' },
  { seed: 'ace-portfolio-4', title: '인천 송도 OO 호텔', desc: '객실 정수 솔루션', region: '인천' },
  { seed: 'ace-portfolio-5', title: '광주 OO 종합병원', desc: '의료용 정수 시스템', region: '광주' },
  { seed: 'ace-portfolio-6', title: '대전 OO 학교', desc: '교내 직수형 정수기 시공', region: '대전' },
  { seed: 'ace-portfolio-7', title: '제주 OO 리조트', desc: '풀빌라 정수 솔루션', region: '제주' },
  { seed: 'ace-portfolio-8', title: '울산 OO 산업단지', desc: '공정수 시스템 구축', region: '울산' },
  { seed: 'ace-portfolio-9', title: '경기 화성 OO 물류센터', desc: '대규모 음용수 시스템', region: '경기' },
  { seed: 'ace-portfolio-10', title: '강원 OO 연수원', desc: '식수 + 연수 통합 시공', region: '강원' },
  { seed: 'ace-portfolio-11', title: '세종 OO 청사', desc: '관공서 정수 시스템', region: '세종' },
  { seed: 'ace-portfolio-12', title: '전주 OO 카페', desc: '커피 머신 전용 정수 시스템', region: '전주' },
]

export default function PortfolioPage() {
  return (
    <>
      <SubPageBanner
        href="/portfolio"
        fallbackTitle="포트폴리오"
        fallbackSubtitle="ACEWATER가 함께해온 다양한 현장을 만나보세요"
      />

      <div className="mx-auto max-w-[1440px] px-6 py-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map((item) => (
          <a key={item.seed} href="#" className="group block">
            <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
              <Image
                src={`https://picsum.photos/seed/${item.seed}/800/600`}
                alt={item.title}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                unoptimized
              />
              <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-0.5 text-[0.75rem] font-semibold text-white backdrop-blur">
                {item.region}
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-[1rem] font-bold text-neutral-900 group-hover:underline">
                {item.title}
              </h3>
              <p className="mt-1 text-[0.875rem] text-neutral-600">{item.desc}</p>
            </div>
          </a>
        ))}
        </div>
      </div>
    </>
  )
}
