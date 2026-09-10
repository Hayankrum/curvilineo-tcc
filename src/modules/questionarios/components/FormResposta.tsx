'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { enviarResposta, editarResposta } from '../questionarios.actions'

interface Opcao {
  id: number
  texto: string
  ordem: number
}

interface Pergunta {
  id: number
  texto: string
  tipo: string
  obrigatoria: boolean
  ordem: number
  opcoes: Opcao[]
  configEscala: { min: number; max: number; passo: number } | null
}

interface Questionario {
  id: number
  titulo: string
  descricao: string | null
  perguntas: Pergunta[]
}

interface Props {
  questionario: Questionario
  anonimo?: boolean
  respostaExistente?: {
    id: number
    valores: {
      perguntaId: number
      texto: string | null
      opcaoId: number | null
      valorNumerico: number | null
    }[]
  } | null
}

interface ValoresResposta {
  [perguntaId: number]: {
    texto?: string
    opcaoId?: number
    opcaoIds?: number[]
    valorNumerico?: number
  }
}

export default function FormResposta({ questionario, anonimo, respostaExistente }: Props) {
  const router = useRouter()
  const [valores, setValores] = useState<ValoresResposta>(() => {
    if (!respostaExistente) return {}
    const inicial: ValoresResposta = {}
    for (const v of respostaExistente.valores) {
      inicial[v.perguntaId] = {
        texto: v.texto || undefined,
        opcaoId: v.opcaoId || undefined,
        valorNumerico: v.valorNumerico || undefined,
      }
    }
    return inicial
  })
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [nomeAnonimo, setNomeAnonimo] = useState('')

  const isEdicao = !!respostaExistente

  function atualizarTexto(perguntaId: number, texto: string) {
    setValores((prev) => ({
      ...prev,
      [perguntaId]: { ...prev[perguntaId], texto },
    }))
  }

  function atualizarOpcao(perguntaId: number, opcaoId: number) {
    setValores((prev) => ({
      ...prev,
      [perguntaId]: { ...prev[perguntaId], opcaoId },
    }))
  }

  function toggleMultiplaEscolha(perguntaId: number, opcaoId: number) {
    setValores((prev) => {
      const atual = prev[perguntaId]?.opcaoIds || []
      const novo = atual.includes(opcaoId)
        ? atual.filter((id) => id !== opcaoId)
        : [...atual, opcaoId]
      return {
        ...prev,
        [perguntaId]: { ...prev[perguntaId], opcaoIds: novo },
      }
    })
  }

  function atualizarEscala(perguntaId: number, valor: number) {
    setValores((prev) => ({
      ...prev,
      [perguntaId]: { ...prev[perguntaId], valorNumerico: valor },
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setEnviando(true)

    const valoresEnvio = Object.entries(valores).map(([perguntaId, v]) => {
      const pergunta = questionario.perguntas.find((p) => p.id === Number(perguntaId))
      return {
        perguntaId: Number(perguntaId),
        tipo: pergunta?.tipo || '',
        texto: v.texto || null,
        opcaoId: v.opcaoId || null,
        opcaoIds: v.opcaoIds || [],
        valorNumerico: v.valorNumerico ?? null,
      }
    })

    try {
      let resultado
      if (isEdicao) {
        resultado = await editarResposta(questionario.id, valoresEnvio)
      } else {
        resultado = await enviarResposta(questionario.id, valoresEnvio, nomeAnonimo || undefined)
      }
      if (resultado?.error) {
        setErro(resultado.error)
        setEnviando(false)
      } else {
        router.push(`/questionarios/${questionario.id}/resultados`)
        router.refresh()
      }
    } catch {
      setErro(isEdicao ? 'Erro ao editar resposta' : 'Erro ao enviar resposta')
      setEnviando(false)
    }
  }

  function renderPergunta(pergunta: Pergunta) {
    const valor = valores[pergunta.id]

    switch (pergunta.tipo) {
      case 'texto_curto':
        return (
          <input
            type="text"
            value={valor?.texto || ''}
            onChange={(e) => atualizarTexto(pergunta.id, e.target.value)}
            placeholder="Sua resposta"
            className="w-full rounded-lg px-4 py-2 text-sm focus:outline-none transition-colors"
            style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
          />
        )

      case 'texto_longo':
        return (
          <textarea
            value={valor?.texto || ''}
            onChange={(e) => atualizarTexto(pergunta.id, e.target.value)}
            placeholder="Sua resposta"
            rows={4}
            className="w-full rounded-lg px-4 py-2 text-sm focus:outline-none transition-colors resize-none"
            style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
          />
        )

      case 'escolha_unica':
        return (
          <div className="flex flex-col gap-2">
            {pergunta.opcoes.map((opcao) => (
              <label
                key={opcao.id}
                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                style={{
                  backgroundColor: valor?.opcaoId === opcao.id ? 'var(--btn-primary-bg)' : 'var(--input-bg)',
                  border: `1px solid ${valor?.opcaoId === opcao.id ? 'var(--btn-primary-bg)' : 'var(--input-border)'}`,
                  color: valor?.opcaoId === opcao.id ? 'var(--btn-primary-text)' : 'var(--text-primary)',
                }}
              >
                <input
                  type="radio"
                  name={`pergunta_${pergunta.id}`}
                  checked={valor?.opcaoId === opcao.id}
                  onChange={() => atualizarOpcao(pergunta.id, opcao.id)}
                  className="accent-current"
                />
                <span className="text-sm">{opcao.texto}</span>
              </label>
            ))}
          </div>
        )

      case 'multipla_escolha':
        return (
          <div className="flex flex-col gap-2">
            {pergunta.opcoes.map((opcao) => {
              const selecionada = valor?.opcaoIds?.includes(opcao.id) || false
              return (
                <label
                  key={opcao.id}
                  className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                  style={{
                    backgroundColor: selecionada ? 'var(--btn-primary-bg)' : 'var(--input-bg)',
                    border: `1px solid ${selecionada ? 'var(--btn-primary-bg)' : 'var(--input-border)'}`,
                    color: selecionada ? 'var(--btn-primary-text)' : 'var(--text-primary)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selecionada}
                    onChange={() => toggleMultiplaEscolha(pergunta.id, opcao.id)}
                    className="accent-current"
                  />
                  <span className="text-sm">{opcao.texto}</span>
                </label>
              )
            })}
          </div>
        )

      case 'escala': {
        const config = pergunta.configEscala || { min: 1, max: 5, passo: 1 }
        const atual = valor?.valorNumerico ?? config.min
        return (
          <div className="flex flex-col gap-2">
            <input
              type="range"
              min={config.min}
              max={config.max}
              step={config.passo}
              value={atual}
              onChange={(e) => atualizarEscala(pergunta.id, Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{ backgroundColor: 'var(--input-bg)' }}
            />
            <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-tertiary)' }}>
              <span>{config.min}</span>
              <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{atual}</span>
              <span>{config.max}</span>
            </div>
          </div>
        )
      }

      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {erro && (
        <div className="alert-error" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {erro}
        </div>
      )}

      {questionario.descricao && (
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {questionario.descricao}
        </p>
      )}

      {anonimo && !isEdicao && (
        <div className="rounded-lg p-4 flex flex-col gap-2" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Como você gostaria de ser identificado? <span className="text-xs font-normal" style={{ color: 'var(--text-tertiary)' }}>(opcional)</span>
          </p>
          <input
            type="text"
            value={nomeAnonimo}
            onChange={(e) => setNomeAnonimo(e.target.value)}
            placeholder="Seu nome (ou deixe em branco para anônimo)"
            className="rounded-lg px-4 py-2 text-sm focus:outline-none transition-colors"
            style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
          />
        </div>
      )}

      {questionario.perguntas.map((pergunta) => (
        <div
          key={pergunta.id}
          className="rounded-lg p-4 flex flex-col gap-3"
          style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
        >
          <div className="flex items-start gap-2">
            <p className="text-sm font-medium flex-1" style={{ color: 'var(--text-primary)' }}>
              {pergunta.texto}
              {pergunta.obrigatoria && (
                <span className="ml-1" style={{ color: '#f87171' }}>*</span>
              )}
            </p>
          </div>
          {renderPergunta(pergunta)}
        </div>
      ))}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={enviando}
          className="btn-primary"
        >
          {enviando ? (isEdicao ? 'Salvando...' : 'Enviando...') : (isEdicao ? 'Salvar alterações' : 'Enviar respostas')}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-ghost"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
