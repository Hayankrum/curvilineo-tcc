'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUsuario } from '@/lib/useData'
import { useState, useEffect } from 'react'
import { obterQuestionario, podeResponder, publicarQuestionario, encerrarQuestionario, arquivarQuestionario, deletarQuestionario, duplicarQuestionario } from '../questionarios.actions'

interface Opcao {
  id: number
  texto: string
  ordem: number
  correta: boolean
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

interface QuestionarioData {
  id: number
  titulo: string
  descricao: string | null
  status: string
  anonimo: boolean
  corTema: string | null
  criadoEm: string
  encerraEm: string | null
  autor: { id: number; nome: string }
  perguntas: Pergunta[]
  totalRespostas: number
}

const STATUS_LABELS: Record<string, string> = {
  rascunho: 'Rascunho',
  publicado: 'Publicado',
  encerrado: 'Encerrado',
  arquivado: 'Arquivado',
}

const STATUS_COLORS: Record<string, string> = {
  rascunho: 'var(--text-tertiary)',
  publicado: '#22c55e',
  encerrado: '#f59e0b',
  arquivado: 'var(--text-tertiary)',
}

const TIPOS_LABELS: Record<string, string> = {
  texto_curto: 'Texto Curto',
  texto_longo: 'Texto Longo',
  escolha_unica: 'Escolha Única',
  multipla_escolha: 'Múltipla Escolha',
  escala: 'Escala',
}

interface Props {
  questionarioId: number
}

export default function QuestionarioDetailPage({ questionarioId }: Props) {
  const router = useRouter()
  const { usuario } = useUsuario()
  const [questionario, setQuestionario] = useState<QuestionarioData | null>(null)
  const [podeResp, setPodeResp] = useState<{ pode: boolean; razao?: string; jaRespondeu?: boolean; anonimo?: boolean }>({ pode: false })
  const [loading, setLoading] = useState(true)
  const [processando, setProcessando] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)

