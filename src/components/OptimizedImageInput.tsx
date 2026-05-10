'use client'

/**
 * 이미지 파일 인풋 — 클라이언트 단에서 자동으로 리사이징 + 재압축.
 *
 * 사용법: 기존 `<input type="file" accept="image/*" name="..." />` 자리에 그대로 교체.
 * - 이미지 파일이면 react-image-file-resizer 로 WEBP 재인코딩 + 리사이즈
 * - 이미지가 아니거나(PDF 등) 또는 결과가 더 크면 원본 유지
 * - 최적화된 결과를 input.files 에 다시 끼워넣어, 폼 제출 시 작은 파일이 서버로 감
 *
 * 화질을 거의 유지하면서 용량은 보통 60~85% 줄어듭니다 (특히 휴대폰 사진).
 */

import { useRef, useState } from 'react'
import Resizer from 'react-image-file-resizer'

export type OptimizedImageInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type'
> & {
  /** 결과 이미지 최대 폭 (기본 1920) */
  maxWidth?: number
  /** 결과 이미지 최대 높이 (기본 1920) */
  maxHeight?: number
  /** 압축 품질 0–100 (기본 85 — 화질 잘 살리는 선) */
  quality?: number
  /** 변환 포맷 (기본 WEBP — 가장 작음 + 알파 지원) */
  format?: 'WEBP' | 'JPEG' | 'PNG'
  /** 최적화 결과 정보를 보여주는 작은 안내문 노출 여부 (기본 true) */
  showStats?: boolean
}

export default function OptimizedImageInput({
  maxWidth = 1920,
  maxHeight = 1920,
  quality = 85,
  format = 'WEBP',
  showStats = true,
  onChange,
  className,
  disabled,
  ...rest
}: OptimizedImageInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [optimizing, setOptimizing] = useState(false)
  const [stats, setStats] = useState<string>('')

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget
    const incoming = Array.from(input.files ?? [])
    if (incoming.length === 0) {
      onChange?.(e)
      return
    }

    setOptimizing(true)
    setStats('')

    let totalOriginal = 0
    let totalFinal = 0
    const finalFiles: File[] = []

    for (const file of incoming) {
      // 비-이미지(PDF/문서/기타) 는 그대로 통과
      if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
        totalOriginal += file.size
        totalFinal += file.size
        finalFiles.push(file)
        continue
      }

      totalOriginal += file.size
      try {
        const optimized = await resizeImage(file, maxWidth, maxHeight, format, quality)
        // 재압축 결과가 원본보다 큰 경우(이미 최적화된 파일/작은 PNG 등) — 원본 유지
        const useOpt = optimized.size > 0 && optimized.size < file.size
        const chosen = useOpt ? optimized : file
        totalFinal += chosen.size
        finalFiles.push(chosen)
      } catch (err) {
        console.warn('[OptimizedImageInput] resize failed, fallback to original:', err)
        totalFinal += file.size
        finalFiles.push(file)
      }
    }

    // 네이티브 input.files 갱신 (DataTransfer 트릭) — 폼 제출 시 이게 실제로 전송됨
    try {
      const dt = new DataTransfer()
      for (const f of finalFiles) dt.items.add(f)
      input.files = dt.files
    } catch (err) {
      console.warn('[OptimizedImageInput] could not swap input.files:', err)
    }

    const reduction = totalOriginal > 0 ? 1 - totalFinal / totalOriginal : 0
    if (reduction > 0.01) {
      setStats(
        `최적화 ${formatBytes(totalOriginal)} → ${formatBytes(totalFinal)} (${Math.round(
          reduction * 100
        )}% ↓)`
      )
    } else {
      setStats('이미 충분히 작아 원본 그대로 사용')
    }

    setOptimizing(false)
    onChange?.(e)
  }

  // 사이트 전역 파일 업로더 스타일 (FileInput 과 동일).
  // className prop 은 추가 클래스 (위치/너비 조정 등) — 기본 스타일은 항상 유지.
  const baseCls =
    'block w-full cursor-pointer rounded border border-neutral-300 bg-white text-[0.875rem]' +
    ' file:mr-4 file:cursor-pointer file:border-0 file:border-r file:border-neutral-300' +
    ' file:bg-neutral-50 file:px-4 file:py-2.5 file:text-[0.875rem] file:font-semibold' +
    ' file:text-neutral-700 hover:file:bg-neutral-100' +
    ' focus:outline-none focus:ring-2 focus:ring-blue-100' +
    ' disabled:cursor-not-allowed disabled:opacity-50'

  return (
    <div className="flex flex-col gap-1">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        disabled={disabled || optimizing}
        className={`${baseCls} ${className ?? ''}`}
        {...rest}
      />
      {showStats && optimizing && (
        <p className="flex items-center gap-1.5 text-[0.75rem] text-blue-600">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            className="animate-spin"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          이미지 최적화 중…
        </p>
      )}
      {showStats && !optimizing && stats && (
        <p className="text-[0.75rem] text-emerald-600">{stats}</p>
      )}
    </div>
  )
}

function resizeImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  format: 'WEBP' | 'JPEG' | 'PNG',
  quality: number
): Promise<File> {
  return new Promise((resolve, reject) => {
    Resizer.imageFileResizer(
      file,
      maxWidth,
      maxHeight,
      format,
      quality,
      0,
      (uri) => {
        if (uri instanceof File) {
          // 확장자가 새 포맷과 다르면 교체
          const ext = format === 'JPEG' ? 'jpg' : format.toLowerCase()
          if (uri.name.toLowerCase().endsWith('.' + ext)) {
            resolve(uri)
            return
          }
          const newName = uri.name.replace(/\.[^.]+$/, '.' + ext) || `image.${ext}`
          resolve(
            new File([uri], newName, {
              type: uri.type || `image/${ext === 'jpg' ? 'jpeg' : ext}`,
              lastModified: Date.now(),
            })
          )
        } else if (uri instanceof Blob) {
          const ext = format === 'JPEG' ? 'jpg' : format.toLowerCase()
          const newName =
            file.name.replace(/\.[^.]+$/, '.' + ext) || `image.${ext}`
          resolve(
            new File([uri], newName, {
              type: uri.type || `image/${ext === 'jpg' ? 'jpeg' : ext}`,
              lastModified: Date.now(),
            })
          )
        } else {
          reject(new Error('Unexpected resizer output type'))
        }
      },
      'file'
    )
  })
}

/**
 * 단일 File 을 직접 최적화하고 싶을 때 (예: RichTextEditor의 인라인 이미지 업로드).
 */
export async function optimizeImageFile(
  file: File,
  options: {
    maxWidth?: number
    maxHeight?: number
    quality?: number
    format?: 'WEBP' | 'JPEG' | 'PNG'
  } = {}
): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return file
  }
  const maxWidth = options.maxWidth ?? 1920
  const maxHeight = options.maxHeight ?? 1920
  const quality = options.quality ?? 85
  const format = options.format ?? 'WEBP'
  try {
    const optimized = await resizeImage(file, maxWidth, maxHeight, format, quality)
    return optimized.size > 0 && optimized.size < file.size ? optimized : file
  } catch (err) {
    console.warn('[optimizeImageFile] failed, returning original:', err)
    return file
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}
