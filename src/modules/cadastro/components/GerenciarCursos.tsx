'use client'

import { useState, useEffect } from 'react'
import { criarCurso, criarTurma, listarCursos, type CursosDisponiveis } from '../cadastro.actions'

interface GerenciarCursosProps {
  isAdmin: boolean
}

export default function GerenciarCursos({ isAdmin }: GerenciarCursosProps) {
  const [cursos, setCursos] = useState<CursosDisponiveis[]>([])
  const [carregando, setCarregando] = useState(true)
  const [mostrarFormCurso, setMostrarFormCurso] = useState(false)
  const [mostrarFormTurma, setMostrarFormTurma] = useState(false)
  const [cursoSelecionado, setCursoSelecionado] = useState<number | null>(null)

  const [nomeCurso, setNomeCurso] = useState('')
  const [descricaoCurso, setDescricaoCurso] = useState('')
  const [duracaoCurso, setDuracaoCurso] = useState('')

  const [nomeTurma, setNomeTurma] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  const [enviando, setEnviando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)

  useEffect(() => {
    carregarCursos()
  }, [])

  async function carregarCursos() {
    try {
      const dados = await listarCursos()
      setCursos(dados)
    } catch (error) {
      console.error('Erro ao carregar cursos:', error)
    } finally {
      setCarregando(false)
    }
  }

  const handleCriarCurso = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nomeCurso.trim()) return

    setEnviando(true)
    setMensagem(null)

    try {
      const resultado = await criarCurso(
        nomeCurso,
        descricaoCurso || undefined,
        duracaoCurso ? parseInt(duracaoCurso) : undefined
      )

      if (resultado.error) {
        setMensagem({ tipo: 'erro', texto: resultado.error })
      } else {
        setMensagem({ tipo: 'sucesso', texto: 'Curso criado com sucesso!' })
        setNomeCurso('')
        setDescricaoCurso('')
        setDuracaoCurso('')
        setMostrarFormCurso(false)
        await carregarCursos()
      }
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao criar curso' })
    } finally {
      setEnviando(false)
    }
  }

  const handleCriarTurma = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nomeTurma.trim() || !cursoSelecionado || !dataInicio || !dataFim) return

    setEnviando(true)
    setMensagem(null)

    try {
      const resultado = await criarTurma(
        cursoSelecionado,
        nomeTurma,
        dataInicio,
        dataFim
      )

      if (resultado.error) {
        setMensagem({ tipo: 'erro', texto: resultado.error })
      } else {
        setMensagem({ tipo: 'sucesso', texto: 'Turma criada com sucesso!' })
        setNomeTurma('')
        setDataInicio('')
        setDataFim('')
        setMostrarFormTurma(false)
        setCursoSelecionado(null)
        await carregarCursos()
      }
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao criar turma' })
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

  if (!isAdmin) {
    return null
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
        <h3 style={{ 
          margin: 0,
          color: 'var(--text-primary)',
          fontSize: '1.25rem'
        }}>
          Gerenciar Cursos
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => {
              setMostrarFormCurso(!mostrarFormCurso)
              setMostrarFormTurma(false)
            }}
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
            {mostrarFormCurso ? 'Cancelar' : '+ Novo Curso'}
          </button>
          <button
            onClick={() => {
              setMostrarFormTurma(!mostrarFormTurma)
              setMostrarFormCurso(false)
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
            {mostrarFormTurma ? 'Cancelar' : '+ Nova Turma'}
          </button>
        </div>
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

      {mostrarFormCurso && (
        <form onSubmit={handleCriarCurso} style={{
          padding: '1.5rem',
          backgroundColor: 'var(--card-bg)',
          borderRadius: '12px',
          border: '1px solid var(--input-border)'
        }}>
          <h4 style={{ 
            margin: '0 0 1rem 0',
            color: 'var(--text-primary)'
          }}>
            Criar Novo Curso
          </h4>
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
                value={nomeCurso}
                onChange={(e) => setNomeCurso(e.target.value)}
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
                value={descricaoCurso}
                onChange={(e) => setDescricaoCurso(e.target.value)}
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
                value={duracaoCurso}
                onChange={(e) => setDuracaoCurso(e.target.value)}
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
            <button
              type="submit"
              disabled={enviando || !nomeCurso.trim()}
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
              {enviando ? 'Criando...' : 'Criar Curso'}
            </button>
          </div>
        </form>
      )}

      {mostrarFormTurma && (
        <form onSubmit={handleCriarTurma} style={{
          padding: '1.5rem',
          backgroundColor: 'var(--card-bg)',
          borderRadius: '12px',
          border: '1px solid var(--input-border)'
        }}>
          <h4 style={{ 
            margin: '0 0 1rem 0',
            color: 'var(--text-primary)'
          }}>
            Criar Nova Turma
          </h4>
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
                value={cursoSelecionado || ''}
                onChange={(e) => setCursoSelecionado(e.target.value ? parseInt(e.target.value) : null)}
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
                Nome da Turma *
              </label>
              <input
                type="text"
                value={nomeTurma}
                onChange={(e) => setNomeTurma(e.target.value)}
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
            <button
              type="submit"
              disabled={enviando || !nomeTurma.trim() || !cursoSelecionado || !dataInicio || !dataFim}
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
              {enviando ? 'Criando...' : 'Criar Turma'}
            </button>
          </div>
        </form>
      )}

      {cursos.length === 0 ? (
        <div style={{
          padding: '2rem',
          backgroundColor: 'var(--card-bg)',
          borderRadius: '12px',
          border: '1px solid var(--input-border)',
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}>
          Nenhum curso cadastrado. Crie o primeiro curso!
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
                marginBottom: '1rem'
              }}>
                <div>
                  <h4 style={{ 
                    margin: '0 0 0.25rem 0',
                    color: 'var(--text-primary)',
                    fontSize: '1.1rem'
                  }}>
                    {curso.nome}
                  </h4>
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
                {curso.duracao && (
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    backgroundColor: 'var(--input-bg)',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)'
                  }}>
                    {curso.duracao}h
                  </span>
                )}
              </div>

              {curso.turmas.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ 
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 500
                  }}>
                    Turmas:
                  </span>
                  {curso.turmas.map((turma) => (
                    <div
                      key={turma.id}
                      style={{
                        padding: '0.75rem',
                        backgroundColor: 'var(--input-bg)',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{ color: 'var(--text-primary)' }}>
                        {turma.nome}
                      </span>
                      <span style={{ 
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)'
                      }}>
                        {formatarData(turma.dataInicio)} - {formatarData(turma.dataFim)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ 
                  margin: 0,
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  fontStyle: 'italic'
                }}>
                  Nenhuma turma cadastrada
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
