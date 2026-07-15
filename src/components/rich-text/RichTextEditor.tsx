'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import MenuBar from './MenuBar'
import { defaultExtensions } from './extensions'

interface Props {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

export default function RichTextEditor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions: defaultExtensions,
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[120px] p-3 focus:outline-none',
        style: 'color: var(--text-primary)',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)' }}
    >
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
