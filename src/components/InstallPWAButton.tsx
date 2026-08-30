'use client'

import { useState, useEffect } from 'react'
import { useSyncExternalStore } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const subscribe = () => () => {}
  const getSnapshot = () => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true
  }
  const alreadyInstalled = useSyncExternalStore(subscribe, getSnapshot, () => false)

  useEffect(() => {
    const ua = window.navigator.userAgent
    setIsIOS(/iPad|iPhone|iPod/.test(ua) || (ua.includes('Mac') && 'ontouchend' in window))
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true)

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

  if (isStandalone || alreadyInstalled) {
    return (
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          App instalado
        </span>
      </div>
    )
  }

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') setDeferredPrompt(null)
    } else if (isIOS) {
      alert(
        'Para instalar no iPhone/iPad:\n\n' +
        '1. Toque no botão Compartilhar ()\n' +
        '2. Role para baixo e toque em "Adicionar à Tela de Início"\n' +
        '3. Toque em "Adicionar" no canto superior direito'
      )
    } else {
      alert(
        'Para instalar:\n\n' +
        'Chrome/Edge: Clique no ícone ⬇️ na barra de endereço\n' +
        'Firefox: Clique nos 3 pontos → "Instalar"\n' +
        'Safari: Toque em "Compartilhar" → "Adicionar à Tela de Início"'
      )
    }
  }

  return (
    <button
      onClick={handleInstall}
      className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      style={{ backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }}
    >
      {deferredPrompt ? 'Instalar app' : 'Como instalar'}
    </button>
  )
}
