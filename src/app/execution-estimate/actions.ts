'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  ESTIMATE_REQUEST_TYPES,
  ESTIMATE_DELIVERY_METHODS,
  ESTIMATE_EXTRA_OPTIONS,
  type EstimateInquiry,
} from '@/lib/types'

const REQUEST_TYPE_VALUES = ESTIMATE_REQUEST_TYPES.map((r) => r.value) as readonly string[]
const DELIVERY_METHOD_VALUES = ESTIMATE_DELIVERY_METHODS.map((d) => d.value) as readonly string[]
const EXTRA_OPTION_VALUES = ESTIMATE_EXTRA_OPTIONS.map((e) => e.value) as readonly string[]

const ERR_PATH = '/execution-estimate?error='

function fail(message: string): never {
  redirect(ERR_PATH + encodeURIComponent(message))
}

export async function submitEstimate(formData: FormData) {
  const supabase = await createClient()

  // 1) 파싱
  const request_types = formData
    .getAll('request_types')
    .map(String)
    .filter((v) => REQUEST_TYPE_VALUES.includes(v))
  const company_name = String(formData.get('company_name') ?? '').trim()
  const client_name = String(formData.get('client_name') ?? '').trim()
  const budget = String(formData.get('budget') ?? '').trim()
  const contact_name = String(formData.get('contact_name') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const delivery_method_raw = String(formData.get('delivery_method') ?? '').trim()
  const delivery_method = DELIVERY_METHOD_VALUES.includes(delivery_method_raw)
    ? delivery_method_raw
    : ''
  const site_address_main = String(formData.get('site_address') ?? '').trim()
  const site_address_detail = String(formData.get('site_address_detail') ?? '').trim()
  const site_address = site_address_detail
    ? `${site_address_main} ${site_address_detail}`.trim()
    : site_address_main
  const due_date_raw = String(formData.get('due_date') ?? '').trim()
  const due_date = due_date_raw || null
  const model_name = String(formData.get('model_name') ?? '').trim()
  const quantity = String(formData.get('quantity') ?? '').trim()
  const extra_options = formData
    .getAll('extra_options')
    .map(String)
    .filter((v) => EXTRA_OPTION_VALUES.includes(v))
  const note = String(formData.get('note') ?? '').trim()
  const privacy_agreed = formData.get('privacy_agreed') === 'on'
  const file = formData.get('attachment') as File | null

  // 2) 검증
  if (request_types.length === 0) fail('요청사항을 1개 이상 선택해주세요.')
  if (!company_name) fail('업체명을 입력해주세요.')
  if (!client_name) fail('발주처를 입력해주세요.')
  if (!contact_name) fail('담당자명을 입력해주세요.')
  if (!phone) fail('연락처를 입력해주세요.')
  if (!email) fail('이메일을 입력해주세요.')
  if (!/.+@.+\..+/.test(email)) fail('올바른 이메일 형식이 아닙니다.')
  if (!delivery_method) fail('납품방법을 선택해주세요.')
  if (!site_address) fail('현장 정보를 입력해주세요.')
  if (!model_name) fail('모델명을 입력해주세요.')
  if (!quantity) fail('수량을 입력해주세요.')
  if (!privacy_agreed) fail('개인정보 처리 방침에 동의해주세요.')

  // 제작의뢰 선택 시 첨부파일 필수
  const isManufacture = request_types.includes('manufacture')
  const hasFile = !!(file && file.size > 0)
  if (isManufacture && !hasFile) {
    fail('제작의뢰의 경우 참고용 이미지 또는 도면 파일을 첨부해주세요.')
  }

  // 3) 첨부 업로드
  let attachment_path: string | null = null
  let attachment_name: string | null = null
  if (hasFile && file) {
    const ext = file.name.split('.').pop() ?? 'bin'
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const { error: upErr } = await supabase.storage
      .from('estimate-files')
      .upload(path, file, { contentType: file.type, upsert: false })
    if (upErr) fail('파일 업로드 실패: ' + upErr.message)
    attachment_path = path
    attachment_name = file.name
  }

  // 4) DB insert
  const { data: inserted, error } = await supabase
    .from('estimate_inquiries')
    .insert({
      request_types,
      company_name,
      client_name,
      budget: budget || null,
      contact_name,
      phone,
      email,
      delivery_method,
      site_address,
      due_date,
      model_name,
      quantity,
      extra_options,
      note: note || null,
      attachment_path,
      attachment_name,
      privacy_agreed,
    })
    .select('*')
    .single()

  if (error) {
    if (attachment_path) {
      await supabase.storage.from('estimate-files').remove([attachment_path])
    }
    fail('저장 실패: ' + error.message)
  }

  // 5) (확장 지점) 이메일 알림 — 지금은 placeholder, 나중에 Resend/SES/SMTP 연결
  await notifyEstimateInquiry(inserted as EstimateInquiry)

  // 6) revalidate + 완료 페이지
  revalidatePath('/admin/estimates')
  redirect('/execution-estimate?submitted=1')
}

/**
 * TODO: 이메일 알림 발송
 * 추후 Resend / Amazon SES / SMTP 등으로 교체.
 * 지금은 콘솔 로그만 남겨 추적 가능하게 둠 (Vercel/서버 로그에서 확인 가능).
 *
 * 권장 시그널 (이 함수 안에서 처리):
 *  - 관리자 메일로 신규 문의 알림 (전체 본문 포함)
 *  - 문의자 메일로 접수 확인 자동회신
 */
async function notifyEstimateInquiry(inquiry: EstimateInquiry) {
  console.log('[estimate inquiry] new submission', {
    id: inquiry.id,
    company: inquiry.company_name,
    contact: inquiry.contact_name,
    email: inquiry.email,
    phone: inquiry.phone,
  })
  // 예시 (Resend SDK 연동 시):
  // await fetch('https://api.resend.com/emails', { ... })
}
