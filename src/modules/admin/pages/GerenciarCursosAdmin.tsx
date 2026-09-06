'use client'

import { useState, useEffect } from 'react'
import {
  listarCursosAdmin,
  obterCursoAdmin,
  criarCursoAdmin,
  atualizarCursoAdmin,
  excluirCursoAdmin,
  type CursoAdmin,
  type CursoDetalhado
} from '../admin.actions'

export default function GerenciarCursosAdmin() {
  const [cursos, setCursos] = useState<CursoAdmin[]>([])
  const [carregando, setCarregando] = useState(true)
  const [modo, setModo] = useState<'lista' | 'criar' | 'editar' | 'detalhe'>('lista')
  const [cursoSelecionado, setCursoSelecionado] = useState<CursoDetalhado | null>(null)

  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [duracao, setDuracao] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [anosDisponiveis, setAnosDisponiveis] = useState<number[]>([])
  const [novoAno, setNovoAno] = useState('')

  const [enviando, setEnviando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)

  useEffect(() => {
    carregarCursos()
  }, [])

  async function carregarCursos() {
    try {
      const dados = await listarCursosAdmin()
      setCursos(dados)
    } catch (error) {
      console.error('Erro ao carregar cursos:', error)
    } finally {
      setCarregando(false)
    }
  }

  function limparFormulario() {
    setNome('')
    setDescricao('')
    setDuracao('')
    setDataInicio('')
    setDataFim('')
    setAnosDisponiveis([])
    setNovoAno('')
  }

  function handleCriar() {
    limparFormulario()
    setModo('criar')
    setMensagem(null)
  }

  async function handleEditar(cursoId: number) {
    setMensagem(null)
    try {
      const dados = await obterCursoAdmin(cursoId)
      if ('error' in dados) {
        setMensagem({ tipo: 'erro', texto: dados.error })
        return
      }
      setCursoSelecionado(dados)
      setNome(dados.nome)
      setDescricao(dados.descricao || '')
      setDuracao(dados.duracao?.toString() || '')
      setDataInicio(dados.dataInicio ? new Date(dados.dataInicio).toISOString().split('T')[0] : '')
      setDataFim(dados.dataFim ? new Date(dados.dataFim).toISOString().split('T')[0] : '')
      setAnosDisponiveis(dados.anosDisponiveis || [])
      setModo('editar')
    } catch {
      setMensagem({ tipo: 'erro', texto: 'Erro ao carregar curso' })
    }
  }

  async function handleDetalhe(cursoId: number) {
    setMensagem(null)
    try {
      const dados = await obterCursoAdmin(cursoId)
      if ('error' in dados) {
        setMensagem({ tipo: 'erro', texto: dados.error })
        return
      }
      setCursoSelecionado(dados)
      setModo('detalhe')
    } catch {
      setMensagem({ tipo: 'erro', texto: 'Erro ao carregar curso' })
    }
  }

  async function handleExcluir(cursoId: number, nomeCurso: string) {
    if (!confirm(`Tem certeza que deseja excluir o curso "${nomeCurso}"?`)) return

    setMensagem(null)
    try {
      const resultado = await excluirCursoAdmin(cursoId)
      if ('error' in resultado && resultado.error) {
        setMensagem({ tipo: 'erro', texto: resultado.error })
      } else if ('success' in resultado && resultado.success) {
        setMensagem({ tipo: 'sucesso', texto: resultado.success })
        await carregarCursos()
      }
    } catch {
      setMensagem({ tipo: 'erro', texto: 'Erro ao excluir curso' })
    }
  }

  function adicionarAno() {
    const ano = parseInt(novoAno)
    if (ano && !anosDisponiveis.includes(ano)) {
      setAnosDisponiveis([...anosDisponiveis, ano].sort((a, b) => b - a))
      setNovoAno('')
    }
  }

  function removerAno(ano: number) {
    setAnosDisponiveis(anosDisponiveis.filter(a => a !== ano))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) return

    setEnviando(true)
    setMensagem(null)

    try {
      let resultado
      if (modo === 'criar') {
        resultado = await criarCursoAdmin(
          nome,
          descricao || undefined,
          duracao ? parseInt(duracao) : undefined,
          dataInicio || null,
          dataFim || null,
          anosDisponiveis
        )
      } else if (modo === 'editar' && cursoSelecionado) {
        resultado = await atualizarCursoAdmin(
          cursoSelecionado.id,
          nome,
          descricao || undefined,
          duracao ? parseInt(duracao) : undefined,
          dataInicio || null,
          dataFim || null,
          anosDisponiveis
        )
      }

      if (resultado && 'error' in resultado && resultado.error) {
        setMensagem({ tipo: 'erro', texto: resultado.error })
      } else if (resultado && 'success' in resultado && resultado.success) {
        setMensagem({ tipo: 'sucesso', texto: resultado.success })
        setModo('lista')
        limparFormulario()
        await carregarCursos()
      }
    } catch {
      setMensagem({ tipo: 'erro', texto: 'Erro ao salvar curso' })
    } finally {
      setEnviando(false)
    }
  }

  const formatarData = (data: Date | null) => {
    if (!data) return '-'
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
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
        Carregando cursos...
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h2 style={{
          margin: 0,
          color: 'var(--text-primary)',
          fontSize: '1.5rem'
        }}>
          {modo === 'lista' ? 'Gerenciar Cursos' :
           modo === 'criar' ? 'Criar Novo Curso' :
           modo === 'editar' ? 'Editar Curso' : 'Detalhes do Curso'}
        </h2>
        {modo === 'lista' && (
          <button
            onClick={handleCriar}
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
            + Novo Curso
          </button>
        )}
        {modo !== 'lista' && (
          <button
            onClick={() => {
              setModo('lista')
              limparFormulario()
              setMensagem(null)
            }}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--btn-secondary-bg)',
              color: 'var(--btn-secondary-text)',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Voltar
          </button>
        )}
      </div>

      {mensagem && (
        <div style={{
          padding: '1rem',
          backgroundColor: mensagem.tipo === 'sucesso' ? '#d1fae5' : '#fee2e2',
          color: mensagem.tipo === 'sucesso' ? '#059669' : '#dc2626',
          borderRadius: '8px',
          fontSize: '0.9rem'
        }}>
          {mensagem.texto}
        </div>
      )}

      {(modo === 'criar' || modo === 'editar') && (
        <form onSubmit={handleSubmit} style={{
          padding: '1.5rem',
          backgroundColor: 'var(--card-bg)',
          borderRadius: '12px',
          border: '1px solid var(--input-border)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--text-primary)',
                fontWeight: 500
              }}>
                Nome do Curso *
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--input-border)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--text-primary)',
                fontWeight: 500
              }}>
                Descrição
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--input-border)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--text-primary)',
                fontWeight: 500
              }}>
                Duração (em horas)
              </label>
              <input
                type="number"
                value={duracao}
                onChange={(e) => setDuracao(e.target.value)}
                min="1"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--input-border)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: 'var(--text-primary)',
                  fontWeight: 500
                }}>
                  Data de Início
                </label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--input-border)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: 'var(--text-primary)',
                  fontWeight: 500
                }}>
                  Data de Fim
                </label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  min={dataInicio}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--input-border)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--text-primary)',
                fontWeight: 500
              }}>
                Anos Disponíveis para Inscrição
              </label>
              <p style={{
                margin: '0 0 0.5rem 0',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)'
              }}>
                Configure os anos em que os alunos poderão se inscrever neste curso.
              </p>
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                flexWrap: 'wrap'
              }}>
                <input
                  type="number"
                  value={novoAno}
                  onChange={(e) => setNovoAno(e.target.value)}
                  placeholder="Ex: 2024"
                  min="2000"
                  max="2100"
                  style={{
                    width: '120px',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    border: '1px solid var(--input-border)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem'
                  }}
                />
                <button
                  type="button"
                  onClick={adicionarAno}
                  disabled={!novoAno || anosDisponiveis.includes(parseInt(novoAno))}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'var(--btn-secondary-bg)',
                    color: 'var(--btn-secondary-text)',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    cursor: novoAno && !anosDisponiveis.includes(parseInt(novoAno)) ? 'pointer' : 'not-allowed'
                  }}
                >
                  Adicionar
                </button>
              </div>
              {anosDisponiveis.length > 0 && (
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap'
                }}>
                  {anosDisponiveis.map((ano) => (
                    <span
                      key={ano}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        backgroundColor: 'var(--btn-primary-bg)',
                        color: 'var(--btn-primary-text)',
                        borderRadius: '20px',
                        fontSize: '0.85rem'
                      }}
                    >
                      {ano}
                      <button
                        type="button"
                        onClick={() => removerAno(ano)}
                        style={{
                          backgroundColor: 'transparent',
                          color: 'inherit',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          fontSize: '1rem',
                          lineHeight: 1,
                          opacity: 0.7
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {anosDisponiveis.length === 0 && (
                <p style={{
                  margin: 0,
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  fontStyle: 'italic'
                }}>
                  Nenhum ano configurado. Adicione anos para permitir inscrições.
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={enviando || !nome.trim()}
              style={{
                padding: '1rem',
                backgroundColor: enviando ? 'var(--btn-disabled-bg)' : 'var(--btn-primary-bg)',
                color: enviando ? 'var(--btn-disabled-text)' : 'var(--btn-primary-text)',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: enviando ? 'not-allowed' : 'pointer'
              }}
            >
              {enviando ? 'Salvando...' : modo === 'criar' ? 'Criar Curso' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      )}

      {modo === 'detalhe' && cursoSelecionado && (
        <div style={{
          padding: '1.5rem',
          backgroundColor: 'var(--card-bg)',
          borderRadius: '12px',
          border: '1px solid var(--input-border)'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{
              margin: '0 0 0.5rem 0',
              color: 'var(--text-primary)',
              fontSize: '1.25rem'
            }}>
              {cursoSelecionado.nome}
            </h3>
            {cursoSelecionado.descricao && (
              <p style={{
                margin: 0,
                color: 'var(--text-secondary)'
              }}>
                {cursoSelecionado.descricao}
              </p>
            )}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              padding: '1rem',
              backgroundColor: 'var(--input-bg)',
              borderRadius: '8px'
            }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Duração
              </span>
              <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-primary)', fontWeight: 500 }}>
                {cursoSelecionado.duracao ? `${cursoSelecionado.duracao}h` : '-'}
              </p>
            </div>
            <div style={{
              padding: '1rem',
              backgroundColor: 'var(--input-bg)',
              borderRadius: '8px'
            }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Período
              </span>
              <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-primary)', fontWeight: 500 }}>
                {formatarData(cursoSelecionado.dataInicio)} - {formatarData(cursoSelecionado.dataFim)}
              </p>
            </div>
            <div style={{
              padding: '1rem',
              backgroundColor: 'var(--input-bg)',
              borderRadius: '8px'
            }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Turmas
              </span>
              <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-primary)', fontWeight: 500 }}>
                {cursoSelecionado._count.turmas}
              </p>
            </div>
          </div>

          {cursoSelecionado.anosDisponiveis && cursoSelecionado.anosDisponiveis.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{
                margin: '0 0 0.5rem 0',
                color: 'var(--text-primary)'
              }}>
                Anos Disponíveis
              </h4>
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap'
              }}>
                {cursoSelecionado.anosDisponiveis.map((ano) => (
                  <span
                    key={ano}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: 'var(--btn-primary-bg)',
                      color: 'var(--btn-primary-text)',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 500
                    }}
                  >
                    {ano}
                  </span>
                ))}
              </div>
            </div>
          )}

          {cursoSelecionado.turmas.length > 0 && (
            <div>
              <h4 style={{
                margin: '0 0 1rem 0',
                color: 'var(--text-primary)'
              }}>
                Turmas ({cursoSelecionado.turmas.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {cursoSelecionado.turmas.map((turma) => (
                  <div
                    key={turma.id}
                    style={{
                      padding: '1rem',
                      backgroundColor: 'var(--input-bg)',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {turma.nome}
                      </span>
                      <span style={{
                        marginLeft: '0.5rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem'
                      }}>
                        {formatarData(turma.dataInicio)} - {formatarData(turma.dataFim)}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)'
                    }}>
                      {turma.responsavel && (
                        <span>👨‍🏫 {turma.responsavel.nome}</span>
                      )}
                      <span>👥 {turma._count.inscricoes}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {modo === 'lista' && (
        <>
          {cursos.length === 0 ? (
            <div style={{
              padding: '3rem',
              backgroundColor: 'var(--card-bg)',
              borderRadius: '12px',
              border: '1px solid var(--input-border)',
              textAlign: 'center'
            }}>
              <h3 style={{
                margin: '0 0 1rem 0',
                color: 'var(--text-primary)'
              }}>
                Nenhum curso cadastrado
              </h3>
              <p style={{
                margin: '0 0 1.5rem 0',
                color: 'var(--text-secondary)'
              }}>
                Crie o primeiro curso para começar.
              </p>
              <button
                onClick={handleCriar}
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
                + Criar Primeiro Curso
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cursos.map((curso) => (
                <div
                  key={curso.id}
                  style={{
                    padding: '1.5rem',
                    backgroundColor: 'var(--card-bg)',
                    borderRadius: '12px',
                    border: '1px solid var(--input-border)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <div>
                      <h3 style={{
                        margin: '0 0 0.25rem 0',
                        color: 'var(--text-primary)',
                        fontSize: '1.1rem'
                      }}>
                        {curso.nome}
                      </h3>
                      {curso.descricao && (
                        <p style={{
                          margin: 0,
                          color: 'var(--text-secondary)',
                          fontSize: '0.9rem'
                        }}>
                          {curso.descricao}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleDetalhe(curso.id)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: 'var(--btn-secondary-bg)',
                          color: 'var(--btn-secondary-text)',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => handleEditar(curso.id)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: 'var(--btn-primary-bg)',
                          color: 'var(--btn-primary-text)',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleExcluir(curso.id, curso.nome)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '1.5rem',
                    flexWrap: 'wrap',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)'
                  }}>
                    {curso.duracao && (
                      <span>⏱️ {curso.duracao}h</span>
                    )}
                    {curso.dataInicio && (
                      <span>📅 {formatarData(curso.dataInicio)}</span>
                    )}
                    {curso.dataFim && (
                      <span>📅 {formatarData(curso.dataFim)}</span>
                    )}
                    <span>📚 {curso._count.turmas} turma{curso._count.turmas !== 1 ? 's' : ''}</span>
                  </div>

                  {curso.anosDisponiveis && curso.anosDisponiveis.length > 0 && (
                    <div style={{
                      marginTop: '0.75rem',
                      display: 'flex',
                      gap: '0.5rem',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)'
                      }}>
                        Anos:
                      </span>
                      {curso.anosDisponiveis.map((ano) => (
                        <span
                          key={ano}
                          style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: 'var(--input-bg)',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            color: 'var(--text-primary)'
                          }}
                        >
                          {ano}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
