export type Profile = {
  id: string
  nickname: string | null
  role: 'user' | 'admin'
  created_at: string
}

export type Post = {
  id: number
  author_id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

export type PostWithAuthor = Post & {
  author: Pick<Profile, 'nickname'> | null
}

export type GalleryItem = {
  id: number
  title: string
  description: string | null
  image_path: string
  created_at: string
  category_id: number | null
  model_name: string | null
  site_name: string | null
  client_name: string | null
  product_hrefs: string[]
  additional_images: string[]
  is_active: boolean
}

export type ProductComponent = {
  name: string
  target_id: number | null
}

export type ProductColor = {
  /** 색상명 (예: "코발트 바이올렛") */
  name: string
  /** CSS color (예: "#5B548E", "white", "rgb(...)") */
  hex: string
}

export type Product = {
  id: number
  category_id: number | null
  name: string
  model_name: string | null
  install_type: string | null
  /** 보조 사이즈 메모 (여러 줄 자유 입력 — 예: "음수대 W… / 차양 W…") */
  size_text: string | null
  /** 가로 (mm) */
  size_w: number | null
  /** 깊이 (mm) */
  size_d: number | null
  /** 높이 (mm) */
  size_h: number | null
  material: string | null
  components: ProductComponent[]
  extras_text: string | null
  main_image_path: string
  additional_images: string[]
  description: string
  spec_sheet_path: string | null
  color_chart_path: string | null
  colors: ProductColor[]
  tags: string[]
  /** key → 선택된 옵션 값들의 배열 (필터값) */
  filter_values: Record<string, string[]>
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

// ───────────── 제품 필터 (카테고리별) ─────────────

export type ProductFilterOption = {
  value: string
  label: string
  /** 색상 필터의 옵션에만 노출되는 hex (자동 합성) */
  hex?: string
}

export type ProductFilter = {
  id: number
  /** null = 모든 카테고리에 공통 적용되는 글로벌 필터 */
  category_id: number | null
  key: string
  label: string
  options: ProductFilterOption[]
  is_visible: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

/**
 * 제품 태그 — 배지·필터·메인 섹션 노출 기준.
 * 새 태그 추가 시 여기만 추가하면 어드민 폼·홈 섹션·배지 자동 반영.
 */
export const PRODUCT_TAGS = [
  {
    value: 'new',
    label: 'NEW',
    short: '신제품',
    desc: '새로 출시된 제품. 홈 페이지 "New Product" 섹션에 자동 노출됩니다.',
    tone: 'blue',
  },
  {
    value: 'best',
    label: 'BEST',
    short: '베스트셀러',
    desc: '인기 제품. 홈 페이지 "Best Seller" 섹션에 자동 노출됩니다.',
    tone: 'red',
  },
  {
    value: 'recommended',
    label: 'PICK',
    short: '추천',
    desc: '담당자 추천 제품. 카드에 PICK 배지로 강조됩니다.',
    tone: 'amber',
  },
  {
    value: 'featured',
    label: '대표',
    short: '대표제품',
    desc: '브랜드 대표·주력 제품. 카탈로그 상단/관련 영역에 우선 노출됩니다.',
    tone: 'neutral',
  },
  {
    value: 'pet',
    label: '반려견용',
    short: '반려견용',
    desc: '반려견 전용 / 반려견 친화 제품. 카드에 반려견용 배지가 표시됩니다.',
    tone: 'amber',
  },
  {
    value: 'accessible',
    label: '장애인용',
    short: '장애인용',
    desc: '장애인 편의 시설용 제품. 카드에 장애인용 배지가 표시됩니다.',
    tone: 'blue',
  },
] as const

export type ProductTag = (typeof PRODUCT_TAGS)[number]['value']

export const PRODUCT_TAG_BY_VALUE: Record<string, (typeof PRODUCT_TAGS)[number]> =
  Object.fromEntries(PRODUCT_TAGS.map((t) => [t.value, t]))

export type ProductOption = {
  href: string
  name: string
  /** 부모(섹션) 이름. 없으면 최상위 메뉴 자체. */
  group: string | null
}

export type ConstructionCaseCategory = {
  id: number
  name: string
  slug: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export type Category = {
  id: number
  parent_id: number | null
  name: string
  slug: string | null
  description: string | null
  image_path: string | null
  display_type: 'tile' | 'link' | 'text'
  href: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  banner_image_path: string | null
  banner_title: string | null
  banner_subtitle: string | null
}

export type CategoryWithChildren = Category & {
  children: Category[]
}

export type HeroSlide = {
  id: number
  eyebrow: string
  title: string
  image_path: string
  sort_order: number
  created_at: string
}

export const HERO_SLIDES_MAX = 6
export const CASE_ADDITIONAL_MAX = 8

// ───────────── 견적/도면 문의 ─────────────

export type EstimateStatus = 'new' | 'in_progress' | 'done' | 'archived'

export type EstimateInquiry = {
  id: number
  form_type: string
  request_types: string[]
  company_name: string | null
  client_name: string
  budget: string | null
  contact_name: string
  phone: string
  email: string
  delivery_method: string
  site_address: string
  due_date: string | null
  model_name: string
  quantity: string
  extra_options: string[]
  note: string | null
  attachment_path: string | null
  attachment_name: string | null
  privacy_agreed: boolean
  status: EstimateStatus
  notified_at: string | null
  created_at: string
}

export const ESTIMATE_REQUEST_TYPES = [
  { value: 'execution', label: '실행견적(업체납품)' },
  { value: 'design', label: '설계견적(관공서, 학교, 어린이집)' },
  { value: 'drawing', label: '도면 요청' },
  { value: 'manufacture', label: '제작의뢰' },
] as const

export const ESTIMATE_DELIVERY_METHODS = [
  { value: 'factory', label: '공장상차도(운임별도)' },
  { value: 'arrival', label: '도착도' },
  { value: 'install', label: '설치도' },
] as const

export const ESTIMATE_EXTRA_OPTIONS = [
  {
    value: 'drain_valve_box',
    label: '급퇴수밸브함',
    desc: '동파방지관리용 퇴수(드레인) 작업용 함입니다. 필수 설치를 권장드리며, 발주처 선매립시공분입니다.',
  },
  {
    value: 'circular_trench',
    label: '원형트렌치',
    desc: '별도 배수트렌치 입니다. 제품에따라 추가 선택하시기 바라며, 발주처 선매립시공분입니다.',
  },
] as const

export const ESTIMATE_STATUS_LABEL: Record<EstimateStatus, string> = {
  new: '신규',
  in_progress: '진행중',
  done: '완료',
  archived: '보관',
}

/**
 * 견적 문의 폼 타입.
 * estimate_inquiries.form_type 컬럼 값과 일치.
 * 신규 폼 추가 시 이 맵에 라벨만 등록하면 어드민/표시 자동 반영.
 */
export const ESTIMATE_FORM_TYPE_LABEL: Record<string, string> = {
  execution: '견적·도면 문의 (통합)', // 레거시 — 기존 /execution-estimate
  'execution-estimate': '실행견적',
  'design-estimate': '실행견적', // 사용자 명세상 동일 라벨 사용
  'drawing-request': '도면 요청',
  'manufacture-request': '제작 의뢰',
}

