'use client'

import { useState, useEffect, useRef } from 'react'
import {
  addPendingMutation,
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

  const mutate = async (url: string, method: string, body: unknown) => {
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
  }

  return { mutate, isOnline }
}
