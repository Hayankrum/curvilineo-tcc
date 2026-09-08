import { obterSessao } from '@/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata = {
  title: 'Painel Admin',
}

export default async function AdminPage() {
  const usuario = await obterSessao()

  if (!usuario || !usuario.isAdmin) {
    redirect('/')
  }

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
            Painel Administrativo
          </h1>
          <p style={{
            margin: 0,
            color: 'var(--text-secondary)',
            fontSize: '1.1rem'
          }}>
            Gerencie questionários e configurações do sistema
          </p>
        </header>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem'
        }}>
          <Link
            href="/usuarios/configuracoes"
            style={{
              padding: '2rem',
              backgroundColor: 'var(--card-bg)',
              borderRadius: '12px',
              border: '1px solid var(--input-border)',
              textDecoration: 'none',
              transition: 'border-color 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '1rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--btn-primary-bg)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--input-border)'
            }}
          >
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: 'var(--input-bg)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem'
            }}>
              👥
            </div>
            <div>
              <h2 style={{
                margin: '0 0 0.5rem 0',
                color: 'var(--text-primary)',
                fontSize: '1.25rem'
              }}>
                Configurações
              </h2>
              <p style={{
                margin: 0,
                color: 'var(--text-secondary)',
                fontSize: '0.9rem'
              }}>
                Gerenciar preferências e configurações do sistema
              </p>
            </div>
          </Link>
        </div>

        <div style={{
          padding: '1.5rem',
          backgroundColor: 'var(--card-bg)',
          borderRadius: '12px',
          border: '1px solid var(--input-border)'
        }}>
          <h3 style={{
            margin: '0 0 1rem 0',
            color: 'var(--text-primary)'
          }}>
            Informações do Sistema
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem'
          }}>
            <p style={{ margin: 0 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Usuário:</strong> {usuario.nome}
            </p>
            <p style={{ margin: 0 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Email:</strong> {usuario.email}
            </p>
            <p style={{ margin: 0 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Tipo:</strong> Administrador
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
