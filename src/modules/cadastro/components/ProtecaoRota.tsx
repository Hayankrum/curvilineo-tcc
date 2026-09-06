'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { verificarPermissao } from '../cadastro.actions'

interface ProtecaoRotaProps {
  feature: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function ProtecaoRota({ feature, children, fallback }: ProtecaoRotaProps) {
  const [temPermissao, setTemPermissao] = useState<boolean | null>(null)
  const [carregando, setCarregando] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function verificar() {
      try {
        const resultado = await verificarPermissao(feature)
        setTemPermissao(resultado)
      } catch (error) {
        console.error('Erro ao verificar permissão:', error)
        setTemPermissao(false)
      } finally {
        setCarregando(false)
      }
    }
    verificar()
  }, [feature])

  if (carregando) {
    return (
      <div style={{ 
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--text-secondary)'
      }}>
        Verificando permissões...
      </div>
    )
  }

  if (!temPermissao) {
    if (fallback) {
      return <>{fallback}</>
    }

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
          backgroundColor: '#fee2e2',
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
            stroke="#dc2626" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h2 style={{ 
          margin: '0 0 1rem 0',
          color: 'var(--text-primary)',
          fontSize: '1.5rem'
        }}>
          Acesso Restrito
        </h2>
        <p style={{ 
          margin: '0 0 1.5rem 0',
          color: 'var(--text-secondary)',
          maxWidth: '400px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          Você não tem permissão para acessar esta funcionalidade. 
          Entre em contato com o administrador se necessário.
        </p>
        <button
          onClick={() => router.back()}
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
          Voltar
        </button>
      </div>
    )
  }

  return <>{children}</>
}
