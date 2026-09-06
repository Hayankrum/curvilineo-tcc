'use client'

import { useState } from 'react'
import FormCadastro from '@/modules/cadastro/components/FormCadastro'
import ListaInscricoes from '@/modules/cadastro/components/ListaInscricoes'
import GerenciarCursos from '@/modules/cadastro/components/GerenciarCursos'

interface CadastroPageClientProps {
  usuarioLogado: boolean
  isAdmin: boolean
  usuario: {
    id: number
    nome: string
    tipoUsuario: string
  } | null
}

export default function CadastroPageClient({ 
  usuarioLogado, 
  isAdmin, 
  usuario 
}: CadastroPageClientProps) {
  const [abaAtiva, setAbaAtiva] = useState<'inscrever' | 'inscricoes' | 'gerenciar'>(
    isAdmin ? 'gerenciar' : 'inscrever'
  )

  return (
    <div style={{ 
      minHeight: '100vh',
      padding: '2rem 1rem',
      backgroundColor: 'var(--bg-primary)'
    }}>
      <div style={{ 
        maxWidth: '900px', 
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        <header style={{ textAlign: 'center' }}>
          <h1 style={{ 
            margin: '0 0 0.5rem 0',
            color: 'var(--text-primary)',
            fontSize: '2rem'
          }}>
            Sistema de Cadastro
          </h1>
          <p style={{ 
            margin: 0,
            color: 'var(--text-secondary)',
            fontSize: '1.1rem'
          }}>
            Gerencie sua participação em cursos e turmas
          </p>
        </header>

        {usuarioLogado && usuario && (
          <div style={{
            padding: '1rem 1.5rem',
            backgroundColor: 'var(--card-bg)',
            borderRadius: '12px',
            border: '1px solid var(--input-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <span style={{ 
                color: 'var(--text-secondary)',
                fontSize: '0.9rem'
              }}>
                Olá,{' '}
              </span>
              <span style={{ 
                color: 'var(--text-primary)',
                fontWeight: 600
              }}>
                {usuario.nome}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{
                padding: '0.25rem 0.75rem',
                backgroundColor: 'var(--btn-primary-bg)',
                color: 'var(--btn-primary-text)',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 500,
                textTransform: 'capitalize'
              }}>
                {usuario.tipoUsuario}
              </span>
              {isAdmin && (
                <span style={{
                  padding: '0.25rem 0.75rem',
                  backgroundColor: '#fef3c7',
                  color: '#d97706',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 500
                }}>
                  Admin
                </span>
              )}
            </div>
          </div>
        )}

        {usuarioLogado && (
          <nav style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            borderBottom: '1px solid var(--input-border)',
            paddingBottom: '1rem'
          }}>
            <button
              onClick={() => setAbaAtiva('inscrever')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: abaAtiva === 'inscrever' ? 'var(--btn-primary-bg)' : 'transparent',
                color: abaAtiva === 'inscrever' ? 'var(--btn-primary-text)' : 'var(--text-secondary)',
                border: `1px solid ${abaAtiva === 'inscrever' ? 'var(--btn-primary-bg)' : 'var(--input-border)'}`,
                borderRadius: '8px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Inscrever-se
            </button>
            <button
              onClick={() => setAbaAtiva('inscricoes')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: abaAtiva === 'inscricoes' ? 'var(--btn-primary-bg)' : 'transparent',
                color: abaAtiva === 'inscricoes' ? 'var(--btn-primary-text)' : 'var(--text-secondary)',
                border: `1px solid ${abaAtiva === 'inscricoes' ? 'var(--btn-primary-bg)' : 'var(--input-border)'}`,
                borderRadius: '8px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Minhas Inscrições
            </button>
            {isAdmin && (
              <button
                onClick={() => setAbaAtiva('gerenciar')}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: abaAtiva === 'gerenciar' ? 'var(--btn-primary-bg)' : 'transparent',
                  color: abaAtiva === 'gerenciar' ? 'var(--btn-primary-text)' : 'var(--text-secondary)',
                  border: `1px solid ${abaAtiva === 'gerenciar' ? 'var(--btn-primary-bg)' : 'var(--input-border)'}`,
                  borderRadius: '8px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Gerenciar Cursos
              </button>
            )}
          </nav>
        )}

        <main>
          {abaAtiva === 'inscrever' && (
            <FormCadastro usuarioLogado={usuarioLogado} />
          )}
          
          {abaAtiva === 'inscricoes' && usuarioLogado && (
            <ListaInscricoes />
          )}
          
          {abaAtiva === 'gerenciar' && isAdmin && (
            <GerenciarCursos isAdmin={isAdmin} />
          )}
        </main>

        {!usuarioLogado && (
          <div style={{
            padding: '2rem',
            backgroundColor: 'var(--card-bg)',
            borderRadius: '12px',
            border: '1px solid var(--input-border)',
            textAlign: 'center'
          }}>
            <h2 style={{ 
              margin: '0 0 1rem 0',
              color: 'var(--text-primary)'
            }}>
              Bem-vindo ao Sistema de Cadastro
            </h2>
            <p style={{ 
              margin: '0 0 1.5rem 0',
              color: 'var(--text-secondary)',
              maxWidth: '500px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Para se inscrever em cursos e gerenciar sua participação, 
              faça login ou crie uma conta.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href="/usuarios/login"
                style={{
                  padding: '1rem 2rem',
                  backgroundColor: 'var(--btn-primary-bg)',
                  color: 'var(--btn-primary-text)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 600
                }}
              >
                Entrar
              </a>
              <a
                href="/usuarios/registro"
                style={{
                  padding: '1rem 2rem',
                  backgroundColor: 'transparent',
                  color: 'var(--btn-primary-bg)',
                  border: `2px solid var(--btn-primary-bg)`,
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 600
                }}
              >
                Criar Conta
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
