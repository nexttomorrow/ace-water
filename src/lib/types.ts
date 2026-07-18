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
  /** 수량 — 미지정·0·1 이면 표시상 "× N" 생략 */
  quantity?: number | null
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

// ───────────── 통합 태그 (DB driven) ─────────────

export type TagScope = 'product' | 'qna'
export type TagTone = 'blue' | 'red' | 'amber' | 'neutral' | 'green' | 'purple'

export type Tag = {
  id: number
  scope: TagScope
  value: string
  label: string
  tone: TagTone
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export const TAG_TONES: TagTone[] = ['blue', 'red', 'amber', 'neutral', 'green', 'purple']

export const TAG_TONE_BADGE_CLS: Record<TagTone, string> = {
  blue: 'bg-blue-600 text-white',
  red: 'bg-red-600 text-white',
  amber: 'bg-amber-500 text-white',
  neutral: 'bg-neutral-900 text-white',
  green: 'bg-emerald-600 text-white',
  purple: 'bg-purple-600 text-white',
}

export const TAG_TONE_PILL_CLS: Record<TagTone, string> = {
  blue: 'border-blue-200 bg-blue-50 text-blue-700',
  red: 'border-red-200 bg-red-50 text-red-700',
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
  neutral: 'border-neutral-200 bg-neutral-100 text-neutral-700',
  green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  purple: 'border-purple-200 bg-purple-50 text-purple-700',
}

/**
 * @deprecated DB 의 tags 테이블이 정식 출처입니다. 디스플레이 폴백용으로만 유지.
 * 새 태그 추가는 /admin/tags 에서 하세요.
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
  /** 해당 슬라이드가 화면에 머무는 시간(ms) */
  duration_ms: number
  created_at: string
}

export const HERO_SLIDES_MAX = 6

// ───────────── 히어로 슬라이드 속도(표시 시간) ─────────────
/** 슬라이드 표시 시간 기본값 (ms) */
export const HERO_DURATION_DEFAULT_MS = 5000
/** 최소 표시 시간 (ms) — 2초 */
export const HERO_DURATION_MIN_MS = 2000
/** 최대 표시 시간 (ms) — 12초 */
export const HERO_DURATION_MAX_MS = 12000
/** 슬라이드 전환(페이드) 시간 (ms) */
export const HERO_TRANSITION_MS = 900

/** 입력값을 허용 범위(ms)로 보정. 유효하지 않으면 기본값. */
export function clampHeroDuration(value: unknown): number {
  const n = Math.round(Number(value))
  if (!Number.isFinite(n)) return HERO_DURATION_DEFAULT_MS
  return Math.min(HERO_DURATION_MAX_MS, Math.max(HERO_DURATION_MIN_MS, n))
}
export const CASE_ADDITIONAL_MAX = 8

// ───────────── 인증서 (회사소개 하단) ─────────────

export type Certification = {
  id: number
  title: string
  subtitle: string
  image_path: string
  sort_order: number
  created_at: string
}

/** 인증서 그리드 한 줄에 표시하는 개수 */
export const CERTIFICATIONS_PER_ROW = 5
/** "더보기" 없이 처음 보여주는 개수 (2줄) */
export const CERTIFICATIONS_INITIAL_VISIBLE = CERTIFICATIONS_PER_ROW * 2

// ───────────── 퀵메뉴 (우측 플로팅) ─────────────

export type QuickMenuItem = {
  id: number
  title: string
  href: string
  icon_key: string
  sort_order: number
  created_at: string
}

/** 퀵메뉴 최대 개수 */
export const QUICK_MENU_MAX = 8
/** 퀵메뉴 타이틀 최대 글자수 */
export const QUICK_MENU_TITLE_MAX = 10

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

// ═════════════════ 팝업 시스템 ═════════════════
// DB 테이블: public.popups (supabase/popups.sql)

/** 팝업 유형 — 레이어(딤드+중앙) / 일반(좌표) */
export type PopupType = 'layer' | 'general'
/** 본문 유형 */
export type PopupContentType = 'image' | 'html'
/** 노출 대상 기기 (반응형 노출 제어) */
export type PopupDevice = 'all' | 'pc' | 'mobile'
/** 다시 보지 않기 옵션 — 오늘 하루(24h) / 일주일(168h) / 사용 안 함(닫기만) */
export type PopupDismiss = 'today' | 'week' | 'none'

