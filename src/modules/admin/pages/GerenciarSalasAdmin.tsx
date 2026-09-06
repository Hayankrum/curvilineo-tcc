'use client'

import { useState, useEffect } from 'react'
import {
  listarSalasAdmin,
  obterSalaAdmin,
  criarSalaAdmin,
  atualizarSalaAdmin,
  excluirSalaAdmin,
  listarCursosParaSelect,
  listarUsuariosParaResponsavel,
  type SalaAdmin,
  type SalaDetalhadaAdmin
} from '../admin.actions'

interface CursoSelect {
  id: number
  nome: string
  anosDisponiveis: number[]
}

interface UsuarioSelect {
  id: number
  nome: string
  email: string
  tipoUsuario: string
}

export default function GerenciarSalasAdmin() {
  const [salas, setSalas] = useState<SalaAdmin[]>([])
  const [cursos, setCursos] = useState<CursoSelect[]>([])
  const [usuarios, setUsuarios] = useState<UsuarioSelect[]>([])
  const [carregando, setCarregando] = useState(true)
  const [modo, setModo] = useState<'lista' | 'criar' | 'editar' | 'detalhe'>('lista')
  const [salaSelecionada, setSalaSelecionada] = useState<SalaDetalhadaAdmin | null>(null)

  const [cursoId, setCursoId] = useState<number | null>(null)
  const [nome, setNome] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [responsavelId, setResponsavelId] = useState<number | null>(null)

  const [enviando, setEnviando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    try {
      const [salasDados, cursosDados, usuariosDados] = await Promise.all([
        listarSalasAdmin(),
        listarCursosParaSelect(),
        listarUsuariosParaResponsavel()
      ])
      setSalas(salasDados)
      setCursos(cursosDados)
      setUsuarios(usuariosDados)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setCarregando(false)
    }
  }

  function limparFormulario() {
    setCursoId(null)
    setNome('')
    setDataInicio('')
    setDataFim('')
    setResponsavelId(null)
  }

  function handleCriar() {
    limparFormulario()
    setModo('criar')
    setMensagem(null)
  }

  async function handleEditar(salaId: number) {
    setMensagem(null)
    try {
      const dados = await obterSalaAdmin(salaId)
      if ('error' in dados) {
        setMensagem({ tipo: 'erro', texto: dados.error })
        return
      }
      setSalaSelecionada(dados)
      setCursoId(dados.curso.id)
      setNome(dados.nome)
      setDataInicio(new Date(dados.dataInicio).toISOString().split('T')[0])
      setDataFim(new Date(dados.dataFim).toISOString().split('T')[0])
      setResponsavelId(dados.responsavel?.id || null)
      setModo('editar')
    } catch {
      setMensagem({ tipo: 'erro', texto: 'Erro ao carregar sala' })
    }
  }

  async function handleDetalhe(salaId: number) {
    setMensagem(null)
    try {
      const dados = await obterSalaAdmin(salaId)
      if ('error' in dados) {
        setMensagem({ tipo: 'erro', texto: dados.error })
        return
      }
      setSalaSelecionada(dados)
      setModo('detalhe')
    } catch {
      setMensagem({ tipo: 'erro', texto: 'Erro ao carregar sala' })
    }
  }

  async function handleExcluir(salaId: number, nomeSala: string) {
    if (!confirm(`Tem certeza que deseja excluir a sala "${nomeSala}"?`)) return

    setMensagem(null)
    try {
      const resultado = await excluirSalaAdmin(salaId)
      if ('error' in resultado && resultado.error) {
        setMensagem({ tipo: 'erro', texto: resultado.error })
      } else if ('success' in resultado && resultado.success) {
        setMensagem({ tipo: 'sucesso', texto: resultado.success })
        await carregarDados()
      }
    } catch {
      setMensagem({ tipo: 'erro', texto: 'Erro ao excluir sala' })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!cursoId || !nome.trim() || !dataInicio || !dataFim) return

    setEnviando(true)
    setMensagem(null)

    try {
      let resultado
      if (modo === 'criar') {
        resultado = await criarSalaAdmin(cursoId, nome, dataInicio, dataFim, responsavelId)
      } else if (modo === 'editar' && salaSelecionada) {
        resultado = await atualizarSalaAdmin(salaSelecionada.id, nome, dataInicio, dataFim, responsavelId)
      }

      if (resultado && 'error' in resultado && resultado.error) {
        setMensagem({ tipo: 'erro', texto: resultado.error })
      } else if (resultado && 'success' in resultado && resultado.success) {
        setMensagem({ tipo: 'sucesso', texto: resultado.success })
        setModo('lista')
        limparFormulario()
        await carregarDados()
      }
    } catch {
      setMensagem({ tipo: 'erro', texto: 'Erro ao salvar sala' })
    } finally {
      setEnviando(false)
    }
  }

  const formatarData = (data: Date) => {
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
        Carregando salas...
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
          {modo === 'lista' ? 'Gerenciar Salas' :
           modo === 'criar' ? 'Criar Nova Sala' :
           modo === 'editar' ? 'Editar Sala' : 'Detalhes da Sala'}
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
            + Nova Sala
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
                Curso *
              </label>
              <select
                value={cursoId || ''}
                onChange={(e) => setCursoId(e.target.value ? parseInt(e.target.value) : null)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--input-border)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                <option value="">Selecione um curso...</option>
                {cursos.map((curso) => (
                  <option key={curso.id} value={curso.id}>
                    {curso.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--text-primary)',
                fontWeight: 500
              }}>
                Nome da Sala *
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                placeholder="Ex: Turma 2024.1"
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
                  Data de Início *
                </label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
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
                  Data de Fim *
                </label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  required
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
                Responsável
              </label>
              <select
                value={responsavelId || ''}
                onChange={(e) => setResponsavelId(e.target.value ? parseInt(e.target.value) : null)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--input-border)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                <option value="">Nenhum responsável</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nome} ({usuario.email})
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={enviando || !cursoId || !nome.trim() || !dataInicio || !dataFim}
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
              {enviando ? 'Salvando...' : modo === 'criar' ? 'Criar Sala' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      )}

      {modo === 'detalhe' && salaSelecionada && (
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
              {salaSelecionada.nome}
            </h3>
            <p style={{
              margin: 0,
              color: 'var(--text-secondary)'
            }}>
              Curso: {salaSelecionada.curso.nome}
            </p>
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
                Período
              </span>
              <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-primary)', fontWeight: 500 }}>
                {formatarData(salaSelecionada.dataInicio)} - {formatarData(salaSelecionada.dataFim)}
              </p>
            </div>
            <div style={{
              padding: '1rem',
              backgroundColor: 'var(--input-bg)',
              borderRadius: '8px'
            }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Membros
              </span>
              <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-primary)', fontWeight: 500 }}>
                {salaSelecionada._count.inscricoes}
              </p>
            </div>
            <div style={{
              padding: '1rem',
              backgroundColor: 'var(--input-bg)',
              borderRadius: '8px'
            }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Questionários
              </span>
              <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-primary)', fontWeight: 500 }}>
                {salaSelecionada._count.questionarios}
              </p>
            </div>
            <div style={{
              padding: '1rem',
              backgroundColor: 'var(--input-bg)',
              borderRadius: '8px'
            }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Responsável
              </span>
              <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-primary)', fontWeight: 500 }}>
                {salaSelecionada.responsavel?.nome || 'Não definido'}
              </p>
            </div>
          </div>

          {salaSelecionada.inscricoes.length > 0 && (
            <div>
              <h4 style={{
                margin: '0 0 1rem 0',
                color: 'var(--text-primary)'
              }}>
                Membros ({salaSelecionada.inscricoes.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {salaSelecionada.inscricoes.map((inscricao) => (
                  <div
                    key={inscricao.id}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: 'var(--input-bg)',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {inscricao.usuario.nome}
                      </span>
                      <span style={{
                        marginLeft: '0.5rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem'
                      }}>
                        {inscricao.usuario.email}
                      </span>
                    </div>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: inscricao.tipoUsuario === 'docente' ? '#dbeafe' : 'var(--card-bg)',
                      color: inscricao.tipoUsuario === 'docente' ? '#2563eb' : 'var(--text-secondary)',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      textTransform: 'capitalize'
                    }}>
                      {inscricao.tipoUsuario}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {modo === 'lista' && (
        <>
          {salas.length === 0 ? (
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
                Nenhuma sala cadastrada
              </h3>
              <p style={{
                margin: '0 0 1.5rem 0',
                color: 'var(--text-secondary)'
              }}>
                Crie a primeira sala para começar.
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
                + Criar Primeira Sala
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {salas.map((sala) => (
                <div
                  key={sala.id}
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
                        {sala.nome}
                      </h3>
                      <p style={{
                        margin: 0,
                        color: 'var(--text-secondary)',
                        fontSize: '0.9rem'
                      }}>
                        {sala.curso.nome}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleDetalhe(sala.id)}
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
                        onClick={() => handleEditar(sala.id)}
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
                        onClick={() => handleExcluir(sala.id, sala.nome)}
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
                    <span>
                      📅 {formatarData(sala.dataInicio)} - {formatarData(sala.dataFim)}
                    </span>
                    <span>
                      👥 {sala._count.inscricoes} membro{sala._count.inscricoes !== 1 ? 's' : ''}
                    </span>
                    <span>
                      📋 {sala._count.questionarios} questionário{sala._count.questionarios !== 1 ? 's' : ''}
                    </span>
                    {sala.responsavel && (
                      <span>
                        👨‍🏫 {sala.responsavel.nome}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
