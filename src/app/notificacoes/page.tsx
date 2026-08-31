'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
  const { isSubscribed, isSupported, isLoading, subscribe, unsubscribe } = usePushSubscription()
  const [historico, setHistorico] = useState<NotificacaoHistorico[]>([])
  const [loadingHistorico, setLoadingHistorico] = useState(true)

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

  const handleToggle = async () => {
    if (isSubscribed) {
      const result = await unsubscribe()
      if (!result.success) {
        alert(result.error)
      } else {
        await toggleNotificacoes(false)
      }
    } else {
      const result = await subscribe()
      if (!result.success) {
        alert(result.error || 'Erro ao ativar notificações.')
      } else {
        await toggleNotificacoes(true)
      }
    }
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
  }

  if (isLoading) {
    return (
      <div className="max-w-xl">
        <h1 className="text-2xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Notificações</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Carregando...</p>
      </div>
    )
  }

  if (!isSupported) {
    return (
      <div className="max-w-xl">
        <h1 className="text-2xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Notificações</h1>
        <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Seu navegador não suporta notificações push.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Notificações</h1>

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
                  if (notificacao.url) window.location.href = notificacao.url
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
                {notificacao.url && (
                  <Link
                    href={notificacao.url}
                    className="text-xs transition-colors mt-2 inline-block hover:underline"
                    style={{ color: 'var(--text-tertiary)' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Ver →
                  </Link>
                )}
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
