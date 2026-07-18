import { createElement } from 'react'
import type { IconNode } from '@/lib/quickMenuIconNode'

/**
 * 서버에서 해석한 lucide 아이콘 노드를 인라인 SVG 로 렌더 (서버/클라이언트 공용).
 * `import type` 로만 IconNode 를 가져오므로 lucide 런타임/맵이 번들에 포함되지 않습니다.
 */
export default function QuickMenuNodeIcon({
  node,
  className = 'h-5 w-5',
}: {
  node: IconNode | null
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {(node ?? []).map(([tag, attrs], i) => createElement(tag, { key: i, ...attrs }))}
    </svg>
  )
}
