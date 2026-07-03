'use client'

import { useRouter } from 'next/navigation'
import { deletarComentario } from './comentarios.actions'
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
    return <p className="text-zinc-500 text-sm mt-4">Nenhum comentário ainda.</p>
  }

  return (
    <div className="mt-4 space-y-3">
      <h3 className="text-sm font-medium text-zinc-400">
        {comentarios.length} comentário{comentarios.length !== 1 ? 's' : ''}
      </h3>
      {comentarios.map((comentario) => (
        <div key={comentario.id} className="bg-zinc-900 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs">
                {comentario.autor.nome.charAt(0).toUpperCase()}
              </span>
              <span className="text-sm text-zinc-300">{comentario.autor.nome}</span>
              <span className="text-xs text-zinc-600">
                {new Date(comentario.criadoEm).toLocaleDateString('pt-BR')}
              </span>
            </div>
            {usuarioLogadoId === comentario.autor.id && (
              <button
                onClick={() => handleDeletar(comentario.id)}
                disabled={deletandoId === comentario.id}
                className="text-xs text-zinc-600 hover:text-red-400 transition-colors"
              >
                {deletandoId === comentario.id ? '...' : 'Excluir'}
              </button>
            )}
          </div>
          <p className="text-sm text-zinc-300 mt-2">{comentario.texto}</p>
        </div>
      ))}
    </div>
  )
}
