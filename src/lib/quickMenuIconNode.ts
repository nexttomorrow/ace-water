/**
 * 서버에서 lucide 아이콘의 노드(그리기 정보)를 해석해 인라인 SVG 로 그릴 수 있게 함.
 * → 공개 페이지(퀵메뉴)는 아이콘을 서버에서 그려 깜빡임/추가 JS 없이 즉시 표시됩니다.
 * (검색·미리보기 등 클라이언트 UI 는 <QuickMenuIcon>(DynamicIcon) 을 씁니다)
 */
import dynamicIconImports from 'lucide-react/dynamicIconImports'
import { normalizeIconKey, DEFAULT_QUICK_MENU_ICON } from './quickMenuIcons'

/** [태그, 속성] 목록 — React createElement 로 그대로 렌더 가능 */
export type IconNode = [string, Record<string, string | number>][]

type Importer = () => Promise<{ __iconNode: IconNode }>
const imports = dynamicIconImports as unknown as Record<string, Importer>

/** 아이콘 이름 → 노드. 없는 이름은 기본 아이콘으로 폴백. */
export async function resolveIconNode(iconKey: string): Promise<IconNode | null> {
  const name = normalizeIconKey(iconKey)
  const importer = imports[name] ?? imports[DEFAULT_QUICK_MENU_ICON]
  if (!importer) return null
  try {
    const mod = await importer()
    return mod.__iconNode
  } catch {
    return null
  }
}
