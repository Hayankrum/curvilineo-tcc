'use client'

import { useState, useEffect } from 'react'

export default function NotificationPermissionPopup() {
  const [showPopup, setShowPopup] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator && 'PushManager' in window)) return
    const isSecure = location.protocol === 'https:' || location.hostname === 'localhost'
    if (!isSecure) return

    const permission = Notification.permission
    if (permission !== 'default') return

    const wasDismissed = localStorage.getItem('notif-permission-dismissed')
    if (wasDismissed) return

    const timer = setTimeout(() => setShowPopup(true), 8000)
    return () => clearTimeout(timer)
  }, [])

  const handleAllow = async () => {
    const result = await Notification.requestPermission()
    setShowPopup(false)
    if (result === 'granted') {
      localStorage.setItem('notif-permission-dismissed', 'true')
    } else {
      localStorage.setItem('notif-permission-dismissed', 'true')
    }
  }

  const handleDismiss = () => {
    setShowPopup(false)
    setDismissed(true)
    localStorage.setItem('notif-permission-dismissed', 'true')
  }

  if (dismissed || !showPopup) return null

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
          <div className="text-4xl mb-3">🔔</div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Ativar notificações
          </h3>
          <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
            Receba alertas quando alguém comentar nos seus posts e fique por dentro das novidades.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleDismiss}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm transition-colors"
              style={{ backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--text-primary)' }}
            >
              Depois
            </button>
            <button
              onClick={handleAllow}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{ backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }}
            >
              Ativar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
