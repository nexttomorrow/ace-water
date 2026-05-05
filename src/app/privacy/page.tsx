export const metadata = {
  title: '개인정보처리방침 | ACEWATER',
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-[960px] px-6 py-16">
      <div className="mb-10 text-center">
        <p className="mb-2 text-[12px] font-medium tracking-widest text-neutral-500">PRIVACY POLICY</p>
        <h1 className="text-[28px] font-bold leading-tight md:text-[36px]">개인정보처리방침</h1>
        <div className="mx-auto mt-3 h-[2px] w-10 bg-neutral-900" />
        <p className="mt-4 text-[13px] text-neutral-500">시행일자: 2024년 1월 1일</p>
      </div>

      <div className="space-y-10 text-[14px] leading-7 text-neutral-700">
        <section className="rounded-lg bg-neutral-50 p-6 text-[13px] leading-7 text-neutral-600">
          <p>
            에이스엔지니어링(이하 &quot;회사&quot;)은 정보주체의 자유와 권리 보호를 위해 「개인정보 보호법」 및
            관계 법령이 정한 바를 준수하여, 적법하게 개인정보를 처리하고 안전하게 관리하고 있습니다.
            이에 「개인정보 보호법」 제30조에 따라 정보주체에게 개인정보 처리에 관한 절차 및 기준을 안내하고,
            이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보처리방침을
            수립·공개합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[16px] font-bold text-neutral-900">제1조 (개인정보의 처리 목적)</h2>
          <p className="mb-3">
            회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리한 개인정보는 다음의 목적 이외의 용도로는
            이용되지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
          </p>
          <ul className="list-disc space-y-2 pl-5 text-neutral-600">
            <li><span className="font-semibold text-neutral-800">홈페이지 회원가입 및 관리:</span> 회원 가입의사 확인, 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지 등</li>
            <li><span className="font-semibold text-neutral-800">재화 또는 서비스 제공:</span> 견적·도면 문의 응답, 서비스 제공, 계약서 발송, 청구서 발송, A/S 처리 등</li>
            <li><span className="font-semibold text-neutral-800">고충처리:</span> 민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락·통지, 처리결과 통보</li>
            <li><span className="font-semibold text-neutral-800">마케팅 및 광고에의 활용:</span> 신규 서비스 개발 및 맞춤 서비스 제공, 이벤트 정보 및 참여기회 제공 (별도 동의 시)</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-[16px] font-bold text-neutral-900">제2조 (수집하는 개인정보의 항목)</h2>
          <ol className="list-decimal space-y-3 pl-5">
            <li>
              <span className="font-semibold text-neutral-900">필수항목</span>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-neutral-600">
                <li>회원가입 시: 이메일 주소, 비밀번호, 닉네임</li>
                <li>견적·도면 문의 시: 성명, 연락처, 회사명(선택), 이메일, 문의내용</li>
              </ul>
            </li>
            <li>
              <span className="font-semibold text-neutral-900">자동 수집 항목</span>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-neutral-600">
                <li>접속 IP 정보, 쿠키, 방문 일시, 서비스 이용 기록, 기기 정보(OS, 브라우저 종류 등)</li>
              </ul>
            </li>
          </ol>
        </section>

        <section>
          <h2 className="mb-3 text-[16px] font-bold text-neutral-900">제3조 (개인정보의 처리 및 보유기간)</h2>
          <ol className="list-decimal space-y-2 pl-5">
            <li>회사는 법령에 따른 개인정보 보유·이용 기간 또는 정보주체로부터 개인정보를 수집 시에 동의 받은 개인정보 보유·이용 기간 내에서 개인정보를 처리·보유합니다.</li>
            <li>각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.
              <ul className="mt-2 list-disc space-y-1 pl-5 text-neutral-600">
                <li>회원가입 정보: 회원 탈퇴 시까지 (단, 관계법령 위반에 따른 수사·조사 등이 진행 중인 경우 해당 수사·조사 종료 시까지)</li>
                <li>문의 내역: 처리 완료 후 3년 보관 (전자상거래법)</li>
                <li>접속 로그: 3개월 (통신비밀보호법)</li>
                <li>표시·광고에 관한 기록: 6개월 (전자상거래법)</li>
                <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)</li>
                <li>대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래법)</li>
                <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)</li>
              </ul>
            </li>
          </ol>
        </section>

        <section>
          <h2 className="mb-3 text-[16px] font-bold text-neutral-900">제4조 (개인정보의 제3자 제공)</h2>
          <p>
            회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며,
            정보주체의 동의, 법률의 특별한 규정 등 「개인정보 보호법」 제17조 및 제18조에 해당하는 경우에만
            개인정보를 제3자에게 제공합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[16px] font-bold text-neutral-900">제5조 (개인정보처리의 위탁)</h2>
          <p className="mb-3">
            회사는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="bg-neutral-100 text-left">
                  <th className="border border-neutral-200 px-3 py-2 font-semibold">수탁업체</th>
                  <th className="border border-neutral-200 px-3 py-2 font-semibold">위탁업무 내용</th>
                </tr>
              </thead>
              <tbody className="text-neutral-600">
                <tr>
                  <td className="border border-neutral-200 px-3 py-2">Supabase Inc.</td>
                  <td className="border border-neutral-200 px-3 py-2">데이터베이스·인증·스토리지 호스팅</td>
                </tr>
                <tr>
                  <td className="border border-neutral-200 px-3 py-2">Vercel Inc.</td>
                  <td className="border border-neutral-200 px-3 py-2">웹사이트 호스팅 및 배포</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-[16px] font-bold text-neutral-900">제6조 (정보주체의 권리·의무 및 행사방법)</h2>
          <ol className="list-decimal space-y-2 pl-5">
            <li>정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.
              <ul className="mt-2 list-disc space-y-1 pl-5 text-neutral-600">
                <li>개인정보 열람 요구</li>
                <li>오류 등이 있을 경우 정정 요구</li>
                <li>삭제 요구</li>
                <li>처리정지 요구</li>
              </ul>
            </li>
            <li>제1항에 따른 권리 행사는 회사에 대해 「개인정보 보호법」 시행령 제41조 제1항에 따라 서면, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 회사는 이에 대해 지체 없이 조치하겠습니다.</li>
            <li>정보주체가 개인정보의 오류 등에 대한 정정 또는 삭제를 요구한 경우에는 회사는 정정 또는 삭제를 완료할 때까지 당해 개인정보를 이용하거나 제공하지 않습니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="mb-3 text-[16px] font-bold text-neutral-900">제7조 (개인정보의 파기)</h2>
          <ol className="list-decimal space-y-2 pl-5">
            <li>회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.</li>
            <li>개인정보 파기의 절차 및 방법은 다음과 같습니다.
              <ul className="mt-2 list-disc space-y-1 pl-5 text-neutral-600">
                <li>전자적 파일 형태: 복원이 불가능한 방법으로 영구 삭제</li>
                <li>종이 문서: 분쇄기로 분쇄하거나 소각</li>
              </ul>
            </li>
          </ol>
        </section>

        <section>
          <h2 className="mb-3 text-[16px] font-bold text-neutral-900">제8조 (개인정보의 안전성 확보조치)</h2>
          <p className="mb-3">회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
          <ul className="list-disc space-y-1 pl-5 text-neutral-600">
            <li>관리적 조치: 내부관리계획 수립·시행, 정기적 직원 교육</li>
            <li>기술적 조치: 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램 설치</li>
            <li>물리적 조치: 전산실, 자료보관실 등의 접근통제</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-[16px] font-bold text-neutral-900">제9조 (쿠키의 사용)</h2>
          <ol className="list-decimal space-y-2 pl-5">
            <li>회사는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 이용정보를 저장하고 수시로 불러오는 &apos;쿠키(cookie)&apos;를 사용합니다.</li>
            <li>이용자는 웹브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 일부 서비스 이용에 어려움이 있을 수 있습니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="mb-3 text-[16px] font-bold text-neutral-900">제10조 (개인정보 보호책임자)</h2>
          <p className="mb-3">
            회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및
            피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
          </p>
          <div className="rounded-lg bg-neutral-50 p-5 text-[13px] leading-7">
            <p><span className="font-semibold text-neutral-900">개인정보 보호책임자</span></p>
            <p>성명: 구종철</p>
            <p>직책: 대표</p>
            <p>연락처: 031-944-2903</p>
            <p>이메일: acewater@acewater.net</p>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-[16px] font-bold text-neutral-900">제11조 (개인정보처리방침의 변경)</h2>
          <p>
            본 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는
            경우에는 변경사항의 시행 7일 전부터 사이트 공지사항을 통해 고지할 것입니다.
          </p>
        </section>

        <section className="border-t border-neutral-200 pt-6 text-[13px] text-neutral-500">
          <p>부칙</p>
          <p className="mt-2">본 방침은 2024년 1월 1일부터 시행합니다.</p>
        </section>
      </div>
    </div>
  )
}
