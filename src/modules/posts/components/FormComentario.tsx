'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { criarComentario } from '../comentarios.actions'
import dynamic from 'next/dynamic'

const RichTextEditor = dynamic(() => import('@/components/rich-text/RichTextEditor'), { ssr: false })

export default function FormComentario({ postId }: { postId: number }) {
  const router = useRouter()
  const [texto, setTexto] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [editorKey, setEditorKey] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!texto.trim()) return

    setIsSubmitting(true)
    setError('')

    const result = await criarComentario(postId, texto)

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }

    setTexto('')
    setEditorKey(prev => prev + 1)
    setIsSubmitting(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <RichTextEditor key={editorKey} content={texto} onChange={setTexto} placeholder="Escreva um comentário..." />
      {error && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting || !texto.trim()}
        className="mt-2 text-sm rounded-lg px-4 py-1.5 transition-colors disabled:opacity-50"
        style={{ backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--text-primary)' }}
      >
        {isSubmitting ? 'Enviando...' : 'Comentar'}
      </button>
    </form>
  )
}
