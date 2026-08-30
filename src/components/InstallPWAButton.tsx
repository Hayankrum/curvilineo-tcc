'use client'

import { useState, useEffect } from 'react'
import { useSyncExternalStore } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState(false)
  const [installing, setInstalling] = useState(false)
  const subscribe = () => () => {}
  const getSnapshot = () => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true
  }
  const alreadyInstalled = useSyncExternalStore(subscribe, getSnapshot, () => false)

  useEffect(() => {
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true)

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setIsStandalone(true)
    }

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
    if (!deferredPrompt) return
    setInstalling(true)
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
    }
    setInstalling(false)
  }

  if (!deferredPrompt) {
    return (
      <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
        Indisponível neste navegador
      </span>
    )
  }

  return (
    <button
      onClick={handleInstall}
      disabled={installing}
      className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      style={{ backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }}
    >
      {installing ? 'Instalando...' : 'Instalar'}
    </button>
  )
}
