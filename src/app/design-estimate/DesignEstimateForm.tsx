'use client'

import { useMemo, useState } from 'react'
import EstimateShell from '@/components/estimate-form/Shell'
import {
  Section,
  TextField,
  SelectField,
  DateField,
  TextareaField,
  AddressField,
  FileField,
  CheckboxField,
  FieldRow,
  NoteList,
} from '@/components/estimate-form/fields'
import ModelItemsField from '@/components/estimate-form/ModelItemsField'
import { ESTIMATE_DELIVERY_METHODS } from '@/lib/types'
import type { EstimateProductOption } from '@/lib/estimates/products-for-picker'

type Props = {
  action: (formData: FormData) => Promise<void>
  errorMessage?: string
  /** 제품 상세 페이지에서 ?model= 으로 prefill */
  initialModelName?: string
  /** 도면문의 진입 시 도면 요청 체크박스 자동 ON */
  initialDrawingChecked?: boolean
  /** 모델명 모달용 — 등록된 활성 제품 */
  productOptions?: EstimateProductOption[]
  /** 모델명 모달용 — 제품 카테고리 */
  productCategories?: { id: number; name: string }[]
}

export default function DesignEstimateForm({
  action,
  errorMessage,
  initialModelName,
  initialDrawingChecked,
  productOptions,
  productCategories,
}: Props) {
  const [deliveryMethod, setDeliveryMethod] = useState('')
  const [fileName, setFileName] = useState('')

  const isInstall = deliveryMethod === 'install'

  // 오늘 이후 날짜만 선택 가능
  const minDate = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }, [])

  return (
    <EstimateShell action={action} errorMessage={errorMessage}>
      {/* ① 업체정보 */}
      <Section english="Company" title="업체정보">
        <FieldRow>
          <TextField
            name="client_name"
            label="발주처"
            required
            placeholder="ex.발주처명"
            className="md:col-span-3"
          />
        </FieldRow>
        <div className="mt-4">
          <FieldRow>
            <TextField name="contact_name" label="담당자명" required placeholder="ex.홍길동" />
            <TextField
              name="phone"
              label="연락처"
              required
              type="tel"
              placeholder="ex.000-0000-0000"
            />
            <TextField
              name="email"
              label="이메일"
              required
              type="email"
              placeholder="ex.acewater@acewater.net"
            />
          </FieldRow>
        </div>
      </Section>

      {/* ② 납품방법 */}
      <Section english="Delivery" title="납품방법">
        <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
          <SelectField
            name="delivery_method"
            label="납품방법"
            required
            options={ESTIMATE_DELIVERY_METHODS}
            defaultValue=""
            onChange={(value) => setDeliveryMethod(value)}
          />
          <DateField
            name="due_date"
            label="납기 요청일(예상)"
            required
            min={minDate}
          />
          <AddressField
            name="site_address"
            label="현장"
            required
            withDetailField
            className="md:col-span-2"
          />
        </div>

        <NoteList
          items={[
            '제주 등 섬지역의 경우 공장상차도(발주처 직접배차)만 가능합니다.',
            '설치도 요청 시 지게차 인입 필수입니다. 인입 불가 현장의 경우 발주처에서 직접 하차·운반해주셔야 합니다.',
          ]}
        />

        {isInstall && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-[0.75rem] font-medium text-amber-800 ring-1 ring-amber-100">
            ⚠️ 설치도를 선택하셨습니다. 현장에 지게차 인입이 가능한지 미리 확인 부탁드립니다.
          </p>
        )}
      </Section>

      {/* ③ 제품정보 */}
      <Section english="Product" title="제품정보">
        <div className="mb-3 flex items-baseline justify-between">
          <label className="flex items-baseline gap-1 text-[0.875rem] font-medium text-neutral-800">
            <span className="text-red-600">*</span>모델명 · 수량
          </label>
          <span className="text-[0.75rem] text-neutral-500">
            여러 모델을 한 번에 문의하실 수 있어요
          </span>
        </div>
        <ModelItemsField
          modelFieldName="model_name"
          quantityFieldName="quantity"
          required
          initialModel={initialModelName}
          options={productOptions ?? []}
          categories={productCategories ?? []}
        />

        <NoteList
          items={[
            '급퇴수밸브함 : 동파방지관리용 퇴수(드레인) 작업용 함입니다. 필수 설치를 권장드리며, 발주처 선매립시공분입니다.',
            '원형트렌치 : 별도 배수트렌치 입니다. 제품에따라 추가 선택하시기 바라며, 발주처 선매립시공분입니다.',
          ]}
        />

        <div className="mt-5">
          <p className="mb-2 text-[0.875rem] font-medium text-neutral-700">도면 요청</p>
          <CheckboxField
            name="drawing_request"
            label="도면 요청"
            description="도면 사본이 필요하신 경우 체크해주세요. (별도 회신)"
            defaultChecked={initialDrawingChecked}
          />
        </div>
      </Section>

      {/* ④ 참고사항 */}
      <Section english="Notes" title="참고사항">
        <TextareaField
          name="note"
          rows={5}
          placeholder={`ex) 현장 총 2개소로 거리가 약 2km 떨어져 있습니다.\nex) 바닥 마감재 사용 예정입니다. 설치가 가능한가요?`}
        />
      </Section>

      {/* ⑤ 파일첨부 */}
      <Section english="Attachment" title="파일첨부">
        <FileField
          name="attachment"
          accept="image/*,application/pdf,.dwg,.dxf,.zip,.hwp,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
          fileName={fileName}
          onChange={(e) => {
            const f = e.target.files?.[0]
            setFileName(f ? f.name : '')
          }}
          description={
            <span className="text-neutral-500">
              * 디자인 제작의뢰의 경우 참고용 이미지 또는 도면 파일 첨부를 권장드립니다.
            </span>
          }
        />
      </Section>
    </EstimateShell>
  )
}
