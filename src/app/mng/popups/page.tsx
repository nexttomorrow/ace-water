import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { deletePopup, togglePopupActive } from '../actions'
import {
  POPUP_TYPE_LABEL,
  POPUP_DEVICE_LABEL,
  type Popup,
} from '@/lib/types'

export const revalidate = 0

function fmt(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function AdminPopupsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const sp = await searchParams
  const supabase = await createClient()
  const { data } = await supabase
    .from('popups')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true })

  const popups = (data ?? []) as Popup[]
  // 요청마다 렌더되는 동적 서버 컴포넌트 — 상태 뱃지는 요청 시각 기준으로 계산
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now()

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-12">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">팝업 관리</h1>
        <Link
          href="/mng/popups/new"
          className="rounded bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          + 팝업 추가
        </Link>
      </div>
      <p className="mb-6 text-[0.875rem] text-neutral-500">
        사이트 팝업(레이어/퀵메뉴/일반/모바일)을 관리해요. 노출 순서가 작을수록 먼저 뜨고,
        화면당 동시 노출은 최대 3개입니다.
      </p>

      {sp.error && (
        <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</p>
      )}

      {popups.length === 0 ? (
        <p className="rounded border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          등록된 팝업이 없어요. 첫 팝업을 추가해보세요.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-[0.8125rem] text-neutral-500">
              <tr>
                <th className="px-3 py-2.5 font-medium">순서</th>
                <th className="px-3 py-2.5 font-medium">제목</th>
                <th className="px-3 py-2.5 font-medium">유형</th>
                <th className="px-3 py-2.5 font-medium">기기</th>
                <th className="px-3 py-2.5 font-medium">노출 기간</th>
                <th className="px-3 py-2.5 font-medium">상태</th>
                <th className="px-3 py-2.5 text-right font-medium">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {popups.map((p) => {
                const start = Date.parse(p.starts_at)
                const end = Date.parse(p.ends_at)
                const live = p.is_active && now >= start && now <= end
                const expired = now > end
                const handleToggle = togglePopupActive.bind(null, p.id, p.is_active)
                const handleDelete = deletePopup.bind(null, p.id)
                return (
                  <tr key={p.id} className="align-middle">
                    <td className="px-3 py-2.5 text-neutral-400">{p.sort_order}</td>
                    <td className="px-3 py-2.5 font-medium text-neutral-900">{p.title}</td>
                    <td className="px-3 py-2.5 text-neutral-600">{POPUP_TYPE_LABEL[p.popup_type]}</td>
                    <td className="px-3 py-2.5 text-neutral-600">{POPUP_DEVICE_LABEL[p.device]}</td>
                    <td className="px-3 py-2.5 text-[0.8125rem] text-neutral-500">
                      {fmt(p.starts_at)} ~ {fmt(p.ends_at)}
                    </td>
                    <td className="px-3 py-2.5">
                      {live ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[0.75rem] font-medium text-emerald-700">
                          노출중
                        </span>
                      ) : !p.is_active ? (
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[0.75rem] font-medium text-neutral-500">
                          중지
                        </span>
                      ) : expired ? (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[0.75rem] font-medium text-amber-700">
                          기간만료
                        </span>
                      ) : (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[0.75rem] font-medium text-blue-700">
                          예약
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex justify-end gap-1.5">
                        <form action={handleToggle}>
                          <button
                            type="submit"
                            className="rounded border border-neutral-300 px-2.5 py-1.5 text-xs hover:bg-neutral-100"
                          >
                            {p.is_active ? '중지' : '사용'}
                          </button>
                        </form>
                        <Link
                          href={`/mng/popups/${p.id}/edit`}
                          className="rounded border border-neutral-300 px-2.5 py-1.5 text-xs hover:bg-neutral-100"
                        >
                          수정
                        </Link>
                        <form action={handleDelete}>
                          <button
                            type="submit"
                            className="rounded border border-red-300 px-2.5 py-1.5 text-xs text-red-700 hover:bg-red-50"
                          >
                            삭제
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
