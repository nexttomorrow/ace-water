import Link from 'next/link'

type Props = {
  title: string
  eyebrow?: string
  desc?: string
  moreHref?: string
  moreLabel?: string
}

export default function SectionHeader({
  title,
  eyebrow,
  desc,
  moreHref,
  moreLabel = '+ 더보기',
}: Props) {
  return (
    <div className="mb-12 flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-2 text-[12px] font-medium tracking-widest text-neutral-500 uppercase">
            {eyebrow}
          </p>
        )}
        <h2 className="text-[28px] font-bold tracking-tight md:text-[36px]">
          {title}
        </h2>
        {desc && <p className="mt-2 text-[14px] text-neutral-600">{desc}</p>}
      </div>
      {moreHref && (
        <Link
          href={moreHref}
          className="shrink-0 text-[14px] font-medium text-neutral-500 transition hover:text-black"
        >
          {moreLabel}
        </Link>
      )}
    </div>
  )
}