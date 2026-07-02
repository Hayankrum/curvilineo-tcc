'use client'

import { useState } from 'react'
import { deletarPost } from './posts.actions'
import { useRouter } from 'next/navigation'

interface Props {
  id: number
}

export default function BotaoDeletar({ id }: Props) {
  const [aberto, setAberto] = useState(false)
  const router = useRouter()

  async function handleDeletar() {
    await deletarPost(id)
    router.push('/posts')
  }

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className="text-sm text-red-400 hover:text-red-300 transition-colors"
      >
        Deletar
      </button>

      {aberto && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-sm mx-4">
            <h2 className="text-lg font-semibold mb-2">Deletar post</h2>
            <p className="text-zinc-400 text-sm mb-6">
              Tem certeza que quer deletar este post? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setAberto(false)}
                className="px-4 py-2 text-sm rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeletar}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors"
              >
                Deletar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}