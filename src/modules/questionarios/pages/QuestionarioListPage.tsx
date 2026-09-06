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

      <div className="flex flex-col gap-3">
        {questionarios.map((q) => {
          const cor = q.corTema || '#6366f1'
          const encerraData = q.encerraEm ? new Date(q.encerraEm) : null
          const encerraExpirado = encerraData ? encerraData < new Date() : false

          return (
            <Link
              key={q.id}
              href={`/questionarios/${q.id}`}
              className="rounded-lg p-4 flex gap-4 transition-colors hover:opacity-95"
              style={{ backgroundColor: 'var(--card-bg)', borderLeft: `4px solid ${cor}` }}
            >
              <div className="flex-1 min-w-0">
                <h2 className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{q.titulo}</h2>
                {q.descricao && (
                  <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-secondary)' }}>{q.descricao}</p>
                )}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                    style={{ backgroundColor: `${STATUS_COLORS[q.status]}20`, color: STATUS_COLORS[q.status] }}
                  >
                    {STATUS_LABELS[q.status]}
                  </span>
                  {q.anonimo && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: '#a855f720', color: '#a855f7' }}>
                      Anônimo
                    </span>
                  )}
                  {encerraData && (
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{
                        backgroundColor: encerraExpirado ? '#dc262620' : '#f59e0b20',
                        color: encerraExpirado ? '#dc2626' : '#f59e0b',
                      }}
                    >
                      {encerraExpirado ? 'Expirado' : encerraData.toLocaleDateString('pt-BR')}
                    </span>
                  )}
                  <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                    {q.totalPerguntas} perguntas · {q.totalRespostas} respostas
                  </span>
                </div>
              </div>
              <div className="flex items-center shrink-0">
                <span className="text-lg" style={{ color: 'var(--text-tertiary)' }}>→</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
