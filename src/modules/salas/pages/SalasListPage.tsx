'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { listarSalasDoUsuario, type SalaComInfo } from '../salas.actions'

export default function SalasListPage() {
  const [salas, setSalas] = useState<SalaComInfo[]>([])
  const [carregando, setCarregando] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await listarSalasDoUsuario()
        setSalas(dados)
      } catch (error) {
        console.error('Erro ao carregar salas:', error)
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

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
        Carregando suas salas...
      </div>
    )
  }

  if (salas.length === 0) {
    return (
      <div style={{
        padding: '3rem',
        backgroundColor: 'var(--card-bg)',
        borderRadius: '12px',
        border: '1px solid var(--input-border)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          margin: '0 auto 1.5rem',
          backgroundColor: 'var(--input-bg)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-secondary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <h2 style={{
          margin: '0 0 1rem 0',
          color: 'var(--text-primary)',
          fontSize: '1.5rem'
        }}>
          Nenhuma sala encontrada
        </h2>
        <p style={{
          margin: '0 0 1.5rem 0',
          color: 'var(--text-secondary)',
          maxWidth: '400px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          Você ainda não participa de nenhuma sala. Inscreva-se em um curso para ter acesso às salas disponíveis.
        </p>
        <a
          href="/cadastro"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            backgroundColor: 'var(--btn-primary-bg)',
            color: 'var(--btn-primary-text)',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 500
          }}
        >
          Inscrever-se em um curso
        </a>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {salas.map((sala) => (
        <div
          key={sala.id}
          onClick={() => router.push(`/salas/${sala.id}`)}
          style={{
            padding: '1.5rem',
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
            marginBottom: '0.75rem'
          }}>
            <div>
              <h3 style={{
                margin: '0 0 0.25rem 0',
                color: 'var(--text-primary)',
                fontSize: '1.25rem'
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
            {sala.responsavel && (
              <span style={{
                padding: '0.25rem 0.75rem',
                backgroundColor: 'var(--input-bg)',
                borderRadius: '20px',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)'
              }}>
                Responsável: {sala.responsavel.nome}
              </span>
            )}
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
          </div>
        </div>
      ))}
    </div>
  )
}
