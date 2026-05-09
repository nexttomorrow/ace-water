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
          <p className="mb-2 text-[0.75rem] font-medium tracking-widest text-neutral-500 uppercase">
            {eyebrow}
          </p>
        )}
        <h2 className="text-[1.75rem] font-bold tracking-tight md:text-[2.25rem]">
          {title}
        </h2>
        {desc && <p className="mt-2 text-[0.875rem] text-neutral-600">{desc}</p>}
      </div>
      {moreHref && (
        <Link
          href={moreHref}
          className="shrink-0 text-[0.875rem] font-medium text-neutral-500 transition hover:text-black"
        >
          {moreLabel}
        </Link>
      )}
    </div>
  )
}