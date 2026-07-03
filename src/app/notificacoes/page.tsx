'use client'

import { usePushSubscription } from '@/lib/usePushSubscription'
import Link from 'next/link'

export default function NotificacoesPage() {
  const { isSubscribed, isSupported, isLoading, subscribe, unsubscribe } = usePushSubscription()

  const handleToggle = async () => {
    if (isSubscribed) {
      const result = await unsubscribe()
      if (!result.success) {
        alert(result.error)
      }
    } else {
      const result = await subscribe()
      if (!result.success) {
        alert(result.error || 'Erro ao ativar notificações. Verifique se está usando HTTPS.')
      }
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
          <p className="text-zinc-400 mb-4">
            Seu navegador não suporta notificações push.
          </p>
          <p className="text-zinc-500 text-sm">
            Tente usar Chrome, Firefox ou Edge.
          </p>
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

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
        <h2 className="font-medium mb-3">Como funciona</h2>
        <ul className="space-y-2 text-sm text-zinc-400">
          <li className="flex items-start gap-2">
            <span className="text-zinc-600">1.</span>
            Ative as notificações acima
          </li>
          <li className="flex items-start gap-2">
            <span className="text-zinc-600">2.</span>
            Quando alguém comentar no seu post, você receberá um push
          </li>
          <li className="flex items-start gap-2">
            <span className="text-zinc-600">3.</span>
            Clique na notificação para ver o comentário
          </li>
        </ul>
      </div>

      <div className="bg-yellow-950/50 border border-yellow-900 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-yellow-400 mb-2">Importante</h3>
        <p className="text-sm text-zinc-400">
          Notificações push só funcionam em <strong>HTTPS</strong>. Para testar localmente,
          acesse <code className="bg-zinc-800 px-1 rounded">https://localhost:3000</code> ou faça deploy no Vercel.
        </p>
      </div>

      <div>
        <Link
          href="/posts"
          className="text-sm text-zinc-500 hover:text-white transition-colors"
        >
          ← Voltar para os posts
        </Link>
      </div>
    </div>
  )
}
