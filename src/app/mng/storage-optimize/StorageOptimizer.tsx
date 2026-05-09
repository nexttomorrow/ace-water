'use client'

import { useEffect, useMemo, useState } from 'react'
import Resizer from 'react-image-file-resizer'
import {
  listStorageImages,
  replaceStorageObject,
  type StorageImageEntry,
} from './actions'

type RowState = StorageImageEntry & {
  status: 'pending' | 'running' | 'optimized' | 'skipped' | 'failed'
  newSize?: number
  message?: string
}

type BucketProfile = {
  maxWidth: number
  maxHeight: number
  quality: number
  format: 'WEBP' | 'JPEG' | 'PNG'
}

// 버킷별 권장 사이즈 — 신규 업로드 OptimizedImageInput 의 설정과 거의 동일하게 맞춤
const PROFILE: Record<string, BucketProfile> = {
  hero: { maxWidth: 2400, maxHeight: 1400, quality: 85, format: 'WEBP' },
  'category-banners': { maxWidth: 2400, maxHeight: 1000, quality: 85, format: 'WEBP' },
  categories: { maxWidth: 1024, maxHeight: 1024, quality: 85, format: 'WEBP' },
  products: { maxWidth: 1920, maxHeight: 1920, quality: 85, format: 'WEBP' },
  gallery: { maxWidth: 1920, maxHeight: 1920, quality: 85, format: 'WEBP' },
  posts: { maxWidth: 1600, maxHeight: 1600, quality: 85, format: 'WEBP' },
}

