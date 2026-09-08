'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import SinoNotificacoes from '@/modules/notificacoes/SinoNotificacoes'

interface Usuario {
  id: number
  nome: string
  isAdmin?: boolean
}

export default function Navbar() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loaded, setLoaded] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    fetch('/api/me')
      .then(r => r.json())
      .then(data => {
        if (data?.id) setUsuario(data)
        else setUsuario(null)
      })
      .catch(() => setUsuario(null))
      .finally(() => setLoaded(true))
  }, [pathname])

  return (
    <nav className="border-b px-6 py-4" style={{ borderColor: 'var(--border-color)' }}>
      <div className="max-w-3xl mx-auto flex items-center gap-6">
        <Link href="/" className="flex items-center" title="Meu App">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon.svg" alt="Meu App" className="h-7 w-auto" />
        </Link>
        <Link href="/canais" className="transition-colors" style={{ color: 'var(--text-secondary)' }} title="Canais">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </Link>
        <Link href="/questionarios" className="transition-colors" style={{ color: 'var(--text-secondary)' }} title="Questionários">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
        </Link>

        <div className="ml-auto flex items-center gap-4">
          {loaded && usuario && <SinoNotificacoes />}
          {loaded && usuario ? (
            <Link
              href={`/usuarios/${usuario.id}`}
              className="transition-colors flex items-center"
              title={usuario.nome}
            >
              <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                {usuario.nome.charAt(0).toUpperCase()}
              </span>
            </Link>
          ) : loaded ? (
            <Link href="/usuarios/login" className="text-sm transition-colors" style={{ color: 'var(--text-secondary)' }}>
              Entrar
            </Link>
          ) : null}
        </div>
      </div>
    </nav>
  )
}
