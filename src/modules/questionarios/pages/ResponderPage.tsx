'use client'

import Link from 'next/link'
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
  }, [questionarioId, usuario, loadingUsuario]) // removido router

  if (loading || loadingUsuario) {
    return <p style={{ color: 'var(--text-tertiary)' }}>Carregando...</p>
  }

  if (!questionario) {
    return <p style={{ color: 'var(--text-tertiary)' }}>Questionário não encontrado.</p>
  }

  return (
    <div>
      <Link
        href={`/questionarios/${questionarioId}`}
        className="text-sm transition-colors mb-6 inline-block hover:underline"
        style={{ color: 'var(--text-tertiary)' }}
      >
        ← Voltar
      </Link>
      <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
        {questionario.titulo}
      </h1>
      {questionario.descricao && (
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{questionario.descricao}</p>
      )}
      <FormResposta
        questionario={{
          id: questionario.id,
          titulo: questionario.titulo,
          descricao: questionario.descricao,
          perguntas: questionario.perguntas,
        }}
      />
    </div>
  )
}
