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
              Receba notificações quando alguém comentar nos seus posts
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
          <h2 className="font-medium" style={{ color: 'var(--text-primary)' }}>Histórico</h2>
          {historico.some((n) => !n.lida) && (
            <button
              onClick={marcarTodasComoLidas}
              className="text-xs transition-colors hover:underline"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Marcar todas como lidas
            </button>
          )}
        </div>

        {loadingHistorico ? (
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Carregando histórico...</p>
        ) : historico.length === 0 ? (
          <div className="rounded-lg p-6 text-center" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Nenhuma notificação recebida ainda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {historico.map((notificacao) => (
              <div
                key={notificacao.id}
                className="rounded-lg p-4 cursor-pointer transition-colors"
                style={{ backgroundColor: 'var(--card-bg)', border: `1px solid ${notificacao.lida ? 'var(--card-border)' : 'var(--border-color)'}` }}
                onClick={() => {
                  if (!notificacao.lida) marcarComoLida(notificacao.id)
                  if (notificacao.url) router.push(notificacao.url)
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {!notificacao.lida && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                      )}
                      <h3 className="font-medium text-sm" style={{ color: notificacao.lida ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                        {notificacao.titulo}
                      </h3>
                    </div>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{notificacao.mensagem}</p>
                  </div>
                  <span className="text-xs ml-4 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                    {new Date(notificacao.criadaEm).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  {notificacao.url && (
                    <Link
                      href={notificacao.url}
                      className="text-xs transition-colors inline-block hover:underline"
                      style={{ color: 'var(--text-tertiary)' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Ver →
                    </Link>
                  )}
                  {!notificacao.lida && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        marcarComoLida(notificacao.id)
                      }}
                      className="text-xs transition-colors hover:underline"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      Marcar como lida
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <Link href="/posts" className="text-sm transition-colors hover:underline" style={{ color: 'var(--text-tertiary)' }}>
          ← Voltar para os posts
        </Link>
      </div>
    </div>
  )
}
