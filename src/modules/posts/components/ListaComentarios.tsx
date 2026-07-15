'use client'

import { useRouter } from 'next/navigation'
import { deletarComentario } from '../comentarios.actions'
import { useState } from 'react'

interface Comentario {
  id: number
  texto: string
  criadoEm: Date
  autor: {
    id: number
    nome: string
  }
}

interface ListaComentariosProps {
  comentarios: Comentario[]
  usuarioLogadoId?: number
}

export default function ListaComentarios({ comentarios, usuarioLogadoId }: ListaComentariosProps) {
  const router = useRouter()
  const [deletandoId, setDeletandoId] = useState<number | null>(null)

  const handleDeletar = async (id: number) => {
    setDeletandoId(id)
    await deletarComentario(id)
    setDeletandoId(null)
    router.refresh()
  }

  if (comentarios.length === 0) {
    return <p className="text-sm mt-4" style={{ color: 'var(--text-tertiary)' }}>Nenhum comentário ainda.</p>
  }

  return (
    <div className="mt-4 space-y-3">
      <h3 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
        {comentarios.length} comentário{comentarios.length !== 1 ? 's' : ''}
      </h3>
      {comentarios.map((comentario) => (
        <div key={comentario.id} className="rounded-lg p-3" style={{ backgroundColor: 'var(--card-bg)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                {comentario.autor.nome.charAt(0).toUpperCase()}
              </span>
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{comentario.autor.nome}</span>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {new Date(comentario.criadoEm).toLocaleDateString('pt-BR')}
              </span>
            </div>
            {usuarioLogadoId === comentario.autor.id && (
              <button
                onClick={() => handleDeletar(comentario.id)}
                disabled={deletandoId === comentario.id}
                className="text-xs transition-colors hover:underline"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {deletandoId === comentario.id ? '...' : 'Excluir'}
              </button>
            )}
          </div>
          <div
            className="prose prose-sm max-w-none mt-2 text-sm"
            style={{ color: 'var(--text-primary)' }}
            dangerouslySetInnerHTML={{ __html: comentario.texto }}
          />
        </div>
      ))}
    </div>
  )
}
