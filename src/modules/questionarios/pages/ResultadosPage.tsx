'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUsuario } from '@/lib/useData'
import { useState, useEffect } from 'react'
import { obterResultados } from '../questionarios.actions'
import ResultadosBasicos from '../components/ResultadosBasicos'
import ExportarCSV from '../components/ExportarCSV'
import FiltroResultados from '../components/FiltroResultados'

interface ResultadoData {
  questionario: {
    id: number
    titulo: string
    descricao: string | null
    status: string
    corTema: string | null
    anonimo: boolean
  }
  totalRespostas: number
  resultados: {
    perguntaId: number
    texto: string
    tipo: string
    totalRespostas: number
    distribuicao?: {
      opcaoId: number
      texto: string
      count: number
      percentual: number
    }[]
    temCorretas?: boolean
    acertos?: number
    taxaAcerto?: number
    media?: number
    min?: number
    max?: number
    respostas?: string[]
  }[]
  respondentes: {
    id: number
    nome: string
    criadoEm: string
  }[]
}

interface Props {
  questionarioId: number
}

export default function ResultadosPage({ questionarioId }: Props) {
  const router = useRouter()
  const { usuario, loading: loadingUsuario } = useUsuario()
  const [dados, setDados] = useState<ResultadoData | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [filtrando, setFiltrando] = useState(false)

  const carregarResultados = async (filtros?: { dataInicio?: string; dataFim?: string }) => {
    const result = await obterResultados(questionarioId, filtros)
    if (result && 'error' in result) {
      setErro(result.error as string)
    } else if (result && 'totalRespostas' in result) {
      setDados(result as unknown as ResultadoData)
    }
  }

  useEffect(() => {
    if (loadingUsuario) return

    carregarResultados().then(() => setLoading(false))
  }, [questionarioId, loadingUsuario])

  async function handleFiltrar(filtros: { dataInicio: string; dataFim: string }) {
    setFiltrando(true)
    await carregarResultados(filtros)
    setFiltrando(false)
  }

  if (loading || loadingUsuario) {
    return <p style={{ color: 'var(--text-tertiary)' }}>Carregando...</p>
  }

  if (erro) {
    return (
      <div>
        <p className="text-sm mb-4" style={{ color: '#f87171' }}>{erro}</p>
        <button
          onClick={() => router.push('/questionarios')}
          className="text-sm font-medium rounded-lg px-4 py-2 transition-colors"
          style={{ backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--text-primary)' }}
        >
          Voltar
        </button>
      </div>
    )
  }

  if (!dados) {
    return (
      <div>
        <p className="text-sm mb-4" style={{ color: 'var(--text-tertiary)' }}>Resultado não encontrado.</p>
        <button
          onClick={() => router.push('/questionarios')}
          className="text-sm font-medium rounded-lg px-4 py-2 transition-colors"
          style={{ backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--text-primary)' }}
        >
          Voltar
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/questionarios/${questionarioId}`}
        className="text-sm transition-colors mb-2 inline-block hover:underline"
        style={{ color: 'var(--text-tertiary)' }}
      >
        ← Voltar
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Resultados: {dados.questionario.titulo}
          </h1>
          {dados.questionario.descricao && (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {dados.questionario.descricao}
            </p>
          )}
        </div>
        <ExportarCSV
          titulo={dados.questionario.titulo}
          resultados={dados.resultados}
          totalRespostas={dados.totalRespostas}
        />
      </div>

      <FiltroResultados onFiltrar={handleFiltrar} loading={filtrando} />

      {dados.respondentes.length > 0 && !dados.questionario.anonimo && (
        <div
          className="rounded-lg p-4"
          style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
        >
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Quem respondeu
          </p>
          <div className="flex flex-col gap-1">
            {dados.respondentes.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
                <span>{r.nome}</span>
                <span style={{ color: 'var(--text-tertiary)' }}>
                  {new Date(r.criadoEm).toLocaleDateString('pt-BR')} {new Date(r.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <ResultadosBasicos
        totalRespostas={dados.totalRespostas}
        resultados={dados.resultados}
      />
    </div>
  )
}
