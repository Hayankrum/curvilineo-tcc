'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import SinoNotificacoes from '@/modules/notificacoes/SinoNotificacoes'

interface Usuario {
  id: number
  nome: string
}

export default function Navbar() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/me')
      .then(r => r.json())
      .then(data => {
        if (data?.id) setUsuario(data)
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  return (
    <nav className="border-b px-6 py-4" style={{ borderColor: 'var(--border-color)' }}>
      <div className="max-w-3xl mx-auto flex items-center gap-6">
        <Link href="/" className="flex items-center" title="Meu App">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon.svg" alt="Meu App" className="h-7 w-auto" />
        </Link>
        <Link href="/posts" className="transition-colors" style={{ color: 'var(--text-secondary)' }} title="Posts">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
            <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
          </svg>
        </Link>
        <Link href="/mapa" className="transition-colors" style={{ color: 'var(--text-secondary)' }} title="Mapa">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
            <line x1="8" y1="2" x2="8" y2="18"/>
            <line x1="16" y1="6" x2="16" y2="22"/>
          </svg>
        </Link>
        <Link href="/questionarios" className="transition-colors" style={{ color: 'var(--text-secondary)' }} title="Questionários">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
        </Link>
        <Link href="/cadastro" className="transition-colors" style={{ color: 'var(--text-secondary)' }} title="Cadastro">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <line x1="19" y1="8" x2="19" y2="14"/>
            <line x1="22" y1="11" x2="16" y2="11"/>
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
