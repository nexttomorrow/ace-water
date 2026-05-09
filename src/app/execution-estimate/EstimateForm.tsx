"use client";

import { useMemo, useState } from "react";
import AddressSearchInput from "@/components/AddressSearchInput";
import ModelItemsField from "@/components/estimate-form/ModelItemsField";
import Select from "@/components/ui/Select";
import {
  ESTIMATE_REQUEST_TYPES,
  ESTIMATE_DELIVERY_METHODS,
  ESTIMATE_EXTRA_OPTIONS,
} from "@/lib/types";
import ContactInfoBox from "@/components/ContactInfoBox";
import PrivacyAgreementBox from "@/components/PrivacyAgreementBox";
import { optimizeImageFile } from "@/components/OptimizedImageInput";
import type { EstimateProductOption } from "@/lib/estimates/products-for-picker";

type Props = {
  action: (formData: FormData) => Promise<void>;
  errorMessage?: string;
  initialModelName?: string;
  productOptions?: EstimateProductOption[];
  productCategories?: { id: number; name: string }[];
};

export default function EstimateForm({
  action,
  errorMessage,
  initialModelName,
  productOptions,
  productCategories,
}: Props) {
  const [requestTypes, setRequestTypes] = useState<string[]>([]);
  const [deliveryMethod, setDeliveryMethod] = useState<string>("");
  const [extraOptions, setExtraOptions] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>("");

  const isManufacture = requestTypes.includes("manufacture");
  const isInstall = deliveryMethod === "install";

  const toggle = (
    list: string[],
    setList: (n: string[]) => void,
    value: string,
  ) => {
    setList(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    );
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const f = input.files?.[0];
    if (!f) {
      setFileName("");
      return;
    }
    // 이미지면 클라이언트 단에서 자동 리사이즈 + WEBP 재인코딩
    if (f.type.startsWith("image/") && f.type !== "image/svg+xml") {
      try {
        const optimized = await optimizeImageFile(f, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 85,
          format: "WEBP",
        });
        if (optimized !== f) {
          const dt = new DataTransfer();
          dt.items.add(optimized);
          input.files = dt.files;
        }
        setFileName(optimized.name);
        return;
      } catch {
        // 실패 시 원본 사용
      }
    }
    setFileName(f.name);
  };

  // 오늘 이후 날짜만 선택 가능하도록 min 값 계산
  const minDate = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  return (
    <form action={action} className="flex flex-col gap-12">
      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[0.875rem] text-red-700">
          {errorMessage}
        </div>
      )}

      <p className="-mb-6 text-right text-[0.75rem] text-red-600">
        <span aria-hidden>*</span>표시는 필수 기입란입니다.
      </p>

      {/* ① 요청사항 */}
      <Section english="Request" title="요청사항">
        <p className="mb-4 text-[0.75rem] text-neutral-500">
          해당하는 요청 항목을 모두 체크해주세요. (1개 이상)
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {ESTIMATE_REQUEST_TYPES.map((opt) => {
            const checked = requestTypes.includes(opt.value);
            return (
              <label
                key={opt.value}
                className={`group flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-[0.875rem] transition ${
                  checked
                    ? "border-blue-500 bg-blue-50/60 text-blue-900"
                    : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50"
                }`}
              >
                <input
                  type="checkbox"
                  name="request_types"
                  value={opt.value}
                  checked={checked}
                  onChange={() =>
                    toggle(requestTypes, setRequestTypes, opt.value)
                  }
                  className="h-4 w-4 cursor-pointer accent-blue-600"
                />
                <span className="font-medium">{opt.label}</span>
              </label>
            );
          })}
        </div>
      </Section>

      {/* ② 업체정보 */}
      <Section english="Company" title="업체정보">
        <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-3">
          <Field label="업체명" required>
            <input
              type="text"
              name="company_name"
              required
              placeholder="ex.업체명"
              className={inputCls}
            />
          </Field>
          <Field label="발주처" required>
            <input
              type="text"
              name="client_name"
              required
              placeholder="ex.발주처명"
              className={inputCls}
            />
          </Field>
          <Field label="예산">
            <input
              type="text"
              name="budget"
              placeholder="제작의뢰 시 기입"
              className={inputCls}
            />
          </Field>
          <Field label="담당자명" required>
            <input
              type="text"
              name="contact_name"
              required
              placeholder="ex.홍길동"
              className={inputCls}
            />
          </Field>
          <Field label="연락처" required>
            <input
              type="tel"
              name="phone"
              required
              placeholder="ex.000-0000-0000"
              className={inputCls}
            />
          </Field>
          <Field label="이메일" required>
            <input
              type="email"
              name="email"
              required
              placeholder="ex.acewater@acewater.net"
              className={inputCls}
            />
          </Field>
        </div>
      </Section>

      {/* ③ 납품방법 */}
      <Section english="Delivery" title="납품방법">
        <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
          <Field label="납품방법" required>
            <Select
              name="delivery_method"
              required
              value={deliveryMethod}
              onChange={setDeliveryMethod}
              options={ESTIMATE_DELIVERY_METHODS.map((m) => ({
                value: m.value,
                label: m.label,
              }))}
              placeholder="선택"
            />
          </Field>
          <Field label="납기 요청일(예상)">
            <input
              type="date"
              name="due_date"
              min={minDate}
              className={inputCls}
            />
          </Field>
          <Field label="현장 주소" required className="md:col-span-2">
            <AddressSearchInput
              name="site_address"
              required
              placeholder="주소 검색을 눌러 입력해주세요"
              className={inputCls}
              withDetailField
            />
          </Field>
        </div>

        <ul className="mt-5 space-y-1.5 text-[0.75rem] leading-[1.7] text-red-600">
          <li>
            * 제주 등 섬지역의 경우 공장상차도(발주처 직접배차)만 가능합니다.
          </li>
          <li>
            * 설치도 요청 시 지게차 인입 필수입니다. 인입 불가 현장의 경우
            발주처에서 직접 하차·운반해주셔야 합니다.
          </li>
        </ul>

        {isInstall && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-[0.75rem] font-medium text-amber-800 ring-1 ring-amber-100">
            ⚠️ 설치도를 선택하셨습니다. 현장에 지게차 인입이 가능한지 미리 확인
            부탁드립니다.
          </p>
        )}
      </Section>

      {/* ④ 제품정보 */}
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

        <div className="mt-6">
          <p className="mb-3 text-[0.875rem] font-medium text-neutral-700">
            추가요청
          </p>
          <div className="space-y-3">
            {ESTIMATE_EXTRA_OPTIONS.map((opt) => {
              const checked = extraOptions.includes(opt.value);
              return (
                <div
                  key={opt.value}
                  className="rounded-lg border border-neutral-200 bg-white p-4 transition hover:border-neutral-300"
                >
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      name="extra_options"
                      value={opt.value}
                      checked={checked}
                      onChange={() =>
                        toggle(extraOptions, setExtraOptions, opt.value)
                      }
                      className="mt-1 h-4 w-4 cursor-pointer accent-blue-600"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.875rem] font-semibold text-neutral-900">
                        {opt.label}
                      </span>
                      <span className="mt-1 block text-[0.75rem] leading-[1.7] text-neutral-500">
                        {opt.desc}
                      </span>
                    </span>
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ⑤ 참고사항 */}
      <Section english="Notes" title="참고사항">
        <textarea
          name="note"
          rows={5}
          placeholder={`ex) 현장 총 2개소로 거리가 약 2km 떨어져 있습니다.\nex) 바닥 마감재 사용 예정입니다. 설치가 가능한가요?`}
          className={`${inputCls} resize-y`}
        />
      </Section>

      {/* ⑥ 파일첨부 */}
      <Section english="Attachment" title="파일첨부">
        <label className="block">
          <span className="sr-only">파일첨부</span>
          <div className="flex items-stretch gap-2">
            <div className="flex flex-1 items-center rounded-lg border border-neutral-300 bg-white px-3 text-[0.875rem] text-neutral-500">
              {fileName || "도면 등 참고용 파일을 선택해주세요"}
            </div>
            <span className="cursor-pointer rounded-lg bg-neutral-900 px-5 py-2.5 text-[0.875rem] font-medium text-white transition hover:bg-neutral-700">
              파일 선택
            </span>
          </div>
          <input
            type="file"
            name="attachment"
            onChange={onFileChange}
            className="sr-only"
            accept="image/*,application/pdf,.dwg,.dxf,.zip,.hwp,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
          />
        </label>
        <p
          className={`mt-2 text-[0.75rem] leading-[1.7] ${
            isManufacture ? "font-semibold text-red-600" : "text-neutral-500"
          }`}
        >
          {isManufacture
            ? "* 제작의뢰의 경우 참고용 이미지 또는 도면 파일 첨부가 필수입니다."
            : "* 디자인 제작의뢰 시 참고용 이미지/도면 첨부가 필수입니다. (선택 항목)"}
        </p>
      </Section>

      {/* 하단 동의 및 안내 (묶음) */}
      <div className="flex flex-col gap-3 border-t border-neutral-100 pt-8">
        <PrivacyAgreementBox />
        <ContactInfoBox />
      </div>

      <p className="-mt-6 text-center text-[0.75rem] text-neutral-500">
        빠른 시일 내에 회신드리도록 하겠습니다.
      </p>

      {/* 제출 */}
      <div className="flex justify-center">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-10 py-3.5 text-[0.875rem] font-bold text-white shadow-[0_18px_36px_-18px_rgba(37,99,235,0.5)] transition hover:shadow-[0_22px_40px_-18px_rgba(37,99,235,0.6)]"
        >
          제출하기
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </form>
  );
}

// ───────────── 부품 ─────────────

const inputCls =
  "w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-[0.875rem] text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";

function Section({
  english,
  title,
  children,
}: {
  english: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <header className="mb-5 border-b border-neutral-200 pb-3">
        <p className="text-[0.75rem] font-semibold uppercase tracking-[0.35em] text-blue-700">
          {english}
        </p>
        <h2 className="mt-1.5 text-[1.125rem] font-bold tracking-tight md:text-[1.25rem]">
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 flex items-baseline gap-1 text-[0.875rem] font-medium text-neutral-800">
        {required && <span className="text-red-600">*</span>}
        {label}
      </label>
      {children}
    </div>
  );
}
