'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { obterSala, verificarResponsavelSala, verificarPeriodoSala, type SalaDetalhada } from '../salas.actions'

export default function SalaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const salaId = Number(params.id)

  const [sala, setSala] = useState<SalaDetalhada | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [ehResponsavel, setEhResponsavel] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState<'questionarios' | 'membros'>('questionarios')
  const [periodoInfo, setPeriodoInfo] = useState<{ dentroDoPeriodo: boolean; dataInicio: Date; dataFim: Date } | null>(null)

  useEffect(() => {
    async function carregar() {
      try {
        const [salaDados, responsavel, periodo] = await Promise.all([
          obterSala(salaId),
          verificarResponsavelSala(salaId),
          verificarPeriodoSala(salaId)
        ])
        if ('error' in salaDados) {
          setErro(salaDados.error)
        } else {
          setSala(salaDados)
        }
        setEhResponsavel(responsavel)
        setPeriodoInfo(periodo)
      } catch (error) {
        console.error('Erro ao carregar sala:', error)
        setErro('Erro ao carregar dados da sala')
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [salaId])

  const formatarData = (data: Date) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatarDataCompleta = (data: Date) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  if (carregando) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--text-secondary)'
      }}>
        Carregando sala...
      </div>
    )
  }

  if (erro || !sala) {
    return (
      <div style={{
        padding: '3rem',
        backgroundColor: 'var(--card-bg)',
        borderRadius: '12px',
        border: '1px solid var(--input-border)',
        textAlign: 'center'
      }}>
        <h2 style={{
          margin: '0 0 1rem 0',
          color: 'var(--text-primary)',
          fontSize: '1.5rem'
        }}>
          {erro || 'Sala não encontrada'}
        </h2>
        <button
          onClick={() => router.push('/salas')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'var(--btn-primary-bg)',
            color: 'var(--btn-primary-text)',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          Voltar para minhas salas
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {periodoInfo && !periodoInfo.dentroDoPeriodo && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          border: '1px solid #fcd34d',
          color: '#92400e'
        }}>
          <strong>Atenção:</strong> Esta sala está fora do período de acesso. 
          O acesso está permitido apenas entre {formatarDataCompleta(periodoInfo.dataInicio)} e {formatarDataCompleta(periodoInfo.dataFim)}.
        </div>
      )}

      <div style={{
        padding: '1.5rem',
        backgroundColor: 'var(--card-bg)',
        borderRadius: '12px',
        border: '1px solid var(--input-border)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{
              margin: '0 0 0.5rem 0',
              color: 'var(--text-primary)',
              fontSize: '1.75rem'
            }}>
              {sala.nome}
            </h1>
            <p style={{
              margin: 0,
              color: 'var(--text-secondary)',
              fontSize: '1.1rem'
            }}>
              {sala.curso.nome}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {ehResponsavel && (
              <button
                onClick={() => router.push(`/salas/${salaId}/membros`)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'var(--btn-secondary-bg)',
                  color: 'var(--btn-secondary-text)',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                Gerenciar Membros
              </button>
            )}
            {sala.responsavel && (
              <div style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--input-bg)',
                borderRadius: '8px',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)'
              }}>
                Responsável: <strong style={{ color: 'var(--text-primary)' }}>{sala.responsavel.nome}</strong>
              </div>
            )}
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '2rem',
          flexWrap: 'wrap',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)'
        }}>
          <div>
            <span style={{ fontWeight: 500 }}>Início:</span>{' '}
            {formatarDataCompleta(sala.dataInicio)}
          </div>
          <div>
            <span style={{ fontWeight: 500 }}>Fim:</span>{' '}
            {formatarDataCompleta(sala.dataFim)}
          </div>
          <div>
            <span style={{ fontWeight: 500 }}>Membros:</span>{' '}
            {sala._count.inscricoes}
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--input-border)',
        paddingBottom: '0.5rem'
      }}>
        <button
          onClick={() => setAbaAtiva('questionarios')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: abaAtiva === 'questionarios' ? 'var(--btn-primary-bg)' : 'transparent',
            color: abaAtiva === 'questionarios' ? 'var(--btn-primary-text)' : 'var(--text-secondary)',
            border: 'none',
            borderRadius: '8px 8px 0 0',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Questionários ({sala.questionarios.length})
        </button>
        <button
          onClick={() => setAbaAtiva('membros')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: abaAtiva === 'membros' ? 'var(--btn-primary-bg)' : 'transparent',
            color: abaAtiva === 'membros' ? 'var(--btn-primary-text)' : 'var(--text-secondary)',
            border: 'none',
            borderRadius: '8px 8px 0 0',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Membros ({sala.inscricoes.length})
        </button>
      </div>

      {abaAtiva === 'questionarios' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sala.questionarios.length === 0 ? (
            <div style={{
              padding: '2rem',
              backgroundColor: 'var(--card-bg)',
              borderRadius: '12px',
              border: '1px solid var(--input-border)',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              Nenhum questionário disponível nesta sala.
            </div>
          ) : (
            sala.questionarios.map((questionario) => (
              <div
                key={questionario.id}
                onClick={() => router.push(`/questionarios/${questionario.id}`)}
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--card-bg)',
                  borderRadius: '12px',
                  border: '1px solid var(--input-border)',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--btn-primary-bg)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--input-border)'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.5rem'
                }}>
                  <h3 style={{
                    margin: 0,
                    color: 'var(--text-primary)',
                    fontSize: '1.1rem'
                  }}>
                    {questionario.titulo}
                  </h3>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    backgroundColor: questionario.status === 'publicado' ? '#d1fae5' : '#fee2e2',
                    color: questionario.status === 'publicado' ? '#059669' : '#dc2626',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 500
                  }}>
                    {questionario.status === 'publicado' ? 'Ativo' : 'Encerrado'}
                  </span>
                </div>
                {questionario.descricao && (
                  <p style={{
                    margin: '0 0 0.5rem 0',
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem'
                  }}>
                    {questionario.descricao}
                  </p>
                )}
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)'
                }}>
                  <span>📝 {questionario._count.respostas} resposta(s)</span>
                  <span>📅 {formatarData(questionario.criadoEm)}</span>
                  {questionario.encerraEm && (
                    <span>⏰ Encerra: {formatarData(questionario.encerraEm)}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {abaAtiva === 'membros' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sala.inscricoes.length === 0 ? (
            <div style={{
              padding: '2rem',
              backgroundColor: 'var(--card-bg)',
              borderRadius: '12px',
              border: '1px solid var(--input-border)',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              Nenhum membro nesta sala.
            </div>
          ) : (
            sala.inscricoes.map((inscricao) => (
              <div
                key={inscricao.id}
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--card-bg)',
                  borderRadius: '8px',
                  border: '1px solid var(--input-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--input-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)'
                  }}>
                    {inscricao.usuario.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{
                      margin: 0,
                      color: 'var(--text-primary)',
                      fontWeight: 500
                    }}>
                      {inscricao.usuario.nome}
                    </p>
                    <p style={{
                      margin: 0,
                      color: 'var(--text-secondary)',
                      fontSize: '0.85rem'
                    }}>
                      {inscricao.usuario.email}
                    </p>
                  </div>
                </div>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  backgroundColor: inscricao.tipoUsuario === 'docente' ? '#dbeafe' : 'var(--input-bg)',
                  color: inscricao.tipoUsuario === 'docente' ? '#2563eb' : 'var(--text-secondary)',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  textTransform: 'capitalize'
                }}>
                  {inscricao.tipoUsuario}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
