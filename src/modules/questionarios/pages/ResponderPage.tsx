'use client'

import { useRouter } from 'next/navigation'
import { useUsuario } from '@/lib/useData'
import { useState, useEffect } from 'react'
import { obterQuestionario } from '../questionarios.actions'
import FormResposta from '../components/FormResposta'

interface Pergunta {
  id: number
  texto: string
  tipo: string
  obrigatoria: boolean
  ordem: number
  opcoes: { id: number; texto: string; ordem: number; correta: boolean }[]
  configEscala: { min: number; max: number; passo: number } | null
}

interface QuestionarioData {
  id: number
  titulo: string
  descricao: string | null
  anonimo: boolean
  corTema: string | null
  encerraEm: string | null
  perguntas: Pergunta[]
}

interface Props {
  questionarioId: number
}

export default function ResponderPage({ questionarioId }: Props) {
  const router = useRouter()
  const { usuario, loading: loadingUsuario } = useUsuario()
  const [questionario, setQuestionario] = useState<QuestionarioData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (loadingUsuario) return

    if (!usuario) {
      router.push('/usuarios/login')
      return
    }

    obterQuestionario(questionarioId).then((result) => {
      if (result && 'questionario' in result && result.questionario) {
        setQuestionario(result.questionario as unknown as QuestionarioData)
      } else {
        router.push('/questionarios')
      }
      setLoading(false)
    })
  }, [questionarioId, usuario, loadingUsuario])

  if (loading || loadingUsuario) {
    return <p style={{ color: 'var(--text-tertiary)' }}>Carregando...</p>
  }

  if (!questionario) {
    return <p style={{ color: 'var(--text-tertiary)' }}>Questionário não encontrado.</p>
  }

  const cor = questionario.corTema || '#6366f1'
  const encerraData = questionario.encerraEm ? new Date(questionario.encerraEm) : null
  const encerraExpirado = encerraData ? encerraData < new Date() : false

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cor }} />
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          {questionario.titulo}
        </h1>
      </div>

      <div className="flex gap-2 flex-wrap">
        {questionario.anonimo && (
          <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#a855f720', color: '#a855f7' }}>
            Resposta anônima
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
            {encerraExpirado ? 'Questionário expirado' : `Encerra ${encerraData.toLocaleDateString('pt-BR')}`}
          </span>
        )}
      </div>

      {questionario.descricao && (
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{questionario.descricao}</p>
      )}

      <div style={{ borderTop: '1px solid var(--card-border)' }}>
        <FormResposta
          questionario={{
            id: questionario.id,
            titulo: questionario.titulo,
            descricao: questionario.descricao,
            perguntas: questionario.perguntas,
          }}
        />
      </div>
    </div>
  )
}
