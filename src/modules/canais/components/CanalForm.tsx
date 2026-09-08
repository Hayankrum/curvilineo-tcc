'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { criarCanal, editarCanal } from '../actions/canal.actions'

interface CanalFormProps {
  canal?: {
    id: number
    nome: string
    descricao?: string | null
  }
  modo: 'criar' | 'editar'
}

export default function CanalForm({ canal, modo }: CanalFormProps) {
  const router = useRouter()
  const [nome, setNome] = useState(canal?.nome || '')
  const [descricao, setDescricao] = useState(canal?.descricao || '')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)

    try {
      if (modo === 'criar') {
        const result = await criarCanal(nome, descricao)
        if (result?.error) {
          setError(result.error)
        }
      } else if (modo === 'editar' && canal) {
        const result = await editarCanal(canal.id, nome, descricao)
        if (result?.error) {
          setError(result.error)
        } else {
          router.refresh()
        }
      }
    } catch {
      setError('Erro ao salvar canal')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="card" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
      <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        {modo === 'criar' ? 'Novo canal' : 'Editar canal'}
      </h2>

      {error && (
        <div className="error-message mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
            Nome *
          </label>
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            className="input w-full"
            placeholder="Nome do canal"
            required
            minLength={3}
            maxLength={100}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
            Descrição
          </label>
          <textarea
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            className="input w-full"
            rows={3}
            placeholder="Descrição do canal (opcional)"
            maxLength={500}
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="btn-primary w-full rounded-lg py-2 text-xs font-medium disabled:opacity-40"
        >
          {pending ? 'Salvando...' : modo === 'criar' ? 'Criar canal' : 'Salvar alterações'}
        </button>
      </form>
    </div>
  )
}
