'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { EstimateInquiry } from '@/lib/types'

/**
 * 견적 폼 공통 제출 액션.
 *
 * 새 견적 폼을 추가할 때:
 *  1. URL slug 와 form_type 정하기 (예: '/drawing-request' / 'drawing-request')
 *  2. 새 폼의 actions.ts 에서 이 함수를 호출하면서 config 만 넘기면 됨
 *  3. 필드 검증/업로드/DB insert/이메일 알림/리다이렉트 모두 여기서 처리
 */

export type EstimateSubmitConfig = {
  formType: string
  /** 필수 필드명 — 비어있으면 에러로 리다이렉트 */
  required: string[]
  /** 첨부파일 필수 여부 (조건부면 호출 측에서 판정 후 전달) */
  fileRequired?: boolean
  /** 성공 후 이동 경로 (보통 ?submitted=1) */
  successUrl: string
  /** 에러 시 리다이렉트 prefix (예: '/design-estimate?error=') */
  errorUrlPrefix: string
  /** request_types 배열에 기본값을 박아두고 싶을 때 (예: ['design']) */
  requestTypeDefaults?: string[]
}

const FIELD_LABEL: Record<string, string> = {
  company_name: '업체명',
  client_name: '발주처',
  contact_name: '담당자명',
  phone: '연락처',
  email: '이메일',
  delivery_method: '납품방법',
  site_address: '현장 주소',
  due_date: '납기 요청일',
  model_name: '모델명',
  quantity: '수량',
  budget: '예산',
}

function getErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof Error) return e.message
  if (typeof e === 'object' && e !== null && 'message' in e) {
    const m = (e as { message?: unknown }).message
    if (typeof m === 'string') return m
  }
  return fallback
}

export async function submitEstimate(
  config: EstimateSubmitConfig,
  formData: FormData
) {
  const supabase = await createClient()

  const fail = (msg: string): never => {
    redirect(config.errorUrlPrefix + encodeURIComponent(msg))
  }

  const get = (k: string) => String(formData.get(k) ?? '').trim()

  // 1) 공통 필드 파싱
  const company_name = get('company_name') || null
  const client_name = get('client_name') || null
  const budget = get('budget') || null
  const contact_name = get('contact_name') || null
  const phone = get('phone') || null
  const email = get('email') || null
  const delivery_method = get('delivery_method') || null

  // 현장 주소: AddressSearchInput 은 site_address + site_address_detail 로 분리 전송
  const site_main = get('site_address')
  const site_detail = get('site_address_detail')
  const site_address = site_detail
    ? `${site_main} ${site_detail}`.trim()
    : site_main || null

  const due_date_raw = get('due_date')
  const due_date = due_date_raw || null
  const model_name = get('model_name') || null
  const quantity = get('quantity') || null
  const note = get('note') || null
  const privacy_agreed = formData.get('privacy_agreed') === 'on'

  const request_types = formData
    .getAll('request_types')
    .map((v) => String(v).trim())
    .filter(Boolean)
  if (request_types.length === 0 && config.requestTypeDefaults?.length) {
    request_types.push(...config.requestTypeDefaults)
  }

  const extra_options = formData
    .getAll('extra_options')
    .map((v) => String(v).trim())
    .filter(Boolean)
  // 단일 boolean 체크박스 값 (예: drawing_request) — 'on' 이면 키 자체를 옵션 배열로 추가
  for (const [k, v] of formData.entries()) {
    if (v === 'on' && k.endsWith('_request') && !extra_options.includes(k)) {
      extra_options.push(k)
    }
  }

  // 2) 필수 검증
  const allValues: Record<string, string | null> = {
    company_name,
    client_name,
    budget,
    contact_name,
    phone,
    email,
    delivery_method,
    site_address,
    due_date,
    model_name,
    quantity,
  }
  for (const key of config.required) {
    if (!allValues[key]) {
      fail(`${FIELD_LABEL[key] ?? key} 을(를) 입력해주세요.`)
    }
  }

  if (email && !/.+@.+\..+/.test(email)) fail('올바른 이메일 형식이 아닙니다.')
  if (!privacy_agreed) fail('개인정보 처리 방침에 동의해주세요.')

  // 3) 첨부파일
  const file = formData.get('attachment') as File | null
  const hasFile = !!(file && file.size > 0)
  if (config.fileRequired && !hasFile) {
    fail('참고용 이미지 또는 도면 파일을 첨부해주세요.')
  }

  let attachment_path: string | null = null
  let attachment_name: string | null = null
  if (hasFile && file) {
    const ext = file.name.split('.').pop() ?? 'bin'
    const path = `${config.formType}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${ext}`
    const { error: upErr } = await supabase.storage
      .from('estimate-files')
      .upload(path, file, { contentType: file.type, upsert: false })
    if (upErr) fail('파일 업로드 실패: ' + upErr.message)
    attachment_path = path
    attachment_name = file.name
  }

  // 4) Insert
  const { data: inserted, error } = await supabase
    .from('estimate_inquiries')
    .insert({
      form_type: config.formType,
      request_types,
      company_name,
      client_name,
      budget,
      contact_name,
      phone,
      email,
      delivery_method,
      site_address,
      due_date,
      model_name,
      quantity,
      extra_options,
      note,
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
    fail('저장 실패: ' + getErrorMessage(error, '알 수 없는 오류'))
  }

  // 5) 이메일 알림 placeholder
  await notifyEstimateInquiry(inserted as EstimateInquiry)

  // 6) revalidate + redirect
  revalidatePath('/admin/estimates')
  redirect(config.successUrl)
}

/**
 * TODO: 이메일 알림 발송 — Resend / SES / SMTP 연결 지점.
 * 현재는 콘솔 로그만 (서버 로그에서 추적 가능).
 */
async function notifyEstimateInquiry(inquiry: EstimateInquiry) {
  console.log('[estimate inquiry]', {
    id: inquiry.id,
    form_type: inquiry.form_type,
    contact: inquiry.contact_name,
    email: inquiry.email,
    phone: inquiry.phone,
  })
}
