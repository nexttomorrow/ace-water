'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Image } from '@tiptap/extension-image'
import { Link } from '@tiptap/extension-link'
import { TextAlign } from '@tiptap/extension-text-align'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import { useRef, useState } from 'react'
import { uploadPostImage } from '@/app/board/actions'
import { optimizeImageFile } from '@/components/OptimizedImageInput'

type Props = {
  name: string
  defaultValue?: string
  placeholder?: string
}

export default function RichTextEditor({ name, defaultValue = '', placeholder }: Props) {
  const [html, setHtml] = useState<string>(defaultValue)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: 'noopener noreferrer', class: 'text-blue-600 underline' },
      }),
      Image.configure({ inline: false, HTMLAttributes: { class: 'max-w-full rounded' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: true, HTMLAttributes: { class: 'rt-table' } }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: defaultValue,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'prose prose-neutral max-w-none min-h-[480px] px-4 py-3 focus:outline-none [&_table]:border [&_table]:border-collapse [&_th]:border [&_th]:border-neutral-300 [&_th]:bg-neutral-100 [&_th]:px-2 [&_th]:py-1 [&_td]:border [&_td]:border-neutral-300 [&_td]:px-2 [&_td]:py-1',
      },
    },
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  })

  if (!editor) return null

  const onPickImage = () => fileInputRef.current?.click()

  const onImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    // 업로드 전 클라이언트 측 자동 리사이즈 + WEBP 재인코딩 (화질 유지, 용량↓)
    const optimized = await optimizeImageFile(file, {
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 85,
      format: 'WEBP',
    })

    const fd = new FormData()
    fd.append('image', optimized)
    const result = await uploadPostImage(fd)
    if (result.error) {
      alert(result.error)
      return
    }
    editor.chain().focus().setImage({ src: result.url! }).run()
  }

  const onAddLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('링크 URL', previous ?? 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const onAddTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  return (
    <div className="overflow-hidden rounded border border-neutral-300 bg-white">
      <Toolbar
        editor={editor}
        onPickImage={onPickImage}
        onAddLink={onAddLink}
        onAddTable={onAddTable}
      />
      <div className="relative">
        {placeholder && editor.isEmpty && (
          <div className="pointer-events-none absolute left-4 top-3 text-neutral-400">
            {placeholder}
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
      <input type="hidden" name={name} value={html} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onImageSelected}
      />
    </div>
  )
}

function Toolbar({
  editor,
  onPickImage,
  onAddLink,
  onAddTable,
}: {
  editor: ReturnType<typeof useEditor>
  onPickImage: () => void
  onAddLink: () => void
  onAddTable: () => void
}) {
  if (!editor) return null

  const Btn = ({
    active,
    onClick,
    title,
    children,
    disabled,
  }: {
    active?: boolean
    onClick: () => void
    title: string
    children: React.ReactNode
    disabled?: boolean
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`h-8 min-w-8 rounded px-2 text-[0.875rem] font-medium transition ${
        active ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-100'
      } disabled:opacity-40`}
    >
      {children}
    </button>
  )

  const Sep = () => <span className="mx-1 h-5 w-px bg-neutral-200" />

  const inTable = editor.isActive('table')

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-neutral-200 bg-neutral-50 p-1">
      <Btn
        title="제목 1"
        active={editor.isActive('heading', { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        H1
      </Btn>
      <Btn
        title="제목 2"
        active={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </Btn>
      <Btn
        title="제목 3"
        active={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </Btn>
      <Sep />
      <Btn
        title="굵게"
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <span className="font-bold">B</span>
      </Btn>
      <Btn
        title="기울임"
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <span className="italic">I</span>
      </Btn>
      <Btn
        title="밑줄"
        active={editor.isActive('underline')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <span className="underline">U</span>
      </Btn>
      <Btn
        title="취소선"
        active={editor.isActive('strike')}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <span className="line-through">S</span>
      </Btn>
      <Btn
        title="인라인 코드"
        active={editor.isActive('code')}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        {'<>'}
      </Btn>
      <Sep />
      <Btn
        title="좌측 정렬"
        active={editor.isActive({ textAlign: 'left' })}
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
      >
        ≡←
      </Btn>
      <Btn
        title="가운데 정렬"
        active={editor.isActive({ textAlign: 'center' })}
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
      >
        ≡
      </Btn>
      <Btn
        title="우측 정렬"
        active={editor.isActive({ textAlign: 'right' })}
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
      >
        →≡
      </Btn>
      <Sep />
      <Btn
        title="순서 없는 목록"
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        •
      </Btn>
      <Btn
        title="순서 있는 목록"
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1.
      </Btn>
      <Btn
        title="인용"
        active={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        ❝
      </Btn>
      <Btn
        title="코드 블록"
        active={editor.isActive('codeBlock')}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        {'{ }'}
      </Btn>
      <Btn
        title="구분선"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        —
      </Btn>
      <Sep />
      <Btn title="링크" active={editor.isActive('link')} onClick={onAddLink}>
        🔗
      </Btn>
      <Btn title="이미지 업로드" onClick={onPickImage}>
        🖼
      </Btn>
      <Btn title="표 삽입" onClick={onAddTable}>
        ▦
      </Btn>
      {inTable && (
        <>
          <Sep />
          <Btn
            title="앞에 행 추가"
            onClick={() => editor.chain().focus().addRowBefore().run()}
          >
            ↑+
          </Btn>
          <Btn
            title="뒤에 행 추가"
            onClick={() => editor.chain().focus().addRowAfter().run()}
          >
            ↓+
          </Btn>
          <Btn
            title="앞에 열 추가"
            onClick={() => editor.chain().focus().addColumnBefore().run()}
          >
            ←+
          </Btn>
          <Btn
            title="뒤에 열 추가"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          >
            →+
          </Btn>
          <Btn title="행 삭제" onClick={() => editor.chain().focus().deleteRow().run()}>
            행✕
          </Btn>
          <Btn title="열 삭제" onClick={() => editor.chain().focus().deleteColumn().run()}>
            열✕
          </Btn>
          <Btn title="표 삭제" onClick={() => editor.chain().focus().deleteTable().run()}>
            표✕
          </Btn>
        </>
      )}
      <Sep />
      <Btn
        title="실행 취소"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        ↶
      </Btn>
      <Btn
        title="다시 실행"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        ↷
      </Btn>
    </div>
  )
}
