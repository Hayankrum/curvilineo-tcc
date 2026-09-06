'use client'

import { useState, useEffect } from 'react'
import { listarInscricoesUsuario, cancelarInscricao } from '../cadastro.actions'

interface Inscricao {
  id: number
  tipoUsuario: string
  status: string
  dataInscricao: Date
  turma: {
    id: number
    nome: string
    dataInicio: Date
    dataFim: Date
    curso: {
      nome: string
    }
  }
}

interface ListaInscricoesProps {
  usuarioId?: number
}

export default function ListaInscricoes({ usuarioId }: ListaInscricoesProps) {
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [cancelandoId, setCancelandoId] = useState<number | null>(null)

  useEffect(() => {
    async function carregarInscricoes() {
      try {
        const dados = await listarInscricoesUsuario()
        setInscricoes(dados as unknown as Inscricao[])
      } catch (error) {
        console.error('Erro ao carregar inscrições:', error)
      } finally {
        setCarregando(false)
      }
    }
    carregarInscricoes()
  }, [])

  const handleCancelar = async (inscricaoId: number) => {
    if (!confirm('Tem certeza que deseja cancelar esta inscrição?')) return
    
    setCancelandoId(inscricaoId)
    try {
      const resultado = await cancelarInscricao(inscricaoId)
      if (resultado.success) {
        setInscricoes(prev => prev.filter(i => i.id !== inscricaoId))
      }
    } catch (error) {
      console.error('Erro ao cancelar inscrição:', error)
    } finally {
      setCancelandoId(null)
    }
  }

  const formatarData = (data: Date) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatarTipoUsuario = (tipo: string) => {
    const tipos: Record<string, string> = {
      discente: 'Discente',
      docente: 'Docente'
    }
    return tipos[tipo] || tipo
  }

  const getStatusStyle = (status: string) => {
    if (status === 'ativa') {
      return {
        backgroundColor: '#d1fae5',
        color: '#059669'
      }
    }
    return {
      backgroundColor: '#fee2e2',
      color: '#dc2626'
    }
  }

  if (carregando) {
    return (
      <div style={{ 
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--text-secondary)'
      }}>
        Carregando suas inscrições...
      </div>
    )
  }

  if (inscricoes.length === 0) {
    return (
      <div style={{
        padding: '2rem',
        backgroundColor: 'var(--card-bg)',
        borderRadius: '12px',
        border: '1px solid var(--input-border)',
        textAlign: 'center'
      }}>
        <p style={{ 
          margin: 0,
          color: 'var(--text-secondary)'
        }}>
          Você ainda não está inscrito em nenhum curso.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3 style={{ 
        margin: 0,
        color: 'var(--text-primary)',
        fontSize: '1.25rem'
      }}>
        Suas Inscrições
      </h3>

      {inscricoes.map((inscricao) => (
        <div
          key={inscricao.id}
          style={{
            padding: '1.5rem',
            backgroundColor: 'var(--card-bg)',
            borderRadius: '12px',
            border: '1px solid var(--input-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ flex: 1, minWidth: '250px' }}>
            <h4 style={{ 
              margin: '0 0 0.5rem 0',
              color: 'var(--text-primary)',
              fontSize: '1.1rem'
            }}>
              {inscricao.turma.curso.nome}
            </h4>
            <p style={{ 
              margin: '0 0 0.25rem 0',
              color: 'var(--text-secondary)',
              fontSize: '0.9rem'
            }}>
              Turma: {inscricao.turma.nome}
            </p>
            <p style={{ 
              margin: '0 0 0.25rem 0',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem'
            }}>
              Período: {formatarData(inscricao.turma.dataInicio)} - {formatarData(inscricao.turma.dataFim)}
            </p>
            <p style={{ 
              margin: '0 0 0.5rem 0',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem'
            }}>
              Tipo: {formatarTipoUsuario(inscricao.tipoUsuario)}
            </p>
            <span style={{
              display: 'inline-block',
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 500,
              ...getStatusStyle(inscricao.status)
            }}>
              {inscricao.status === 'ativa' ? 'Ativa' : 'Cancelada'}
            </span>
          </div>

          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.5rem',
            alignItems: 'flex-end'
          }}>
            <span style={{ 
              fontSize: '0.8rem',
              color: 'var(--text-secondary)'
            }}>
              Inscrito em: {formatarData(inscricao.dataInscricao)}
            </span>
            
            {inscricao.status === 'ativa' && (
              <button
                onClick={() => handleCancelar(inscricao.id)}
                disabled={cancelandoId === inscricao.id}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  cursor: cancelandoId === inscricao.id ? 'not-allowed' : 'pointer',
                  opacity: cancelandoId === inscricao.id ? 0.6 : 1
                }}
              >
                {cancelandoId === inscricao.id ? 'Cancelando...' : 'Cancelar Inscrição'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
