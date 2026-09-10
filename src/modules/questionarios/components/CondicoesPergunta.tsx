'use client'

import { useState } from 'react'

interface Pergunta {
  id?: number
  texto: string
  tipo: string
  obrigatoria: boolean
  ordem: number
  opcoes: { id?: number; texto: string; ordem: number; correta: boolean }[]
}

interface Condicao {
  perguntaOrigemId: number
  tipoCondicao: 'igual' | 'diferente' | 'contem' | 'nao_contem'
  valor: string
}

interface Props {
  perguntas: Pergunta[]
  perguntaAtual: number
  condicoes: Condicao[]
  onChange: (condicoes: Condicao[]) => void
}

export default function CondicoesPergunta({ perguntas, perguntaAtual, condicoes, onChange }: Props) {
  const [editando, setEditando] = useState(false)

  const perguntasAnteriores = perguntas.filter((_, idx) => idx < perguntaAtual)

  function adicionarCondicao() {
    if (perguntasAnteriores.length === 0) return

    const novaCondicao: Condicao = {
      perguntaOrigemId: perguntasAnteriores[0].ordem,
      tipoCondicao: 'igual',
      valor: '',
    }
    onChange([...condicoes, novaCondicao])
  }

  function removerCondicao(index: number) {
    onChange(condicoes.filter((_, i) => i !== index))
  }

  function atualizarCondicao(index: number, campo: keyof Condicao, valor: unknown) {
    const novas = [...condicoes]
    novas[index] = { ...novas[index], [campo]: valor }
    onChange(novas)
  }

  function obterOpcoesPergunta(perguntaId: number) {
    const pergunta = perguntasAnteriores.find((p) => p.ordem === perguntaId || p.id === perguntaId)
    return pergunta?.opcoes || []
  }

  if (perguntasAnteriores.length === 0) {
    return null
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setEditando(!editando)}
        className="text-xs font-medium flex items-center gap-1"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform ${editando ? 'rotate-90' : ''}`}
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
        Condições {condicoes.length > 0 && `(${condicoes.length})`}
      </button>

      {editando && (
        <div className="mt-2 flex flex-col gap-2">
          {condicoes.map((condicao, idx) => {
            const opcoes = obterOpcoesPergunta(condicao.perguntaOrigemId)

            return (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <span style={{ color: 'var(--text-tertiary)' }}>Se</span>
                <select
                  value={condicao.perguntaOrigemId}
                  onChange={(e) => atualizarCondicao(idx, 'perguntaOrigemId', Number(e.target.value))}
                  className="rounded px-2 py-1 text-xs focus:outline-none"
                  style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
                >
                  {perguntasAnteriores.map((p, i) => (
                    <option key={i} value={p.ordem}>
                      {p.texto || `Pergunta ${i + 1}`}
                    </option>
                  ))}
                </select>

                <select
                  value={condicao.tipoCondicao}
                  onChange={(e) => atualizarCondicao(idx, 'tipoCondicao', e.target.value)}
                  className="rounded px-2 py-1 text-xs focus:outline-none"
                  style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
                >
                  <option value="igual">igual a</option>
                  <option value="diferente">diferente de</option>
                  {opcoes.length > 0 && <option value="contem">contém</option>}
                  {opcoes.length > 0 && <option value="nao_contem">não contém</option>}
                </select>

                {opcoes.length > 0 ? (
                  <select
                    value={condicao.valor}
                    onChange={(e) => atualizarCondicao(idx, 'valor', e.target.value)}
                    className="rounded px-2 py-1 text-xs focus:outline-none flex-1"
                    style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
                  >
                    <option value="">Selecione...</option>
                    {opcoes.map((o, oIdx) => (
                      <option key={oIdx} value={o.texto}>
                        {o.texto}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={condicao.valor}
                    onChange={(e) => atualizarCondicao(idx, 'valor', e.target.value)}
                    placeholder="Valor"
                    className="rounded px-2 py-1 text-xs focus:outline-none flex-1"
                    style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
                  />
                )}

                <button
                  type="button"
                  onClick={() => removerCondicao(idx)}
                  className="text-xs px-1"
                  style={{ color: '#f87171' }}
                >
                  ✕
                </button>
              </div>
            )
          })}

          <button
            type="button"
            onClick={adicionarCondicao}
            className="text-xs font-medium self-start"
            style={{ color: 'var(--text-secondary)' }}
          >
            + Adicionar condição
          </button>
        </div>
      )}
    </div>
  )
}
