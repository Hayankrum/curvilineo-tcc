'use client'

import { useRouter } from 'next/navigation'
import { useUsuario } from '@/lib/useData'
import { useState, useEffect } from 'react'
import { obterQuestionarioParaEdicao } from '../questionarios.actions'
import FormQuestionario from '../components/FormQuestionario'

interface PerguntaExistente {
  id: number
  texto: string
  tipo: string
  obrigatoria: boolean
  ordem: number
  opcoes: { id: number; texto: string; ordem: number; correta: boolean }[]
  configEscala: { min: number; max: number; passo: number } | null
}

interface QuestionarioExistente {
  id: number
  titulo: string
  descricao: string | null
  perguntas: PerguntaExistente[]
}

interface Props {
  questionarioId?: number
}

export default function QuestionarioFormPage({ questionarioId }: Props) {
  const router = useRouter()
  const { usuario, loading: loadingUsuario } = useUsuario()
  const [questionario, setQuestionario] = useState<QuestionarioExistente | null>(null)
  const [loading, setLoading] = useState(true)

  const isEdicao = !!questionarioId

  useEffect(() => {
    if (loadingUsuario) return

    if (!usuario) {
      router.push('/usuarios/login')
      return
    }

    if (questionarioId) {
      obterQuestionarioParaEdicao(questionarioId).then((result) => {
        if (result && 'questionario' in result && result.questionario) {
          setQuestionario(result.questionario as unknown as QuestionarioExistente)
        } else {
          router.push('/questionarios')
        }
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [questionarioId, usuario, loadingUsuario]) // removido router

  if (loading || loadingUsuario) {
    return <p style={{ color: 'var(--text-tertiary)' }}>Carregando...</p>
  }

  if (isEdicao && !questionario) {
    return <p style={{ color: 'var(--text-tertiary)' }}>Questionário não encontrado.</p>
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
        {isEdicao ? 'Editar Questionário' : 'Novo Questionário'}
      </h1>
      <FormQuestionario
        questionario={questionario || undefined}
      />
    </div>
  )
}
