'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePushSubscription } from '@/lib/usePushSubscription'
import { toggleNotificacoes } from '@/modules/usuarios/usuarios.actions'
import { useTheme } from '@/lib/ThemeProvider'
import BotaoDeletarPerfil from '@/modules/usuarios/components/BotaoDeletarPerfil'
import BotaoLogout from '@/modules/usuarios/components/BotaoLogout'
import InstallPWAButton from '@/components/InstallPWAButton'

interface UserInfo {
  id: number
  temSenha: boolean
}

export default function ConfiguracoesPage() {
  const router = useRouter()
  const { isSubscribed, isSupported, isLoading, subscribe, unsubscribe } = usePushSubscription()
  const { theme, toggleTheme } = useTheme()
  const [user, setUser] = useState<UserInfo | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/me')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setUser(data)
      })
      .catch(() => {
        if (!cancelled) router.push('/usuarios/login')
      })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleToggleNotificacoes = async () => {
    if (isSubscribed) {
      const result = await unsubscribe()
      if (!result.success) {
        alert(result.error)
      } else {
        await toggleNotificacoes()
      }
    } else {
      const result = await subscribe()
      if (!result.success) {
        alert(result.error || 'Erro ao ativar notificações.')
      } else {
        await toggleNotificacoes()
      }
    }
  }

  if (!user) {
    return (
      <div className="max-w-xl">
        <h1 className="text-2xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Configurações</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Carregando...</p>
      </div>
    )
  }

  return (
    <div className="max-w-xl">
      <Link
        href={`/usuarios/${user.id}`}
        className="text-sm transition-colors mb-6 inline-block hover:underline"
        style={{ color: 'var(--text-tertiary)' }}
      >
        ← Voltar ao perfil
      </Link>

      <h1 className="text-2xl font-semibold mb-8" style={{ color: 'var(--text-primary)' }}>Configurações</h1>

      <div className="flex flex-col gap-6">
        <section className="rounded-lg p-5" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <h2 className="font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Aplicativo</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Instalar PWA</p>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Adicione à tela inicial para acesso rápido
              </p>
            </div>
            <InstallPWAButton />
          </div>
        </section>

        <section className="rounded-lg p-5" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <h2 className="font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Aparência</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Tema</p>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {theme === 'dark' ? 'Tema escuro ativo' : 'Tema claro ativo'}
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="px-4 py-2 rounded-lg text-sm transition-colors"
              style={{ backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--text-primary)' }}
            >
              {theme === 'dark' ? 'Claro' : 'Escuro'}
            </button>
          </div>
        </section>

        <section className="rounded-lg p-5" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <h2 className="font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Notificações</h2>
          {isSupported ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Notificações push</p>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  Receba notificações quando alguém comentar nos seus posts
                </p>
              </div>
              <button
                onClick={handleToggleNotificacoes}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={isSubscribed ? { backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--text-primary)' } : { backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }}
              >
                {isLoading ? '...' : isSubscribed ? 'Desativar' : 'Ativar'}
              </button>
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              Seu navegador não suporta notificações push.
            </p>
          )}
          <div className="mt-3 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isSubscribed ? 'bg-green-500' : 'bg-zinc-600'}`} />
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {isSubscribed ? 'Notificações ativas' : 'Notificações desativadas'}
            </span>
          </div>
        </section>

        <section className="rounded-lg p-5" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <h2 className="font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Conta</h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <BotaoLogout />
            </div>
            <div className="pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
              <BotaoDeletarPerfil id={user.id} temSenha={user.temSenha} />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
