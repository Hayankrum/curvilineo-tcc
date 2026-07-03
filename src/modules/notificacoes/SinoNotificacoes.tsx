'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function SinoNotificacoes() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch('/api/notifications/unread')
        const data = await response.json()
        setCount(data.count || 0)
      } catch {
        // ignore
      }
    }

    fetchCount()
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Link
      href="/notificacoes"
      className="relative text-zinc-400 hover:text-white transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
