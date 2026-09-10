'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  addPendingMutation,
  syncAll,
  cacheQuestionario,
  getCachedQuestionario,
  addPendingResposta,
  getPendingRespostasByQuestionario,
  type CachedQuestionario,
  type PendingResposta,
} from '@/lib/db'
import { useOnlineStatus } from './useOnlineStatus'

// ---------- useUsuario ----------

export function useUsuario() {
  const [usuario, setUsuario] = useState<{ id: number; nome: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    let cancelled = false
    fetch('/api/me')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && mountedRef.current) setUsuario(data)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled && mountedRef.current) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  return { usuario, loading }
}

// ---------- useOfflineMutation ----------

export function useOfflineMutation() {
  const isOnline = useOnlineStatus()

  const mutate = useCallback(async (url: string, method: string, body: unknown) => {
    if (isOnline) {
      return fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    }

    await addPendingMutation({
      url,
      method,
      body: JSON.stringify(body),
      createdAt: Date.now(),
    })

    return new Response(JSON.stringify({ queued: true }), {
      status: 202,
      headers: { 'Content-Type': 'application/json' },
    })
  }, [isOnline])

  return { mutate, isOnline }
}

// ---------- useOfflineSync ----------

export function useOfflineSync() {
  const isOnline = useOnlineStatus()
  const syncingRef = useRef(false)

  useEffect(() => {
    if (!isOnline || syncingRef.current) return

    syncingRef.current = true
    syncAll().finally(() => {
      syncingRef.current = false
    })
  }, [isOnline])

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_MUTATIONS' && !syncingRef.current) {
        syncingRef.current = true
        syncAll().finally(() => {
          syncingRef.current = false
        })
      }
    }

    navigator.serviceWorker?.addEventListener('message', handler)
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handler)
    }
  }, [])
}

// ---------- useCacheQuestionario ----------

export function useCacheQuestionario(questionarioId: number) {
  const [cached, setCached] = useState<CachedQuestionario | null>(null)
  const [loading, setLoading] = useState(true)
  const isOnline = useOnlineStatus()

  const saveToCache = useCallback(async (questionario: CachedQuestionario) => {
    await cacheQuestionario(questionario)
    setCached(questionario)
  }, [])

  const loadFromCache = useCallback(async () => {
    const result = await getCachedQuestionario(questionarioId)
    setCached(result || null)
    setLoading(false)
    return result
  }, [questionarioId])

  useEffect(() => {
    let cancelled = false
    getCachedQuestionario(questionarioId).then((result) => {
      if (!cancelled) {
        setCached(result || null)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [questionarioId])

  return { cached, loading, saveToCache, loadFromCache, isOnline }
}

// ---------- usePendingRespostas ----------

export function usePendingRespostas(questionarioId: number) {
  const [pending, setPending] = useState<PendingResposta[]>([])
  const isOnline = useOnlineStatus()

  const loadPending = useCallback(async () => {
    const result = await getPendingRespostasByQuestionario(questionarioId)
    setPending(result)
  }, [questionarioId])

  const addPending = useCallback(async (resposta: Omit<PendingResposta, 'id' | 'createdAt'>) => {
    await addPendingResposta({
      ...resposta,
      createdAt: Date.now(),
    })
    setPending(await getPendingRespostasByQuestionario(questionarioId))
  }, [questionarioId])

  useEffect(() => {
    let cancelled = false
    getPendingRespostasByQuestionario(questionarioId).then((result) => {
      if (!cancelled) setPending(result)
    })
    return () => { cancelled = true }
  }, [questionarioId])

  return { pending, addPending, loadPending, isOnline }
}
