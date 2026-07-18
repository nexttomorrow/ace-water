'use client'

import { DynamicIcon, type IconName } from 'lucide-react/dynamic'
import { normalizeIconKey } from '@/lib/quickMenuIcons'

/**
 * 저장된 lucide 아이콘 이름을 렌더. 이름이 잘못돼도 같은 크기의 빈 자리로 폴백해
 * 레이아웃이 흔들리지 않게 합니다. (사이트 톤에 맞춰 stroke 1.6)
 */
export default function QuickMenuIcon({
  iconKey,
  className = 'h-5 w-5',
  strokeWidth = 1.6,
}: {
  iconKey: string
  className?: string
  strokeWidth?: number
}) {
  const name = normalizeIconKey(iconKey) as IconName
  return (
    <DynamicIcon
      name={name}
      className={className}
      strokeWidth={strokeWidth}
      fallback={() => <span className={`inline-block ${className}`} aria-hidden="true" />}
    />
  )
}
