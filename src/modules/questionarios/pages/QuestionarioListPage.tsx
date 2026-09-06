'use client'

import Link from 'next/link'
import { useUsuario } from '@/lib/useData'
import { listarMeusQuestionarios } from '../questionarios.actions'
import { useState, useEffect, useCallback } from 'react'

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
  todos: 'Todos',
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
  const [busca, setBusca] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('todos')
  const [pagina, setPagina] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [total, setTotal] = useState(0)

  const carregar = useCallback(async (p: number, buscaVal: string, statusVal: string) => {
    setLoading(true)
    const result = await listarMeusQuestionarios({
      busca: buscaVal || undefined,
      status: statusVal !== 'todos' ? statusVal : undefined,
      pagina: p,
      porPagina: 10,
    })
    if ('questionarios' in result) {
      setQuestionarios(result.questionarios as Questionario[])
      setTotalPaginas(result.paginas as number)
      setTotal(result.total as number)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!usuario) {
      setLoading(false)
      return
    }
    carregar(1, '', 'todos')
  }, [usuario, carregar])

  function handleBuscar(e: React.FormEvent) {
    e.preventDefault()
    setPagina(1)
    carregar(1, busca, statusFiltro)
  }

  function handleFiltrarStatus(status: string) {
    setStatusFiltro(status)
    setPagina(1)
    carregar(1, busca, status)
  }

  function handlePagina(p: number) {
    setPagina(p)
    carregar(p, busca, statusFiltro)
  }

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Meus Questionários</h1>
        <Link
          href="/questionarios/novo"
          className="font-medium rounded-lg px-4 py-2 text-sm transition-colors"
          style={{ backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }}
        >
          Novo questionário
        </Link>
      </div>

      {/* Busca */}
      <form onSubmit={handleBuscar} className="flex gap-2 mb-4">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por título ou descrição..."
          className="flex-1 rounded-lg px-4 py-2 text-sm focus:outline-none transition-colors"
          style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
        />
        <button
          type="submit"
          className="font-medium rounded-lg px-4 py-2 text-sm transition-colors"
          style={{ backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--text-primary)' }}
        >
          Buscar
        </button>
      </form>

      {/* Filtros de status */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => handleFiltrarStatus(key)}
            className="text-xs font-medium rounded-full px-3 py-1 transition-colors"
            style={{
              backgroundColor: statusFiltro === key ? 'var(--btn-primary-bg)' : 'var(--card-bg)',
              color: statusFiltro === key ? 'var(--btn-primary-text)' : 'var(--text-tertiary)',
              border: '1px solid var(--card-border)',
            }}
          >
            {label}
          </button>
        ))}
        {total > 0 && (
          <span className="text-xs self-center ml-2" style={{ color: 'var(--text-tertiary)' }}>
            {total} {total === 1 ? 'resultado' : 'resultados'}
          </span>
        )}
      </div>

      {loading && (
        <p style={{ color: 'var(--text-tertiary)' }}>Carregando...</p>
      )}

      {!loading && questionarios.length === 0 && (
        <p style={{ color: 'var(--text-tertiary)' }}>
          {busca || statusFiltro !== 'todos' ? 'Nenhum questionário encontrado com esses filtros.' : 'Nenhum questionário criado ainda.'}
        </p>
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

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => handlePagina(pagina - 1)}
            disabled={pagina === 1}
            className="text-sm px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
            style={{ backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--text-primary)' }}
          >
            ← Anterior
          </button>
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => handlePagina(p)}
              className="text-sm w-8 h-8 rounded-lg transition-colors"
              style={{
                backgroundColor: p === pagina ? 'var(--btn-primary-bg)' : 'transparent',
                color: p === pagina ? 'var(--btn-primary-text)' : 'var(--text-tertiary)',
              }}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => handlePagina(pagina + 1)}
            disabled={pagina === totalPaginas}
            className="text-sm px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
            style={{ backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--text-primary)' }}
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  )
}
