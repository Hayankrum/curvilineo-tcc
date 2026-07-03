'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { criarComentario } from './comentarios.actions'

export default function FormComentario({ postId }: { postId: number }) {
  const router = useRouter()
  const [texto, setTexto] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

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
    setIsSubmitting(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Escreva um comentário..."
        rows={2}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 resize-none"
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting || !texto.trim()}
        className="mt-2 bg-zinc-800 text-white text-sm rounded-lg px-4 py-1.5 hover:bg-zinc-700 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? 'Enviando...' : 'Comentar'}
      </button>
    </form>
  )
}
