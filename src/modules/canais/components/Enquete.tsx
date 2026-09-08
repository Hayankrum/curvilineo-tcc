'use client'

import { useState } from 'react'
import { votarEnquete, obterResultadosEnquete } from '../actions/enquete.actions'

interface OpcaoEnquete {
  id: number
  texto: string
  ordem: number
  votos?: { id: number }[]
  _count?: { votos: number }
}

interface EnqueteProps {
  enqueteId: number
  permiteMultiplaEscolha: boolean
  opcoes: OpcaoEnquete[]
  publicacaoId: number
}

export default function Enquete({ enqueteId, permiteMultiplaEscolha, opcoes }: EnqueteProps) {
  const [selectedOpcoes, setSelectedOpcoes] = useState<number[]>([])
  const [votou, setVotou] = useState(false)
  const [resultados, setResultados] = useState<{
    opcoes: { id: number; texto: string; votos: number; percentual: number }[]
    totalVotos: number
  } | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleOpcao(opcaoId: number) {
    if (votou) return
    if (permiteMultiplaEscolha) {
      setSelectedOpcoes(prev =>
        prev.includes(opcaoId)
          ? prev.filter(id => id !== opcaoId)
          : [...prev, opcaoId]
      )
    } else {
      setSelectedOpcoes([opcaoId])
    }
  }

  async function handleVotar() {
    if (selectedOpcoes.length === 0 || pending) return
    setPending(true)
    setError(null)

    try {
      for (const opcaoId of selectedOpcoes) {
        await votarEnquete(enqueteId, opcaoId)
      }

      const resultadosData = await obterResultadosEnquete(enqueteId)
      if (resultadosData) {
        setResultados(resultadosData)
      }
      setVotou(true)
    } catch {
      setError('Erro ao registrar voto')
    } finally {
      setPending(false)
    }
  }

  if (resultados) {
    return (
      <div className="space-y-2">
        {resultados.opcoes.map(opcao => (
          <div key={opcao.id} className="relative">
            <div
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs relative overflow-hidden"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-lg transition-all duration-500"
                style={{
                  width: `${opcao.percentual}%`,
                  backgroundColor: 'var(--btn-primary-bg)',
                  opacity: 0.12,
                }}
              />
              <span className="relative z-10" style={{ color: 'var(--text-primary)' }}>
                {opcao.texto}
              </span>
              <span className="relative z-10 font-medium" style={{ color: 'var(--text-secondary)' }}>
                {opcao.percentual}%
              </span>
            </div>
          </div>
        ))}
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {resultados.totalVotos} {resultados.totalVotos === 1 ? 'voto' : 'votos'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-xs p-2 rounded-lg" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
          {error}
        </p>
      )}

      <div className="space-y-1.5">
        {opcoes.map(opcao => {
          const isSelected = selectedOpcoes.includes(opcao.id)
          return (
            <button
              key={opcao.id}
              onClick={() => toggleOpcao(opcao.id)}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-left transition-all"
              style={{
                backgroundColor: isSelected ? 'var(--btn-primary-bg)' : 'var(--bg-secondary)',
                color: isSelected ? 'var(--btn-primary-text)' : 'var(--text-primary)',
                border: `1px solid ${isSelected ? 'var(--btn-primary-bg)' : 'var(--border-color)'}`,
              }}
            >
              <span
                className="w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center"
                style={{
                  borderColor: isSelected ? 'var(--btn-primary-text)' : 'var(--border-color)',
                  backgroundColor: isSelected ? 'var(--btn-primary-text)' : 'transparent',
                }}
              >
                {isSelected && (
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: 'var(--btn-primary-bg)' }}
                  />
                )}
              </span>
              {opcao.texto}
            </button>
          )
        })}
      </div>

      <button
        onClick={handleVotar}
        disabled={selectedOpcoes.length === 0 || pending}
        className="btn-primary rounded-lg px-4 py-2 text-xs font-medium disabled:opacity-40"
      >
        {pending ? 'Votando...' : 'Votar'}
      </button>

      {permiteMultiplaEscolha && (
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          Selecione uma ou mais opções
        </p>
      )}
    </div>
  )
}
