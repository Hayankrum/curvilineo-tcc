'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  obterSala,
  verificarResponsavelSala,
  adicionarMembroSala,
  removerMembroSala,
  type SalaDetalhada
} from '../salas.actions'

export default function GerenciarMembrosPage() {
  const params = useParams()
  const router = useRouter()
  const salaId = Number(params.id)

  const [sala, setSala] = useState<SalaDetalhada | null>(null)
  const [ehResponsavel, setEhResponsavel] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  const [emailNovoMembro, setEmailNovoMembro] = useState('')
  const [tipoNovoMembro, setTipoNovoMembro] = useState('discente')
  const [adicionando, setAdicionando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)

  useEffect(() => {
    async function carregar() {
      try {
        const [salaDados, responsavel] = await Promise.all([
          obterSala(salaId),
          verificarResponsavelSala(salaId)
        ])

        if ('error' in salaDados) {
          setErro(salaDados.error)
        } else {
          setSala(salaDados)
        }
        setEhResponsavel(responsavel)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        setErro('Erro ao carregar dados da sala')
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [salaId])

  async function handleAdicionarMembro(e: React.FormEvent) {
    e.preventDefault()
    if (!emailNovoMembro.trim()) return

    setAdicionando(true)
    setMensagem(null)

    try {
      const resultado = await adicionarMembroSala(salaId, emailNovoMembro, tipoNovoMembro)
      if ('error' in resultado && resultado.error) {
        setMensagem({ tipo: 'erro', texto: resultado.error })
      } else if ('success' in resultado && resultado.success) {
        setMensagem({ tipo: 'sucesso', texto: resultado.success })
        setEmailNovoMembro('')
        const dadosAtualizados = await obterSala(salaId)
        if (!('error' in dadosAtualizados)) {
          setSala(dadosAtualizados)
        }
      }
    } catch {
      setMensagem({ tipo: 'erro', texto: 'Erro ao adicionar membro' })
    } finally {
      setAdicionando(false)
    }
  }

  async function handleRemoverMembro(usuarioId: number, nome: string) {
    if (!confirm(`Remover ${nome} da sala?`)) return

    try {
      const resultado = await removerMembroSala(salaId, usuarioId)
      if ('error' in resultado && resultado.error) {
        setMensagem({ tipo: 'erro', texto: resultado.error })
      } else if ('success' in resultado && resultado.success) {
        setMensagem({ tipo: 'sucesso', texto: resultado.success })
        const dadosAtualizados = await obterSala(salaId)
        if (!('error' in dadosAtualizados)) {
          setSala(dadosAtualizados)
        }
      }
    } catch {
      setMensagem({ tipo: 'erro', texto: 'Erro ao remover membro' })
    }
  }

  if (carregando) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--text-secondary)'
      }}>
        Carregando...
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
          onClick={() => router.push(`/salas/${salaId}`)}
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
          Voltar para a sala
        </button>
      </div>
    )
  }

  if (!ehResponsavel) {
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
          Acesso Restrito
        </h2>
        <p style={{
          margin: '0 0 1.5rem 0',
          color: 'var(--text-secondary)'
        }}>
          Apenas o responsável pela sala pode gerenciar membros.
        </p>
        <button
          onClick={() => router.push(`/salas/${salaId}`)}
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
          Voltar para a sala
        </button>
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
        <div>
          <h1 style={{
            margin: '0 0 0.25rem 0',
            color: 'var(--text-primary)',
            fontSize: '1.5rem'
          }}>
            Gerenciar Membros
          </h1>
          <p style={{
            margin: 0,
            color: 'var(--text-secondary)',
            fontSize: '0.9rem'
          }}>
            {sala.nome} - {sala.curso.nome}
          </p>
        </div>
        <button
          onClick={() => router.push(`/salas/${salaId}`)}
          style={{
            padding: '0.5rem 1rem',
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
      </div>

      <div style={{
        padding: '1.5rem',
        backgroundColor: 'var(--card-bg)',
        borderRadius: '12px',
        border: '1px solid var(--input-border)'
      }}>
        <h3 style={{
          margin: '0 0 1rem 0',
          color: 'var(--text-primary)',
          fontSize: '1.1rem'
        }}>
          Adicionar Membro
        </h3>
        <form onSubmit={handleAdicionarMembro} style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'flex-end'
        }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem'
            }}>
              Email do usuário
            </label>
            <input
              type="email"
              value={emailNovoMembro}
              onChange={(e) => setEmailNovoMembro(e.target.value)}
              placeholder="usuario@email.com"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--input-border)',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem'
              }}
            />
          </div>
          <div style={{ minWidth: '150px' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem'
            }}>
              Tipo
            </label>
            <select
              value={tipoNovoMembro}
              onChange={(e) => setTipoNovoMembro(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--input-border)',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              <option value="discente">Discente</option>
              <option value="docente">Docente</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={adicionando || !emailNovoMembro.trim()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: adicionando ? 'var(--btn-disabled-bg)' : 'var(--btn-primary-bg)',
              color: adicionando ? 'var(--btn-disabled-text)' : 'var(--btn-primary-text)',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 500,
              cursor: adicionando ? 'not-allowed' : 'pointer'
            }}
          >
            {adicionando ? 'Adicionando...' : 'Adicionar'}
          </button>
        </form>
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

      <div style={{
        padding: '1.5rem',
        backgroundColor: 'var(--card-bg)',
        borderRadius: '12px',
        border: '1px solid var(--input-border)'
      }}>
        <h3 style={{
          margin: '0 0 1rem 0',
          color: 'var(--text-primary)',
          fontSize: '1.1rem'
        }}>
          Membros Atuais ({sala.inscricoes.length})
        </h3>
        {sala.inscricoes.length === 0 ? (
          <p style={{
            margin: 0,
            color: 'var(--text-secondary)',
            textAlign: 'center',
            padding: '2rem'
          }}>
            Nenhum membro nesta sala.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {sala.inscricoes.map((inscricao) => (
              <div
                key={inscricao.id}
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--input-bg)',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--card-bg)',
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
                      {sala.responsavel?.id === inscricao.usuario.id && (
                        <span style={{
                          marginLeft: '0.5rem',
                          padding: '0.15rem 0.5rem',
                          backgroundColor: '#dbeafe',
                          color: '#2563eb',
                          borderRadius: '12px',
                          fontSize: '0.7rem',
                          fontWeight: 500
                        }}>
                          Responsável
                        </span>
                      )}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
                  {sala.responsavel?.id !== inscricao.usuario.id && (
                    <button
                      onClick={() => handleRemoverMembro(inscricao.usuario.id, inscricao.usuario.nome)}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: 'transparent',
                        color: '#dc2626',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                      title="Remover membro"
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