/** 팝업 레코드 (popups 테이블과 1:1) */
export type Popup = {
  id: number
  title: string
  /** 본문 유형 — 'image' 면 image_url, 'html' 면 body_html 사용 */
  content_type: PopupContentType
  /** content_type='image' — 외부 URL 또는 업로드된 이미지 public URL */
  image_url: string | null
  /** content_type='html' — 정화(sanitize)된 HTML */
  body_html: string | null
  /** 콘텐츠 클릭 시 이동할 링크 (없으면 링크 없음) */
  link_url: string | null
  /** 링크를 새 탭으로 열지 여부 */
  open_new_tab: boolean
  popup_type: PopupType
  /** 노출 대상 기기 (전체/PC/모바일) — 반응형 노출 */
  device: PopupDevice
  /** 노출 시작 (ISO) */
  starts_at: string
  /** 노출 종료 (ISO) */
  ends_at: string
  /** general 유형 좌표 (px). null 이면 기본 배치 */
  pos_x: number | null
  pos_y: number | null
  /** 크기 (px). null = 콘텐츠 자동. 화면보다 크면 자동 축소(반응형) */
  width: number | null
  height: number | null
  /** 다시 보지 않기 옵션 (닫기 버튼은 항상 표시) */
  dismiss_option: PopupDismiss
  /** 노출 우선순위 — 작을수록 먼저 */
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

/** 어드민 폼 입력값 (id/타임스탬프 제외) */
export type PopupInput = Omit<Popup, 'id' | 'created_at' | 'updated_at'>

export const POPUP_TYPE_LABEL: Record<PopupType, string> = {
  layer: '레이어 팝업',
  general: '일반 팝업',
}

export const POPUP_TYPE_DESC: Record<PopupType, string> = {
  layer: '배경을 어둡게(딤드) 하고 화면 중앙에 고정 노출',
  general: '지정한 좌표(X, Y)에 노출',
}

export const POPUP_DEVICE_LABEL: Record<PopupDevice, string> = {
  all: '전체',
  pc: 'PC',
  mobile: '모바일',
}

export const POPUP_CONTENT_TYPE_LABEL: Record<PopupContentType, string> = {
  image: '이미지',
  html: '텍스트/HTML',
}

export const POPUP_DISMISS_LABEL: Record<PopupDismiss, string> = {
  today: '오늘 하루 보지 않기',
  week: '일주일간 보지 않기',
  none: '사용 안 함 (닫기만)',
}

/** dismiss 옵션 → 숨김 지속 시간(시간). 'none' 은 지속 숨김 없음 */
export const POPUP_DISMISS_HOURS: Record<Exclude<PopupDismiss, 'none'>, number> = {
  today: 24,
  week: 24 * 7,
}

export const POPUP_TYPES: PopupType[] = ['layer', 'general']
export const POPUP_DEVICES: PopupDevice[] = ['all', 'pc', 'mobile']
export const POPUP_DISMISSES: PopupDismiss[] = ['today', 'week', 'none']

/** 화면당 동시 노출 최대 개수 (임시 정책 — 정책 확정 시 조정) */
export const POPUP_MAX_VISIBLE = 3
/** 모바일 판별 기준 폭 (px, 이하이면 모바일로 간주) */
export const POPUP_MOBILE_BREAKPOINT = 768

// ═════════════════ 고객사 로고 (메인 하단 마퀴) ═════════════════
// DB 테이블: public.client_logos (supabase/client_logos.sql)

/** 고객사 로고 레코드 (client_logos 테이블과 1:1) */
export type ClientLogo = {
  id: number
  /** 로고 이름 (이미지 alt / 관리 목록 식별용) */
  name: string
  /** 로고 이미지 public URL 경로 (clients 버킷 내) */
  image_path: string
  /** 클릭 시 이동할 링크 (없으면 링크 없음) */
  link_url: string | null
  /** 노출 순서 — 작을수록 먼저 */
  sort_order: number
  is_active: boolean
  created_at: string
}

/** 등록 가능한 로고 최대 개수 */
export const CLIENT_LOGOS_MAX = 60
/** 로고 카드 고정 크기 (px) — 마퀴 카드/크롭 기준 */
export const CLIENT_LOGO_CARD_WIDTH = 200
export const CLIENT_LOGO_CARD_HEIGHT = 84
/** 마퀴 행 개수 (로고 수가 적으면 자동 축소) */
export const CLIENT_LOGO_ROWS = 3
/** 이 개수 이상 등록되면 정적 배치 대신 슬라이드(마퀴)로 전환 */
export const CLIENT_LOGO_SLIDE_MIN = 8

/** 섹션 on/off 설정 키 (site_settings) */
export const CLIENTS_SECTION_ENABLED_KEY = 'clients_section_enabled'

// ═════════════════ 사이트 로고 (헤더) ═════════════════
// site_settings 에 저장. 이미지가 없으면 텍스트 로고로 폴백.

/** 로고 텍스트 설정 키 */
export const SITE_LOGO_TEXT_KEY = 'logo_text'
/** 로고 이미지 경로 설정 키 (site 버킷) */
export const SITE_LOGO_IMAGE_KEY = 'logo_image_path'
/** 기본 로고 텍스트 */
export const SITE_LOGO_DEFAULT_TEXT = 'ACEWATER'
/** 헤더 로고 표시 높이 (px) — 현재 텍스트 로고와 비슷한 크기로 고정 */
export const SITE_LOGO_DISPLAY_HEIGHT = 32

