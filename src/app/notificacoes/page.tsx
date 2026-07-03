'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePushSubscription } from '@/lib/usePushSubscription'

interface NotificacaoHistorico {
  id: number
  titulo: string
  mensagem: string
  url: string | null
  criadaEm: string
}

export default function NotificacoesPage() {
  const { isSubscribed, isSupported, isLoading, subscribe, unsubscribe } = usePushSubscription()
  const [historico, setHistorico] = useState<NotificacaoHistorico[]>([])
  const [loadingHistorico, setLoadingHistorico] = useState(true)

  useEffect(() => {
    fetch('/api/notifications/history')
      .then((res) => res.json())
      .then((data) => {
        setHistorico(data.notificacoes || [])
        setLoadingHistorico(false)
      })
      .catch(() => setLoadingHistorico(false))
  }, [])

  const handleToggle = async () => {
    if (isSubscribed) {
      const result = await unsubscribe()
      if (!result.success) alert(result.error)
    } else {
      const result = await subscribe()
      if (!result.success) alert(result.error || 'Erro ao ativar notificações.')
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-xl">
        <h1 className="text-2xl font-semibold mb-6">Notificações</h1>
        <p className="text-zinc-400">Carregando...</p>
      </div>
    )
  }

  if (!isSupported) {
    return (
      <div className="max-w-xl">
        <h1 className="text-2xl font-semibold mb-6">Notificações</h1>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <p className="text-zinc-400">Seu navegador não suporta notificações push.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-6">Notificações</h1>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-medium mb-1">Notificações Push</h2>
            <p className="text-sm text-zinc-400">
              Receba notificações quando alguém comentar nos seus posts
            </p>
          </div>
          <button
            onClick={handleToggle}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isSubscribed
                ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                : 'bg-white text-zinc-950 hover:bg-zinc-200'
            }`}
          >
            {isSubscribed ? 'Desativar' : 'Ativar'}
          </button>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isSubscribed ? 'bg-green-500' : 'bg-zinc-600'}`} />
          <span className="text-sm text-zinc-400">
            {isSubscribed ? 'Notificações ativas' : 'Notificações desativadas'}
          </span>
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-6">
        <h2 className="font-medium mb-4">Histórico</h2>

        {loadingHistorico ? (
          <p className="text-zinc-500 text-sm">Carregando histórico...</p>
        ) : historico.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center">
            <p className="text-zinc-500 text-sm">Nenhuma notificação recebida ainda.</p>
            <p className="text-zinc-600 text-xs mt-2">
              Quando alguém comentar no seu post, aparecerá aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {historico.map((notificacao) => (
              <div
                key={notificacao.id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{notificacao.titulo}</h3>
                    <p className="text-zinc-400 text-sm mt-1">{notificacao.mensagem}</p>
                  </div>
                  <span className="text-xs text-zinc-600 ml-4 flex-shrink-0">
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
                    className="text-xs text-zinc-500 hover:text-white transition-colors mt-2 inline-block"
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
        <Link href="/posts" className="text-sm text-zinc-500 hover:text-white transition-colors">
          ← Voltar para os posts
        </Link>
      </div>
    </div>
  )
}
