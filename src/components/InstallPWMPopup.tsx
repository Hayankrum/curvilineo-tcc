'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSyncExternalStore } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPWMPopup() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPopup, setShowPopup] = useState(false)
  const subscribe = useCallback(() => () => {}, [])
  const getSnapshot = useCallback(() => window.matchMedia('(display-mode: standalone)').matches, [])
  const alreadyInstalled = useSyncExternalStore(subscribe, getSnapshot, () => false)

  useEffect(() => {
    const wasDismissed = localStorage.getItem('pwa-install-dismissed')
    if (wasDismissed) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)

    const timer = setTimeout(() => {
      if (!localStorage.getItem('pwa-install-dismissed')) {
        setShowPopup(true)
      }
    }, 5000)

    const handleInstalled = () => setShowPopup(false)
    window.addEventListener('appinstalled', handleInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', handleInstalled)
      clearTimeout(timer)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') setShowPopup(false)
      setDeferredPrompt(null)
    } else {
      alert(
        'Para instalar:\n\n' +
        'Chrome/Edge: Clique no ícone ⬇️ na barra de endereço\n' +
        'Safari (iPhone): Toque em "Compartilhar" → "Adicionar à Tela de Início"\n' +
        'Firefox: Clique nos 3 pontos → "Instalar"'
      )
    }
  }

  const handleDismiss = () => {
    setShowPopup(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  if (!showPopup || alreadyInstalled) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleDismiss} />
      <div
        className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in"
        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
      >
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-full transition-colors"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center">
          <div className="text-4xl mb-3">📱</div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Instalar Meu App
          </h3>
          <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
            {deferredPrompt
              ? 'Instale na sua tela inicial para acesso rápido e melhor experiência offline.'
              : 'Adicione à tela inicial para um acesso mais rápido ao app.'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleDismiss}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm transition-colors"
              style={{ backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--text-primary)' }}
            >
              Agora não
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{ backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }}
            >
              {deferredPrompt ? 'Instalar' : 'Como instalar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