  const isAutor = usuario && questionario && usuario.id === questionario.autor.id

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/questionarios/${questionarioId}/responder`
    : ''

  useEffect(() => {
    if (!shareUrl) return
    import('qrcode').then((QRCode) => {
      QRCode.toDataURL(shareUrl, {
        width: 200,
        margin: 2,
        color: { dark: '#18181b', light: '#ffffff' },
      }).then((dataUrl) => setQrCode(dataUrl))
    })
  }, [shareUrl])

  useEffect(() => {
    Promise.all([
      obterQuestionario(questionarioId),
      podeResponder(questionarioId),
    ]).then(([qResult, pResult]) => {
      if (qResult && 'questionario' in qResult && qResult.questionario) {
        setQuestionario(qResult.questionario as unknown as QuestionarioData)
      }
      setPodeResp(pResult as { pode: boolean; razao?: string })
      setLoading(false)
    })
  }, [questionarioId])

  async function handleDuplicar() {
    if (processando) return
    setProcessando(true)

    try {
      const result = await duplicarQuestionario(questionarioId)
      if (result?.error) {
        alert(result.error)
      } else if (result?.questionario) {
        router.push(`/questionarios/${result.questionario.id}/editar`)
      }
    } finally {
      setProcessando(false)
    }
  }

  async function handleStatusAction(action: 'publicar' | 'encerrar' | 'arquivar' | 'deletar') {
    if (processando) return
    setProcessando(true)

    try {
      let result
      switch (action) {
        case 'publicar':
          result = await publicarQuestionario(questionarioId)
          break
        case 'encerrar':
          result = await encerrarQuestionario(questionarioId)
          break
        case 'arquivar':
          result = await arquivarQuestionario(questionarioId)
          break
        case 'deletar':
          if (!confirm('Tem certeza que deseja excluir este questionário?')) {
            setProcessando(false)
            return
          }
          result = await deletarQuestionario(questionarioId)
          break
      }

      if (result?.error) {
        alert(result.error)
      } else if (action === 'deletar') {
        router.push('/questionarios')
        router.refresh()
      } else {
        const updated = await obterQuestionario(questionarioId)
        if (updated && 'questionario' in updated && updated.questionario) {
          setQuestionario(updated.questionario as unknown as QuestionarioData)
        }
      }
    } finally {
      setProcessando(false)
    }
  }

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(shareUrl)
    } catch {
      const input = document.createElement('input')
      input.value = shareUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  if (loading) {
    return <p style={{ color: 'var(--text-tertiary)' }}>Carregando...</p>
  }

  if (!questionario) {
    return <p style={{ color: 'var(--text-tertiary)' }}>Questionário não encontrado.</p>
  }

  const cor = questionario.corTema || '#6366f1'
  const encerraData = questionario.encerraEm ? new Date(questionario.encerraEm) : null
  const encerraExpirado = encerraData ? encerraData < new Date() : false

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: cor }}
          />
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {questionario.titulo}
          </h1>
        </div>
        {questionario.descricao && (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{questionario.descricao}</p>
        )}
      </div>

      {/* Info badges */}
      <div className="flex flex-wrap gap-2">
        <span
          className="px-3 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: `${STATUS_COLORS[questionario.status]}20`, color: STATUS_COLORS[questionario.status] }}
        >
          {STATUS_LABELS[questionario.status]}
        </span>
        <span
          className="px-3 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: `${cor}20`, color: cor }}
        >
          {questionario.totalRespostas} {questionario.totalRespostas === 1 ? 'resposta' : 'respostas'}
        </span>
        {questionario.anonimo && (
          <span
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: '#a855f720', color: '#a855f7' }}
          >
            Anônimo
          </span>
        )}
        {encerraData && (
          <span
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: encerraExpirado ? '#dc262620' : '#f59e0b20',
              color: encerraExpirado ? '#dc2626' : '#f59e0b',
            }}
          >
            {encerraExpirado ? 'Expirado' : `Encerra ${encerraData.toLocaleDateString('pt-BR')}`}
          </span>
        )}
        <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-tertiary)' }}>
          por {questionario.autor.nome}
        </span>
      </div>

      {/* Ações do autor */}
      {isAutor && (
        <div className="flex flex-wrap gap-2">
          {questionario.status === 'rascunho' && (
            <>
              <Link
                href={`/questionarios/${questionario.id}/editar`}
                className="text-sm font-medium rounded-lg px-4 py-2 transition-colors"
                style={{ backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)' }}
              >
                Editar
              </Link>
              <button
                onClick={() => handleStatusAction('publicar')}
                disabled={processando}
                className="text-sm font-medium rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#22c55e', color: '#fff' }}
              >
                Publicar
              </button>
              <button
                onClick={() => handleStatusAction('deletar')}
                disabled={processando}
                className="text-sm font-medium rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#dc2626', color: '#fff' }}
              >
                Excluir
              </button>
            </>
          )}
          {questionario.status === 'publicado' && (
            <button
              onClick={() => handleStatusAction('encerrar')}
              disabled={processando}
              className="text-sm font-medium rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#f59e0b', color: '#000' }}
            >
              Encerrar
            </button>
          )}
          {questionario.status === 'encerrado' && (
            <button
              onClick={() => handleStatusAction('arquivar')}
              disabled={processando}
              className="text-sm font-medium rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
              style={{ backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)' }}
            >
              Arquivar
            </button>
          )}
          {questionario.status !== 'rascunho' && (
            <Link
              href={`/questionarios/${questionario.id}/resultados`}
              className="text-sm font-medium rounded-lg px-4 py-2 transition-colors"
              style={{ backgroundColor: cor, color: '#fff' }}
            >
              Ver resultados
            </Link>
          )}
          <button
            onClick={handleDuplicar}
            disabled={processando}
            className="text-sm font-medium rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
            style={{ backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)' }}
          >
            Duplicar como rascunho
          </button>
        </div>
      )}

      {/* Ação responder */}
      {podeResp.pode && (
        <Link
          href={`/questionarios/${questionario.id}/responder`}
          className="font-medium rounded-lg px-4 py-2 text-sm transition-colors w-fit"
          style={{ backgroundColor: cor, color: '#fff' }}
        >
          Responder questionário
        </Link>
      )}

      {podeResp.jaRespondeu && !isAutor && (
        <Link
          href={`/questionarios/${questionario.id}/editar-resposta`}
          className="font-medium rounded-lg px-4 py-2 text-sm transition-colors w-fit"
          style={{ backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)' }}
        >
          Editar minha resposta
        </Link>
      )}

      {!podeResp.pode && !podeResp.jaRespondeu && !isAutor && questionario.status === 'publicado' && (
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          {podeResp.razao || 'Você não pode responder este questionário'}
        </p>
      )}

      {/* Compartilhar - inline */}
      {isAutor && questionario.status === 'publicado' && (
        <div
          className="rounded-lg p-4 flex flex-col gap-3"
          style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
        >
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Compartilhar questionário
          </p>
          <div className="flex items-start gap-4">
            {qrCode ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrCode} alt="QR Code" className="w-28 h-28 rounded-lg shrink-0" />
            ) : (
              <div className="w-28 h-28 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--input-bg)' }}>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Gerando...</p>
              </div>
            )}
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <p className="text-xs break-all" style={{ color: 'var(--text-tertiary)' }}>
                {shareUrl}
              </p>
              <button
                onClick={copiarLink}
                className="text-xs font-medium rounded-lg px-3 py-1.5 transition-colors w-fit"
                style={{
                  backgroundColor: copiado ? '#22c55e' : cor,
                  color: '#fff',
                }}
              >
                {copiado ? 'Copiado!' : 'Copiar link'}
              </button>
              {'share' in navigator && (
                <button
                  onClick={() => navigator.share({ title: questionario.titulo, text: `Responda: ${questionario.titulo}`, url: shareUrl })}
                  className="text-xs font-medium rounded-lg px-3 py-1.5 transition-colors w-fit"
                  style={{ backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)' }}
                >
                  Compartilhar via...
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Perguntas */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
          Perguntas ({questionario.perguntas.length})
        </h2>
        {questionario.perguntas.map((pergunta, idx) => (
          <div
            key={pergunta.id}
            className="rounded-lg p-4 flex flex-col gap-2"
            style={{ backgroundColor: 'var(--card-bg)', borderLeft: `3px solid ${cor}` }}
          >
            <div className="flex items-start gap-2">
              <span className="text-sm font-medium shrink-0" style={{ color: cor }}>
                {idx + 1}.
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {pergunta.texto}
                  {pergunta.obrigatoria && (
                    <span className="ml-1" style={{ color: '#f87171' }}>*</span>
                  )}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  {TIPOS_LABELS[pergunta.tipo]}
                </p>
                {pergunta.tipo === 'escala' && pergunta.configEscala && (
                  <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                    Escala de {pergunta.configEscala.min} a {pergunta.configEscala.max} (passo {pergunta.configEscala.passo})
                  </p>
                )}
                {(pergunta.tipo === 'escolha_unica' || pergunta.tipo === 'multipla_escolha') && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {pergunta.opcoes.map((opcao) => (
                      <span
                        key={opcao.id}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: opcao.correta ? `${cor}20` : 'var(--input-bg)',
                          color: opcao.correta ? cor : 'var(--text-secondary)',
                          border: opcao.correta ? `1px solid ${cor}40` : '1px solid transparent',
                        }}
                      >
                        {opcao.correta && '✓ '}{opcao.texto}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
