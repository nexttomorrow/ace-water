import React from "react";

export default function PrivacyAgreementBox() {
  return (
    <div className="w-full rounded-lg bg-neutral-100 p-5 text-[0.875rem]">
      {/* 개인정보처리방침 전문 스크롤 박스 */}
      <div className="mb-4 h-24 w-full overflow-y-auto rounded border border-neutral-200 bg-white p-4 text-[0.75rem] leading-relaxed text-neutral-500 shadow-inner">
        <p className="mb-4">
          에이스엔지니어링(이하 &quot;회사&quot;)은 정보주체의 자유와 권리
          보호를 위해 「개인정보 보호법」 및 관계 법령이 정한 바를 준수하여,
          적법하게 개인정보를 처리하고 안전하게 관리하고 있습니다. 이에
          「개인정보 보호법」 제30조에 따라 정보주체에게 개인정보 처리에 관한
          절차 및 기준을 안내하고, 이와 관련한 고충을 신속하고 원활하게 처리할
          수 있도록 하기 위하여 다음과 같이 개인정보처리방침을 수립·공개합니다.
        </p>

        <p className="mb-1 font-semibold text-neutral-900">
          제1조 (개인정보의 처리 목적)
        </p>
        <p className="mb-1">
          회사는 다음의 목적을 위하여 개인정보를 처리합니다.
        </p>
        <ul className="mb-4 list-inside list-disc pl-2">
          <li>
            홈페이지 회원가입 및 관리: 회원 가입의사 확인, 본인 식별·인증,
            회원자격 유지·관리, 서비스 부정이용 방지 등
          </li>
          <li>
            재화 또는 서비스 제공: 견적·도면 문의 응답, 서비스 제공, 계약서
            발송, 청구서 발송, A/S 처리 등
          </li>
          <li>
            고충처리: 민원인의 신원 확인, 민원사항 확인, 사실조사를 위한
            연락·통지, 처리결과 통보
          </li>
          <li>
            마케팅 및 광고에의 활용: 신규 서비스 개발 및 맞춤 서비스 제공,
            이벤트 정보 및 참여기회 제공 (별도 동의 시)
          </li>
        </ul>

        <p className="mb-1 font-semibold text-neutral-900">
          제2조 (수집하는 개인정보의 항목)
        </p>
        <ul className="mb-4 list-inside list-decimal pl-2">
          <li className="mb-1">
            필수항목
            <ul className="mt-1 list-inside list-disc pl-4">
              <li>회원가입 시: 이메일 주소, 비밀번호, 닉네임</li>
              <li>
                견적·도면 문의 시: 성명, 연락처, 회사명(선택), 이메일, 문의내용
              </li>
            </ul>
          </li>
          <li>
            자동 수집 항목
            <ul className="mt-1 list-inside list-disc pl-4">
              <li>
                접속 IP 정보, 쿠키, 방문 일시, 서비스 이용 기록, 기기 정보(OS,
                브라우저 종류 등)
              </li>
            </ul>
          </li>
        </ul>

        <p className="mb-1 font-semibold text-neutral-900">
          제3조 (개인정보의 처리 및 보유기간)
        </p>
        <ul className="mb-4 list-inside list-decimal pl-2">
          <li className="mb-1">
            회사는 법령에 따른 개인정보 보유·이용 기간 또는 정보주체로부터
            개인정보를 수집 시에 동의 받은 개인정보 보유·이용 기간 내에서
            개인정보를 처리·보유합니다.
          </li>
          <li>
            각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.
            <ul className="mt-1 list-inside list-disc pl-4">
              <li>회원가입 정보: 회원 탈퇴 시까지</li>
              <li>문의 내역: 처리 완료 후 3년 보관 (전자상거래법)</li>
              <li>접속 로그: 3개월 (통신비밀보호법)</li>
              <li>표시·광고에 관한 기록: 6개월 (전자상거래법)</li>
              <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)</li>
              <li>
                대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래법)
              </li>
              <li>
                소비자의 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)
              </li>
            </ul>
          </li>
        </ul>

        <p className="mb-1 font-semibold text-neutral-900">
          제4조 (개인정보의 제3자 제공)
        </p>
        <p className="mb-4">
          회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한
          범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등
          「개인정보 보호법」 제17조 및 제18조에 해당하는 경우에만 개인정보를
          제3자에게 제공합니다.
        </p>

        <p className="mb-1 font-semibold text-neutral-900">
          제5조 (개인정보처리의 위탁)
        </p>
        <p className="mb-4">
          회사는 원활한 서비스 제공을 위해 Supabase
          Inc.(데이터베이스·인증·스토리지 호스팅), Vercel Inc.(웹사이트 호스팅
          및 배포)에 개인정보 처리업무를 위탁하고 있습니다.
        </p>

        <p className="mb-1 font-semibold text-neutral-900">
          제6조 (정보주체의 권리·의무 및 행사방법)
        </p>
        <p className="mb-4">
          정보주체는 언제든지 개인정보 열람, 정정, 삭제, 처리정지 요구 등의
          권리를 행사할 수 있으며, 당사는 이에 대해 지체 없이 조치하겠습니다.
        </p>

        <p className="mb-1 font-semibold text-neutral-900">
          제7조 (개인정보의 파기)
        </p>
        <p className="mb-4">
          회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가
          불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다. 전자적
          파일은 영구 삭제, 종이 문서는 파쇄 또는 소각합니다.
        </p>

        <p className="mb-1 font-semibold text-neutral-900">
          제8조 (개인정보의 안전성 확보조치)
        </p>
        <p className="mb-4">
          관리적, 기술적, 물리적 조치를 통해 개인정보의 안전성을 확보하고
          있습니다.
        </p>

        <p className="mb-1 font-semibold text-neutral-900">
          제9조 (쿠키의 사용)
        </p>
        <p className="mb-4">
          회사는 이용자에게 맞춤서비스를 제공하기 위해 쿠키를 사용하며, 브라우저
          설정을 통해 쿠키 저장을 거부할 수 있습니다.
        </p>

        <p className="mb-1 font-semibold text-neutral-900">
          제10조 (개인정보 보호책임자)
        </p>
        <p className="mb-4">
          성명: 구종철 / 연락처: 031-944-2903 / 이메일: acewater@acewater.net
        </p>
      </div>

      {/* 기존 동의 체크박스 */}
      <div className="flex items-center justify-center">
        <label className="inline-flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            name="privacy_agreed"
            required
            className="h-4 w-4 cursor-pointer accent-blue-600"
          />
          <span className="text-neutral-700">
            <span className="font-semibold text-red-600">(필수)</span> 개인정보
            취급 처리 방침에 동의합니다.
          </span>
        </label>
      </div>
    </div>
  );
}
