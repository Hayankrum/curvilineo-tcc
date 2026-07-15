'use client'

import { type Editor } from '@tiptap/react'

interface Props {
  editor: Editor | null
}

function MenuButton({
  onClick,
  isActive = false,
  disabled = false,
  children,
}: {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="p-1.5 rounded transition-colors text-sm"
      style={{
        backgroundColor: isActive ? 'var(--btn-primary-bg)' : 'transparent',
        color: isActive ? 'var(--btn-primary-text)' : 'var(--text-secondary)',
      }}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-6 mx-1" style={{ backgroundColor: 'var(--border-color)' }} />
}

export default function MenuBar({ editor }: Props) {
  if (!editor) return null

  const addImage = () => {
    const url = prompt('URL da imagem:')
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = prompt('URL do link:', previousUrl)
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div
      className="flex flex-wrap items-center gap-0.5 p-2 rounded-t-lg border-b"
      style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--input-border)' }}
    >
      <MenuButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
      >
        <strong>B</strong>
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
      >
        <em>I</em>
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
      >
        <span className="underline">U</span>
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
      >
        <span className="line-through">S</span>
      </MenuButton>

      <Divider />

      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
      >
        H2
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
      >
        H3
      </MenuButton>

      <Divider />

      <MenuButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
      >
        • Lista
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
      >
        1. Lista
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        isActive={editor.isActive('taskList')}
      >
        ☑ Tarefa
      </MenuButton>

      <Divider />

      <MenuButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
      >
        {'\u201C'} Citação
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive('codeBlock')}
      >
        {'</>'} Código
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        ─ Linha
      </MenuButton>

      <Divider />

      <MenuButton onClick={setLink} isActive={editor.isActive('link')}>
        🔗 Link
      </MenuButton>
      <MenuButton onClick={addImage}>
        🖼 Imagem
      </MenuButton>

      <Divider />

      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        isActive={editor.isActive({ textAlign: 'left' })}
      >
        ≡
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        isActive={editor.isActive({ textAlign: 'center' })}
      >
        ≡̄
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        isActive={editor.isActive({ textAlign: 'right' })}
      >
        ≡̄
      </MenuButton>
    </div>
  )
}
