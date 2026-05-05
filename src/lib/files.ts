export function formatBytes(bytes: number): string {
  if (!bytes || bytes < 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export function getFileExt(name: string): string {
  if (!name.includes('.')) return ''
  return name.split('.').pop()!.toLowerCase()
}

type FileColor = { bg: string; text: string; label: string }

export function getFileColor(name: string): FileColor {
  const ext = getFileExt(name)
  switch (ext) {
    case 'pdf':
      return { bg: 'bg-rose-50', text: 'text-rose-600', label: 'PDF' }
    case 'doc':
    case 'docx':
      return { bg: 'bg-blue-50', text: 'text-blue-600', label: 'DOC' }
    case 'xls':
    case 'xlsx':
    case 'csv':
      return { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'XLS' }
    case 'ppt':
    case 'pptx':
      return { bg: 'bg-orange-50', text: 'text-orange-600', label: 'PPT' }
    case 'hwp':
    case 'hwpx':
      return { bg: 'bg-sky-50', text: 'text-sky-600', label: 'HWP' }
    case 'zip':
    case 'rar':
    case '7z':
      return { bg: 'bg-neutral-100', text: 'text-neutral-700', label: 'ZIP' }
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
    case 'svg':
      return { bg: 'bg-purple-50', text: 'text-purple-600', label: 'IMG' }
    case 'mp4':
    case 'mov':
    case 'avi':
    case 'mkv':
      return { bg: 'bg-pink-50', text: 'text-pink-600', label: 'VID' }
    default:
      return { bg: 'bg-neutral-100', text: 'text-neutral-600', label: ext.toUpperCase() || 'FILE' }
  }
}
