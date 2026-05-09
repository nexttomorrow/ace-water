'use server'

/**
 * 스토리지 일괄 최적화 도구의 서버 액션.
 * - listStorageImages: 각 버킷의 이미지 파일 목록 조회 (관리자 전용)
 * - replaceStorageObject: 한 파일을 새 (최적화된) 파일로 교체. 클라이언트가 리사이징한 결과 Blob 을 받아 같은 path 에 upsert
 *
 * 클라이언트가 실제 리사이징을 처리(브라우저 canvas)하므로 서버는 sharp 같은 무거운 의존성 없이 동작.
 */

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const IMAGE_BUCKETS = [
  'gallery',
  'products',
  'hero',
  'categories',
  'category-banners',
  'posts',
] as const

export type ImageBucket = (typeof IMAGE_BUCKETS)[number]

export type StorageImageEntry = {
  bucket: ImageBucket
  path: string
  size: number
  publicUrl: string
  contentType: string | null
  updatedAt: string | null
}

async function ensureAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다.')
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') throw new Error('관리자 권한이 필요합니다.')
  return supabase
}

function publicUrl(bucket: string, path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
}

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tif', 'tiff', 'heic', 'heif']

function isImagePath(path: string): boolean {
  const ext = path.split('.').pop()?.toLowerCase() ?? ''
  return IMAGE_EXTS.includes(ext)
}

/**
 * 한 버킷의 이미지 파일을 모두 순회 (페이지네이션) 후 메타 + 공개 URL 로 반환.
 * Supabase storage list 는 한 번에 100개가 기본 → 모두 가져올 때까지 반복.
 */
async function listAllImagesInBucket(
  supabase: Awaited<ReturnType<typeof createClient>>,
  bucket: ImageBucket
): Promise<StorageImageEntry[]> {
  const out: StorageImageEntry[] = []
  const PAGE = 100
  let offset = 0
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data, error } = await supabase.storage.from(bucket).list('', {
      limit: PAGE,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    })
    if (error) throw new Error(`[${bucket}] ${error.message}`)
    if (!data || data.length === 0) break
    for (const f of data) {
      if (!f.name || f.name.startsWith('.')) continue
      const meta = (f.metadata ?? {}) as { size?: number; mimetype?: string }
      if (!isImagePath(f.name)) continue
      out.push({
        bucket,
        path: f.name,
        size: meta.size ?? 0,
        contentType: meta.mimetype ?? null,
        updatedAt: f.updated_at ?? null,
        publicUrl: publicUrl(bucket, f.name),
      })
    }
    if (data.length < PAGE) break
    offset += PAGE
  }
  return out
}

export async function listStorageImages(): Promise<StorageImageEntry[]> {
  const supabase = await ensureAdmin()
  const all: StorageImageEntry[] = []
  for (const b of IMAGE_BUCKETS) {
    try {
      const entries = await listAllImagesInBucket(supabase, b)
      all.push(...entries)
    } catch (e) {
      console.warn(`[storage-optimize] skip bucket "${b}":`, e)
    }
  }
  // 큰 파일 먼저 (효과 큰 순서)
  return all.sort((a, b) => b.size - a.size)
}

/**
 * 한 객체를 새 컨텐츠로 교체.
 * - bucket / path 는 기존과 동일 (URL 보존, 참조하는 row 들 무수정)
 * - WEBP 로 재인코딩된 경우라도 path/extension 은 그대로 두고 contentType 만 image/webp 로 메타 수정
 * - 파일 크기가 줄어들었을 때만 교체 (안전장치)
 */
export async function replaceStorageObject(args: {
  bucket: ImageBucket
  path: string
  /** 클라이언트가 보낸 최적화된 바이트 (Uint8Array 직렬화 안 됨 → ArrayBuffer 로 받음) */
  bytes: ArrayBuffer
  contentType: string
  originalSize: number
}): Promise<{ ok: true; newSize: number; saved: number } | { ok: false; reason: string }> {
  const supabase = await ensureAdmin()
  const { bucket, path, bytes, contentType, originalSize } = args
  const newSize = bytes.byteLength

  if (newSize <= 0) return { ok: false, reason: '빈 바이트' }
  if (newSize >= originalSize) {
    return { ok: false, reason: '최적화 결과가 더 큼 — 건너뜀' }
  }

  if (!IMAGE_BUCKETS.includes(bucket)) {
    return { ok: false, reason: '허용되지 않는 버킷' }
  }

  const blob = new Blob([bytes], { type: contentType })
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, blob, {
      contentType,
      upsert: true,
      cacheControl: '3600',
    })
  if (error) return { ok: false, reason: error.message }

  // 이 파일을 참조하는 페이지들의 캐시 갱신 (안전하게 layout 단위)
  revalidatePath('/', 'layout')

  return { ok: true, newSize, saved: originalSize - newSize }
}