export default function StorageOptimizer() {
  const [rows, setRows] = useState<RowState[] | null>(null)
  const [running, setRunning] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    listStorageImages()
      .then((items) =>
        setRows(items.map((it) => ({ ...it, status: 'pending' as const })))
      )
      .catch((e: Error) => setLoadError(e.message))
  }, [])

  const totals = useMemo(() => {
    const list = rows ?? []
    const original = list.reduce((s, r) => s + r.size, 0)
    const final = list.reduce((s, r) => s + (r.newSize ?? r.size), 0)
    const done = list.filter(
      (r) => r.status === 'optimized' || r.status === 'skipped' || r.status === 'failed'
    ).length
    return { original, final, done, total: list.length }
  }, [rows])

  const optimizeAll = async () => {
    if (!rows || running) return
    setRunning(true)
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i]
      if (r.status === 'optimized' || r.status === 'skipped') continue
      // mark running
      setRows((prev) =>
        prev ? prev.map((x, idx) => (idx === i ? { ...x, status: 'running' } : x)) : prev
      )
      try {
        const result = await processOne(r)
        setRows((prev) =>
          prev
            ? prev.map((x, idx) =>
                idx === i
                  ? {
                      ...x,
                      status: result.ok ? 'optimized' : 'skipped',
                      newSize: result.newSize ?? x.size,
                      message: result.message,
                    }
                  : x
              )
            : prev
        )
      } catch (e) {
        setRows((prev) =>
          prev
            ? prev.map((x, idx) =>
                idx === i
                  ? {
                      ...x,
                      status: 'failed',
                      message: e instanceof Error ? e.message : '실패',
                    }
                  : x
              )
            : prev
        )
      }
    }
    setRunning(false)
  }

  if (loadError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-[0.875rem] text-red-700">
        목록을 불러오지 못했어요: {loadError}
      </div>
    )
  }

  if (!rows) {
    return (
      <p className="text-[0.875rem] text-neutral-500">목록 불러오는 중...</p>
    )
  }

  return (
    <div className="space-y-6">
      {/* 요약 + 액션 */}
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl border border-neutral-200 bg-white px-5 py-4">
        <div className="text-[0.875rem] text-neutral-700">
          <p>
            총{' '}
            <span className="font-bold text-neutral-900">{rows.length}</span>개 이미지 ·{' '}
            <span className="font-bold text-neutral-900">{formatBytes(totals.original)}</span>{' '}
            원본
          </p>
          {totals.done > 0 && (
            <p className="mt-1 text-emerald-700">
              처리 완료{' '}
              <span className="font-bold">
                {totals.done}/{totals.total}
              </span>{' '}
              · 현재{' '}
              <span className="font-bold">{formatBytes(totals.final)}</span>
              {totals.original > 0 && (
                <>
                  {' '}({Math.round((1 - totals.final / totals.original) * 100)}% ↓)
                </>
              )}
            </p>
          )}
        </div>
        <button
          type="button"
          disabled={running || rows.length === 0}
          onClick={optimizeAll}
          className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-2.5 text-[0.875rem] font-bold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          {running ? '처리 중…' : '전체 최적화 시작'}
        </button>
      </div>

      {/* 행 리스트 */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <div className="hidden grid-cols-12 gap-3 border-b border-neutral-200 bg-neutral-50 px-5 py-3 text-[0.6875rem] font-semibold uppercase tracking-wider text-neutral-500 md:grid">
          <div className="col-span-1">버킷</div>
          <div className="col-span-5">파일</div>
          <div className="col-span-2 text-right">원본</div>
          <div className="col-span-2 text-right">최적화 후</div>
          <div className="col-span-2 text-right">상태</div>
        </div>
        <ul className="divide-y divide-neutral-100">
          {rows.map((r) => (
            <li
              key={`${r.bucket}/${r.path}`}
              className="grid grid-cols-12 items-center gap-3 px-5 py-3 text-[0.8125rem]"
            >
              <div className="col-span-12 md:col-span-1">
                <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 font-mono text-[0.6875rem] text-neutral-700">
                  {r.bucket}
                </span>
              </div>
              <div className="col-span-12 min-w-0 md:col-span-5">
                <a
                  href={r.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate font-mono text-[0.75rem] text-neutral-700 hover:text-blue-600 hover:underline"
                  title={r.path}
                >
                  {r.path}
                </a>
                {r.message && (
                  <p className="mt-0.5 truncate text-[0.6875rem] text-neutral-500">
                    {r.message}
                  </p>
                )}
              </div>
              <div className="col-span-6 text-right tabular-nums text-neutral-600 md:col-span-2">
                {formatBytes(r.size)}
              </div>
              <div className="col-span-6 text-right tabular-nums md:col-span-2">
                {r.newSize != null ? (
                  <>
                    <span className="font-semibold text-emerald-700">
                      {formatBytes(r.newSize)}
                    </span>
                    {r.size > 0 && r.newSize < r.size && (
                      <span className="ml-1 text-[0.6875rem] text-emerald-600">
                        ({Math.round((1 - r.newSize / r.size) * 100)}% ↓)
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-neutral-300">—</span>
                )}
              </div>
              <div className="col-span-12 md:col-span-2 md:text-right">
                <StatusBadge status={r.status} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: RowState['status'] }) {
  const map = {
    pending: { cls: 'bg-neutral-100 text-neutral-600', label: '대기' },
    running: { cls: 'bg-blue-50 text-blue-700', label: '처리 중…' },
    optimized: { cls: 'bg-emerald-50 text-emerald-700', label: '최적화 완료' },
    skipped: { cls: 'bg-amber-50 text-amber-700', label: '건너뜀' },
    failed: { cls: 'bg-red-50 text-red-700', label: '실패' },
  }
  const v = map[status]
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.6875rem] font-medium ${v.cls}`}
    >
      {v.label}
    </span>
  )
}

async function processOne(
  entry: StorageImageEntry
): Promise<{ ok: boolean; newSize?: number; message?: string }> {
  const profile = PROFILE[entry.bucket] ?? {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 85,
    format: 'WEBP' as const,
  }

  // 1) 원본 파일 fetch
  const res = await fetch(entry.publicUrl, { cache: 'no-store' })
  if (!res.ok) throw new Error(`다운로드 실패 (${res.status})`)
  const blob = await res.blob()
  const file = new File([blob], entry.path, {
    type: blob.type || 'application/octet-stream',
  })

  // 2) 캔버스 리사이즈 + 재압축
  const optimized = await new Promise<File>((resolve, reject) => {
    Resizer.imageFileResizer(
      file,
      profile.maxWidth,
      profile.maxHeight,
      profile.format,
      profile.quality,
      0,
      (uri) => {
        if (uri instanceof File) resolve(uri)
        else if (uri instanceof Blob)
          resolve(
            new File([uri], file.name, { type: uri.type, lastModified: Date.now() })
          )
        else reject(new Error('Unexpected resizer output'))
      },
      'file'
    )
  })

  // 3) 결과가 더 크면 skip
  if (optimized.size >= file.size) {
    return { ok: false, message: '이미 작아 건너뜀' }
  }

  // 4) ArrayBuffer 로 server action 에 보냄 (Server Actions 는 Blob 직접 전달 가능하지만, 안전하게 ArrayBuffer 로)
  const bytes = await optimized.arrayBuffer()
  const contentType =
    profile.format === 'WEBP'
      ? 'image/webp'
      : profile.format === 'JPEG'
        ? 'image/jpeg'
        : 'image/png'

  const result = await replaceStorageObject({
    bucket: entry.bucket,
    path: entry.path,
    bytes,
    contentType,
    originalSize: file.size,
  })

  if (!result.ok) {
    return { ok: false, message: result.reason }
  }
  return {
    ok: true,
    newSize: result.newSize,
    message: `${formatBytes(result.saved)} 절약`,
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}
