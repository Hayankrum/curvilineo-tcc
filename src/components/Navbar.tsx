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

const navItems = [
  { href: '/questionarios', title: 'Questionários', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  )},
  { href: '/questionarios/meus', title: 'Meus Questionários', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  )},
  { href: '/scanner', title: 'Scanner QR Code', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
      <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
      <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
      <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
      <rect x="7" y="7" width="10" height="10" rx="1"/>
    </svg>
  )},
]

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
    <nav className="fixed top-0 left-0 right-0 z-50 border-b px-6 py-4 hidden md:block" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto flex items-center gap-1">
        <Link href="/" className="flex items-center mr-2" title="Ellora">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/Ellora.svg" alt="Ellora" className="h-7 w-auto" />
        </Link>
        {navItems.map(item => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href + '/') && item.href !== '/questionarios')
          return (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium"
              style={{
                color: isActive ? '#ffcf00' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'rgba(255, 207, 0, 0.1)' : 'transparent'
              }}
              title={item.title}
            >
              {item.icon}
            </Link>
          )
        })}

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
