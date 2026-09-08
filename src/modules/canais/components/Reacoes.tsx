'use client'

import { useState } from 'react'
import { toggleReacao } from '../actions/reacao.actions'

interface ReacaoData {
  tipo: string
  count: number
}

const REACOES_CONFIG: Record<string, { emoji: string; label: string }> = {
  curtir: { emoji: '\u{1F44D}', label: 'Curtir' },
  amor: { emoji: '\u{2764}\u{FE0F}', label: 'Amor' },
  surpresa: { emoji: '\u{1F62E}', label: 'Surpresa' },
  triste: { emoji: '\u{1F622}', label: 'Triste' },
}

interface ReacoesProps {
  publicacaoId: number
  reacoes: ReacaoData[]
  reacaoUsuario: string | null
}

export default function Reacoes({ publicacaoId, reacoes, reacaoUsuario }: ReacoesProps) {
  const [reacaoLocal, setReacaoLocal] = useState<string | null>(reacaoUsuario)
  const [contadores, setContadores] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {}
    for (const r of reacoes) {
      map[r.tipo] = r.count
    }
    return map
  })
  const [pending, setPending] = useState(false)

  async function handleReacao(tipo: string) {
    if (pending) return
    setPending(true)

    const anterior = reacaoLocal
    const contadoresAnteriores = { ...contadores }

    if (reacaoLocal === tipo) {
      setReacaoLocal(null)
      setContadores(prev => ({
        ...prev,
        [tipo]: Math.max(0, (prev[tipo] || 0) - 1),
      }))
    } else {
      if (reacaoLocal) {
        setContadores(prev => ({
          ...prev,
          [reacaoLocal]: Math.max(0, (prev[reacaoLocal] || 0) - 1),
        }))
      }
      setReacaoLocal(tipo)
      setContadores(prev => ({
        ...prev,
        [tipo]: (prev[tipo] || 0) + 1,
      }))
    }

    try {
      const result = await toggleReacao(publicacaoId, tipo)
      if (result?.error) {
        setReacaoLocal(anterior)
        setContadores(contadoresAnteriores)
      }
    } catch {
      setReacaoLocal(anterior)
      setContadores(contadoresAnteriores)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {Object.entries(REACOES_CONFIG).map(([tipo, config]) => {
        const count = contadores[tipo] || 0
        const isSelected = reacaoLocal === tipo
        return (
          <button
            key={tipo}
            onClick={() => handleReacao(tipo)}
            disabled={pending}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all"
            style={{
              backgroundColor: isSelected ? 'var(--btn-primary-bg)' : 'var(--bg-secondary)',
              color: isSelected ? 'var(--btn-primary-text)' : 'var(--text-secondary)',
              border: `1px solid ${isSelected ? 'var(--btn-primary-bg)' : 'var(--border-color)'}`,
              opacity: pending ? 0.6 : 1,
            }}
            title={config.label}
          >
            <span>{config.emoji}</span>
            {count > 0 && <span>{count}</span>}
          </button>
        )
      })}
    </div>
  )
}
