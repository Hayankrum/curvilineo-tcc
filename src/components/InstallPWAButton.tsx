'use client'

import { useState, useEffect } from 'react'
import { useSyncExternalStore } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const installed = useSyncExternalStore(
    () => () => {},
    () => window.matchMedia('(display-mode: standalone)').matches,
    () => false,
  )

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    const handleAppInstalled = () => setDeferredPrompt(null)

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  if (installed) {
    return (
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          App instalado
        </span>
      </div>
    )
  }

  return (
    <button
      onClick={async () => {
        if (deferredPrompt) {
          await deferredPrompt.prompt()
          const { outcome } = await deferredPrompt.userChoice
          if (outcome === 'accepted') setDeferredPrompt(null)
        } else {
          alert(
            'Para instalar:\n\n' +
            'Chrome/Edge: Clique no ícone ⬇️ na barra de endereço\n' +
            'Safari (iPhone): Toque em "Compartilhar" → "Adicionar à Tela de Início"\n' +
            'Firefox: Clique nos 3 pontos → "Instalar"'
          )
        }
      }}
      className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      style={{ backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }}
    >
      {deferredPrompt ? 'Instalar app' : 'Como instalar'}
    </button>
  )
}
