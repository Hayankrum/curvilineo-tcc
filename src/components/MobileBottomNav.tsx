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
  { href: '/', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )},
  { href: '/scanner', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
      <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
      <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
      <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
      <rect x="7" y="7" width="10" height="10" rx="1"/>
    </svg>
  )},
  { href: '/questionarios', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  )},
  { href: '/questionarios/meus', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="1"/>
      <path d="M9 14l2 2 4-4"/>
    </svg>
  )},
]

export default function MobileBottomNav() {
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

  const linkClass = (isActive: boolean) =>
    `flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${isActive ? 'text-[#ffcf00]' : ''}`

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t md:hidden" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
      <div className="flex items-center justify-center gap-4 px-2 py-1.5">
        {navItems.map(item => {
          const isActive = item.href === '/' ? pathname === '/' : pathname === item.href || (pathname.startsWith(item.href + '/') && item.href !== '/questionarios')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={linkClass(isActive)}
              style={{ color: isActive ? '#ffcf00' : 'var(--text-secondary)' }}
            >
              {item.icon}
            </Link>
          )
        })}

        {loaded && usuario && (
          <Link
            href="/notificacoes"
            className={linkClass(pathname === '/notificacoes')}
            style={{ color: pathname === '/notificacoes' ? '#ffcf00' : 'var(--text-secondary)' }}
          >
            <SinoNotificacoes showLink={false} activeColor={pathname === '/notificacoes' ? '#ffcf00' : undefined} />
          </Link>
        )}

        {loaded && usuario ? (
          <Link
            href={`/usuarios/${usuario.id}`}
            className={linkClass(pathname.startsWith(`/usuarios/${usuario.id}`))}
            style={{ color: pathname.startsWith(`/usuarios/${usuario.id}`) ? '#ffcf00' : 'var(--text-secondary)' }}
          >
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
              {usuario.nome.charAt(0).toUpperCase()}
            </span>
          </Link>
        ) : loaded ? (
          <Link
            href="/usuarios/login"
            className={linkClass(false)}
            style={{ color: 'var(--text-secondary)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
          </Link>
        ) : null}
      </div>
    </nav>
  )
}
