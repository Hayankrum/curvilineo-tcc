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
  usuariosEsperados: number | null
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
      QRCode.toDataURL(shareUrl, { width: 300, margin: 2, color: { dark: '#18181b', light: '#ffffff' } })
        .then((dataUrl) => setQrCode(dataUrl))
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
        const [updated, podeRespAtualizado] = await Promise.all([
          obterQuestionario(questionarioId),
          podeResponder(questionarioId),
        ])
        if (updated && 'questionario' in updated && updated.questionario) {
          setQuestionario(updated.questionario as unknown as QuestionarioData)
        }
        setPodeResp(podeRespAtualizado as { pode: boolean; razao?: string })
      }
    } finally {
      setProcessando(false)
    }
  }

  if (loading) {
    return <p style={{ color: 'var(--text-tertiary)' }}>Carregando...</p>
  }

  if (!questionario) {
    return <p style={{ color: 'var(--text-tertiary)' }}>Questionário não encontrado.</p>
  }

  const encerraData = questionario.encerraEm ? new Date(questionario.encerraEm) : null

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/questionarios"
        className="text-sm transition-colors mb-2 inline-block hover:underline"
        style={{ color: 'var(--text-tertiary)' }}
      >
        ← Voltar
      </Link>

      <div>
        <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{questionario.titulo}</h1>
        <p className="text-sm mb-2" style={{ color: 'var(--text-tertiary)' }}>por {questionario.autor.nome}</p>
        {questionario.descricao && (
          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{questionario.descricao}</p>
        )}
        <div className="flex items-center gap-4 text-xs flex-wrap" style={{ color: 'var(--text-tertiary)' }}>
          <span
            className="px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: `${STATUS_COLORS[questionario.status]}20`, color: STATUS_COLORS[questionario.status] }}
          >
            {STATUS_LABELS[questionario.status]}
          </span>
          <span>{questionario.totalRespostas} {questionario.totalRespostas === 1 ? 'resposta' : 'respostas'}</span>
          {questionario.anonimo && <span>Anônimo</span>}
          {encerraData && <span>Encerra {encerraData.toLocaleDateString('pt-BR')}</span>}
          {questionario.usuariosEsperados && (
            <span>
              {questionario.totalRespostas}/{questionario.usuariosEsperados} respostas
            </span>
          )}
        </div>
      </div>

      {isAutor && (
        <div className="flex flex-wrap gap-2">
          {questionario.status === 'rascunho' && (
            <div className="flex">
              <Link
                href={`/questionarios/${questionario.id}/editar`}
                className="text-xs font-medium px-3 py-1.5 transition-colors -ml-px first:ml-0 first:rounded-l-lg hover:underline"
                style={{ backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--text-primary)', border: '1px solid var(--card-border)' }}
              >
                Editar
              </Link>
              <button
                onClick={() => handleStatusAction('publicar')}
                disabled={processando}
                className="text-xs font-medium px-3 py-1.5 transition-colors -ml-px disabled:opacity-50"
                style={{ backgroundColor: '#22c55e', color: '#fff', border: '1px solid #16a34a' }}
              >
                Publicar
              </button>
              <button
                onClick={() => handleStatusAction('deletar')}
                disabled={processando}
                className="text-xs font-medium px-3 py-1.5 transition-colors -ml-px last:rounded-r-lg disabled:opacity-50"
                style={{ backgroundColor: '#dc2626', color: '#fff', border: '1px solid #b91c1c' }}
              >
                Excluir
              </button>
            </div>
          )}
          {questionario.status === 'publicado' && (
            <div className="flex">
              <button
                onClick={() => handleStatusAction('encerrar')}
                disabled={processando}
                className="text-xs font-medium px-3 py-1.5 transition-colors -ml-px first:ml-0 first:rounded-l-lg disabled:opacity-50"
                style={{ backgroundColor: '#f59e0b', color: '#000', border: '1px solid #d97706' }}
              >
                Encerrar
              </button>
              <button
                onClick={() => handleStatusAction('deletar')}
                disabled={processando}
                className="text-xs font-medium px-3 py-1.5 transition-colors -ml-px last:rounded-r-lg disabled:opacity-50"
                style={{ backgroundColor: '#dc2626', color: '#fff', border: '1px solid #b91c1c' }}
              >
                Excluir
              </button>
            </div>
          )}
          {questionario.status === 'encerrado' && (
            <div className="flex">
              <button
                onClick={() => handleStatusAction('arquivar')}
                disabled={processando}
                className="text-xs font-medium px-3 py-1.5 transition-colors -ml-px first:ml-0 first:rounded-l-lg disabled:opacity-50"
                style={{ backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--text-primary)', border: '1px solid var(--card-border)' }}
              >
                Arquivar
              </button>
              <button
                onClick={() => handleStatusAction('deletar')}
                disabled={processando}
                className="text-xs font-medium px-3 py-1.5 transition-colors -ml-px last:rounded-r-lg disabled:opacity-50"
                style={{ backgroundColor: '#dc2626', color: '#fff', border: '1px solid #b91c1c' }}
              >
                Excluir
              </button>
            </div>
          )}
          <button
            onClick={handleDuplicar}
            disabled={processando}
            className="text-xs font-medium px-3 py-1.5 transition-colors rounded-lg disabled:opacity-50"
            style={{ backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--text-primary)', border: '1px solid var(--card-border)' }}
          >
            Copiar modelo
          </button>
        </div>
      )}

      <div
        className="rounded-lg p-4"
        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
      >
        <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Compartilhar</p>
        <div className="flex items-start gap-4">
          {qrCode ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrCode} alt="QR Code" className="w-40 h-40 rounded shrink-0" />
          ) : (
            <div className="w-40 h-40 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--input-bg)' }}>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Gerando...</p>
            </div>
          )}
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <p className="text-xs break-all" style={{ color: 'var(--text-tertiary)' }}>{shareUrl}</p>
            <button
              onClick={async () => {
                try { await navigator.clipboard.writeText(shareUrl) } catch { /* ignore */ }
                setCopiado(true)
                setTimeout(() => setCopiado(false), 2000)
              }}
              className="text-xs font-medium rounded-lg px-3 py-1.5 transition-colors w-fit"
              style={{ backgroundColor: copiado ? '#22c55e' : 'var(--btn-primary-bg)', color: copiado ? '#fff' : 'var(--btn-primary-text)' }}
            >
              {copiado ? 'Copiado!' : 'Copiar link'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        <Link
          href={`/questionarios/${questionario.id}/responder`}
          className="text-xs font-medium px-3 py-1.5 transition-colors -ml-px first:ml-0 first:rounded-l-lg last:rounded-r-lg disabled:opacity-40 disabled:pointer-events-none"
          style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-tertiary)', border: '1px solid var(--card-border)' }}
          aria-disabled={!podeResp.pode}
          tabIndex={podeResp.pode ? 0 : -1}
          onClick={(e) => { if (!podeResp.pode) e.preventDefault() }}
        >
          {podeResp.pode ? 'Responder questionário' : 'Indisponível'}
        </Link>
        <Link
          href={`/questionarios/${questionario.id}/resultados`}
          className="text-xs font-medium px-3 py-1.5 transition-colors -ml-px first:ml-0 first:rounded-l-lg last:rounded-r-lg"
          style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-tertiary)', border: '1px solid var(--card-border)' }}
        >
          Ver resultados
        </Link>
      </div>

      {podeResp.jaRespondeu && !isAutor && (
        <Link
          href={`/questionarios/${questionario.id}/editar-resposta`}
          className="text-xs font-medium px-3 py-1.5 transition-colors rounded-lg w-fit"
          style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-tertiary)', border: '1px solid var(--card-border)' }}
        >
          Editar minha resposta
        </Link>
      )}

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Perguntas</h2>
        {questionario.perguntas.map((pergunta, idx) => (
          <div
            key={pergunta.id}
            className="rounded-lg p-4 flex flex-col gap-2"
            style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
          >
            <div className="flex items-start gap-2">
              <span className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>{idx + 1}.</span>
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
                  <div className="flex flex-wrap gap-2 mt-2">
                    {pergunta.opcoes.map((opcao) => (
                      <span
                        key={opcao.id}
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          backgroundColor: 'var(--input-bg)',
                          color: opcao.correta ? '#22c55e' : 'var(--text-secondary)',
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
