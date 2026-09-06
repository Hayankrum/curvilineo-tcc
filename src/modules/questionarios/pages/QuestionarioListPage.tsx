'use client'

import Link from 'next/link'
import { useUsuario } from '@/lib/useData'
import { listarMeusQuestionarios } from '../questionarios.actions'
import { useState, useEffect } from 'react'

interface Questionario {
  id: number
  titulo: string
  descricao: string | null
  status: string
  anonimo: boolean
  corTema: string | null
  criadoEm: string
  encerraEm: string | null
  totalPerguntas: number
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

export default function QuestionarioListPage() {
  const { usuario } = useUsuario()
  const [questionarios, setQuestionarios] = useState<Questionario[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!usuario) {
      setLoading(false)
      return
    }

    listarMeusQuestionarios().then((result) => {
      if ('questionarios' in result) {
        setQuestionarios(result.questionarios as Questionario[])
      }
      setLoading(false)
    })
  }, [usuario])

  if (!usuario) {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Meus Questionários</h1>
        <p style={{ color: 'var(--text-tertiary)' }}>Você precisa estar logado para ver seus questionários.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Meus Questionários</h1>
        <Link
          href="/questionarios/novo"
          className="font-medium rounded-lg px-4 py-2 text-sm transition-colors"
          style={{ backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }}
        >
          Novo questionário
        </Link>
      </div>

      {loading && (
        <p style={{ color: 'var(--text-tertiary)' }}>Carregando...</p>
      )}

      {!loading && questionarios.length === 0 && (
        <p style={{ color: 'var(--text-tertiary)' }}>Nenhum questionário criado ainda.</p>
      )}

      <div className="flex flex-col gap-4">
        {questionarios.map((q) => (
          <div key={q.id} className="rounded-lg p-5" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="font-medium text-lg mb-1" style={{ color: 'var(--text-primary)' }}>{q.titulo}</h2>
                {q.descricao && (
                  <p className="text-sm mb-2 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{q.descricao}</p>
                )}
                <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  <span
                    className="px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: `${STATUS_COLORS[q.status]}20`, color: STATUS_COLORS[q.status] }}
                  >
                    {STATUS_LABELS[q.status]}
                  </span>
                  <span>{q.totalPerguntas} {q.totalPerguntas === 1 ? 'pergunta' : 'perguntas'}</span>
                  <span>{q.totalRespostas} {q.totalRespostas === 1 ? 'resposta' : 'respostas'}</span>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <Link
                  href={`/questionarios/${q.id}`}
                  className="text-sm px-3 py-1.5 rounded-lg transition-colors"
                  style={{ backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--text-primary)' }}
                >
                  Ver
                </Link>
                {q.status === 'rascunho' && (
                  <Link
                    href={`/questionarios/${q.id}/editar`}
                    className="text-sm px-3 py-1.5 rounded-lg transition-colors"
                    style={{ backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--text-primary)' }}
                  >
                    Editar
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
