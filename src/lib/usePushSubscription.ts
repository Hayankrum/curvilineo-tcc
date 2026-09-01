'use client'

import { useState, useEffect, useCallback } from 'react'

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
    return { isSupported: false, isLoading: true, permissionDenied: false }
  }
  const supported = 'serviceWorker' in navigator && 'PushManager' in window
  const isSecure = location.protocol === 'https:' || location.hostname === 'localhost'
  const denied = 'Notification' in window && Notification.permission === 'denied'
  return { isSupported: supported && isSecure, isLoading: supported, permissionDenied: denied }
}

export function usePushSubscription() {
  const [state, setState] = useState(getInitialState)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isSubscribing, setIsSubscribing] = useState(false)

  useEffect(() => {
    if (!state.isSupported) return

    let cancelled = false

    const checkSubscription = async () => {
      try {
        const registration = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('SW ready timeout')), 5000)),
        ])

        const subscription = await registration.pushManager.getSubscription()
        if (cancelled) return

        if (subscription) {
          const endpoint = subscription.endpoint
          try {
            const res = await fetch('/api/subscribe/check', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ endpoint }),
            })
            const data = await res.json()
            if (cancelled) return

            if (!data.registered) {
              await subscription.unsubscribe().catch(() => {})
              setIsSubscribed(false)
            } else {
              setIsSubscribed(true)
            }
          } catch {
            if (!cancelled) setIsSubscribed(true)
          }
        } else {
          setIsSubscribed(false)
        }
      } catch (error) {
        console.warn('[Push] Error checking subscription:', error)
        if (!cancelled) {
          setIsSubscribed(false)
        }
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
    if (isSubscribing) return { success: false, error: 'Aguarde...' }
    setIsSubscribing(true)

    let vapidKey: string | null = null
    try {
      const res = await fetch('/api/vapid-key')
      if (!res.ok) {
        return { success: false, error: 'Erro ao buscar chave VAPID. Verifique as variáveis de ambiente.' }
      }
      const data = await res.json()
      vapidKey = data.publicKey || null
    } catch {
      vapidKey = null
    }

    if (!vapidKey) {
      return { success: false, error: 'Chave VAPID não configurada. Verifique as variáveis de ambiente.' }
    }

    if ('Notification' in window && Notification.permission === 'denied') {
      return { success: false, error: 'Permissão negada. Ative nas configurações do navegador.' }
    }

    try {
      if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          if (permission === 'denied') {
            setState((prev) => ({ ...prev, permissionDenied: true }))
          }
          return { success: false, error: 'Você precisa permitir notificações para ativar.' }
        }
      }

      let registration = await navigator.serviceWorker.ready

      if (!registration.active) {
        await new Promise<void>((resolve) => {
          const sw = registration.installing || registration.waiting
          if (sw) {
            sw.addEventListener('statechange', () => {
              if (sw.state === 'activated') resolve()
            })
          } else {
            resolve()
          }
        })
        registration = await navigator.serviceWorker.ready
      }

      if (!registration.pushManager) {
        return { success: false, error: 'Push Manager não disponível neste navegador.' }
      }

      let subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        try {
          await subscription.unsubscribe()
        } catch {}
        subscription = null
      }

      subscription = await registration.pushManager.subscribe({
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
        await subscription.unsubscribe().catch(() => {})
        return { success: false, error: data.error || 'Erro ao salvar inscrição' }
      }

      setIsSubscribed(true)
      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'desconhecido'
      console.warn('[Push] Subscribe error:', message)

      if (message.includes('push service not available') || message.includes('Push service')) {
        return {
          success: false,
          error: 'Serviço de push não disponível. Verifique se:\n1. O navegador suporta notificações push\n2. Você está acessando via HTTPS (ou localhost)\n3. No Linux, instale o pacote libnotify ou use Chrome/Edge',
        }
      }

      if (message.includes('push service error')) {
        return {
          success: false,
          error: 'Erro ao registrar com o serviço de push. Verifique se o site está acessível via HTTPS e tente novamente.',
        }
      }

      return { success: false, error: `Erro ao ativar notificações: ${message}` }
    } finally {
      setIsSubscribing(false)
    }
  }, [isSubscribing])

  const unsubscribe = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
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
      console.warn('[Push] Unsubscribe error:', error)
      setIsSubscribed(false)
      return { success: true }
    }
  }, [])

  return {
    isSubscribed,
    isSubscribing,
    isSupported: state.isSupported,
    isLoading: state.isLoading,
    permissionDenied: state.permissionDenied,
    subscribe,
    unsubscribe,
  }
}
