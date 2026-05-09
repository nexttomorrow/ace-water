export default function ContactInfoBox({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`w-full rounded-lg bg-neutral-100 px-5 py-3.5 text-center text-[13px] leading-[1.85] text-neutral-600 md:text-[14px] ${className}`.trim()}
    >
      기타 문의는{" "}
      <a
        href="tel:0319442903"
        className="font-semibold text-neutral-900 hover:underline"
      >
        031-944-2903
      </a>{" "}
      (평일 09–17시 / 점심 12–13시 제외) 또는{" "}
      <a
        href="mailto:acewater@acewater.net"
        className="font-semibold text-neutral-900 hover:underline"
      >
        acewater@acewater.net
      </a>{" "}
      로 가능합니다.
    </div>
  );
}
