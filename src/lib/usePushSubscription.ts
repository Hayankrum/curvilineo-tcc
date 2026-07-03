'use client'

import { useState, useEffect, useCallback } from 'react'

function getVapidKey() {
  if (typeof window === 'undefined') return null
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  if (!key) {
    console.error('[Push] NEXT_PUBLIC_VAPID_PUBLIC_KEY não configurada')
    return null
  }
  return key
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

function getInitialState() {
  if (typeof window === 'undefined') {
    return { isSupported: false, isLoading: true }
  }
  const supported = 'serviceWorker' in navigator && 'PushManager' in window
  const isSecure = location.protocol === 'https:' || location.hostname === 'localhost'
  return { isSupported: supported && isSecure, isLoading: supported }
}

export function usePushSubscription() {
  const [state, setState] = useState(getInitialState)
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    if (!state.isSupported) return

    let cancelled = false

    const checkSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        if (!cancelled) {
          setIsSubscribed(!!subscription)
        }
      } catch (error) {
        console.error('[Push] Error checking subscription:', error)
      } finally {
        if (!cancelled) {
          setState((prev) => ({ ...prev, isLoading: false }))
        }
      }
    }

    checkSubscription()

    return () => {
      cancelled = true
    }
  }, [state.isSupported])

  const subscribe = useCallback(async () => {
    const vapidKey = getVapidKey()
    if (!vapidKey) {
      return { success: false, error: 'Chave VAPID não configurada. Verifique as variáveis de ambiente.' }
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })

      const subscriptionJson = subscription.toJSON()
      const endpoint = subscriptionJson.endpoint
      const keys = subscriptionJson.keys as { p256dh: string; auth: string }

      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint, keys }),
      })

      if (!response.ok) {
        const data = await response.json()
        await subscription.unsubscribe()
        return { success: false, error: data.error || 'Erro ao salvar inscrição' }
      }

      setIsSubscribed(true)
      return { success: true }
    } catch (error) {
      console.error('[Push] Subscribe error:', error)
      return { success: false, error: 'Erro ao ativar notificações. Verifique se está usando HTTPS.' }
    }
  }, [])

  const unsubscribe = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        const subscriptionJson = subscription.toJSON()
        const endpoint = subscriptionJson.endpoint

        await fetch('/api/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint }),
        })

        await subscription.unsubscribe()
      }

      setIsSubscribed(false)
      return { success: true }
    } catch (error) {
      console.error('[Push] Unsubscribe error:', error)
      return { success: false, error: 'Erro ao desativar notificações' }
    }
  }, [])

  return {
    isSubscribed,
    isSupported: state.isSupported,
    isLoading: state.isLoading,
    subscribe,
    unsubscribe,
  }
}
