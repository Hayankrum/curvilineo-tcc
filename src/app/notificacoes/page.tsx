'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePushSubscription } from '@/lib/usePushSubscription'
import { toggleNotificacoes } from '@/modules/usuarios/usuarios.actions'

interface NotificacaoHistorico {
  id: number
  titulo: string
  mensagem: string
  url: string | null
  lida: boolean
  criadaEm: string
}

export default function NotificacoesPage() {
  const router = useRouter()
  const { isSubscribed, isSupported, isLoading, subscribe, unsubscribe } = usePushSubscription()
  const [historico, setHistorico] = useState<NotificacaoHistorico[]>([])
  const [loadingHistorico, setLoadingHistorico] = useState(true)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [excluindo, setExcluindo] = useState<number | null>(null)

  const fetchHistorico = () => {
    fetch('/api/notifications/history')
      .then((res) => res.json())
      .then((data) => {
        setHistorico(data.notificacoes || [])
        setLoadingHistorico(false)
      })
      .catch(() => setLoadingHistorico(false))
  }

  useEffect(() => {
    fetchHistorico()
  }, [])

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text })
    setTimeout(() => setStatusMessage(null), 5000)
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      const result = await unsubscribe()
      if (!result.success) {
        showStatus('error', result.error || 'Erro ao desativar')
      } else {
        await toggleNotificacoes(false)
        showStatus('success', 'Notificações desativadas')
      }
    } else {
      const result = await subscribe()
      if (!result.success) {
        showStatus('error', result.error || 'Erro ao ativar notificações.')
      } else {
        await toggleNotificacoes(true)
        showStatus('success', 'Notificações ativadas!')
      }
    }
  }

  const notificarAtualizacao = () => {
    window.dispatchEvent(new Event('notifications:updated'))
    localStorage.setItem('notifications:updated', String(Date.now()))
  }

  const marcarComoLida = async (id: number) => {
    await fetch('/api/notifications/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setHistorico((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
    )
    notificarAtualizacao()
  }

  const marcarTodasComoLidas = async () => {
    await fetch('/api/notifications/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    })
    setHistorico((prev) =>
      prev.map((n) => ({ ...n, lida: true }))
    )
    notificarAtualizacao()
  }

  const excluirNotificacao = async (id: number) => {
    setExcluindo(id)
    await fetch('/api/notifications/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setHistorico((prev) => prev.filter((n) => n.id !== id))
    notificarAtualizacao()
    setExcluindo(null)
  }

  const excluirTodas = async () => {
    if (!confirm('Tem certeza que deseja excluir todas as notificações?')) return
    await fetch('/api/notifications/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    })
    setHistorico([])
    notificarAtualizacao()
  }

  const totalNaoLidas = historico.filter((n) => !n.lida).length

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Notificações</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Carregando...</p>
      </div>
    )
  }

  if (!isSupported) {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Notificações</h1>
        <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Seu navegador não suporta notificações push.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Notificações</h1>

      {statusMessage && (
        <div
          className="mb-4 p-3 rounded-lg text-sm"
          style={{
            backgroundColor: statusMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: statusMessage.type === 'success' ? '#16a34a' : '#dc2626',
          }}
        >
          {statusMessage.text}
        </div>
      )}

      <div className="rounded-lg p-6 mb-6" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Notificações Push</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Receba notificações push do sistema
            </p>
          </div>
          <button
            onClick={handleToggle}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={isSubscribed ? { backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--text-primary)' } : { backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }}
          >
            {isSubscribed ? 'Desativar' : 'Ativar'}
          </button>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isSubscribed ? 'bg-green-500' : 'bg-zinc-600'}`} />
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {isSubscribed ? 'Notificações ativas' : 'Notificações desativadas'}
          </span>
        </div>
      </div>

      <div className="pt-6" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="font-medium" style={{ color: 'var(--text-primary)' }}>Histórico</h2>
            {totalNaoLidas > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-tertiary)', border: '1px solid var(--card-border)' }}>
                {totalNaoLidas} não lida{totalNaoLidas > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {historico.some((n) => !n.lida) && (
              <button
                onClick={marcarTodasComoLidas}
                className="text-xs transition-colors hover:underline"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Marcar todas como lidas
              </button>
            )}
            {historico.length > 0 && (
              <button
                onClick={excluirTodas}
                className="text-xs transition-colors hover:underline"
                style={{ color: '#dc2626' }}
              >
                Excluir todas
              </button>
            )}
          </div>
        </div>

        {loadingHistorico ? (
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Carregando histórico...</p>
        ) : historico.length === 0 ? (
          <div className="rounded-lg p-6 text-center" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Nenhuma notificação recebida ainda.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {historico.map((notificacao) => (
              <div
                key={notificacao.id}
                className="rounded-lg p-4 transition-colors"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  opacity: notificacao.lida ? 0.7 : 1,
                }}
              >
                <div className="flex items-start gap-3">
                  {!notificacao.lida && (
                    <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: 'var(--text-tertiary)' }} />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                      {notificacao.titulo}
                    </h3>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{notificacao.mensagem}</p>
                    <div className="flex items-center gap-3 mt-2">
                      {notificacao.url && (
                        <Link
                          href={notificacao.url}
                          className="text-xs transition-colors inline-block hover:underline"
                          style={{ color: 'var(--text-tertiary)' }}
                          onClick={() => {
                            if (!notificacao.lida) marcarComoLida(notificacao.id)
                          }}
                        >
                          Ver detalhes →
                        </Link>
                      )}
                      {!notificacao.lida && (
                        <button
                          onClick={() => marcarComoLida(notificacao.id)}
                          className="text-xs transition-colors hover:underline"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
                          Marcar como lida
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {new Date(notificacao.criadaEm).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <button
                      onClick={() => excluirNotificacao(notificacao.id)}
                      disabled={excluindo === notificacao.id}
                      className="p-1 rounded transition-colors hover:bg-red-100 disabled:opacity-50"
                      style={{ color: '#dc2626' }}
                      title="Excluir notificação"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <Link href="/questionarios" className="text-sm transition-colors hover:underline" style={{ color: 'var(--text-tertiary)' }}>
          ← Voltar para questionários
        </Link>
      </div>
    </div>
  )
}
