'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import InstallPWAButton from '@/components/InstallPWAButton'

interface UserInfo {
  id: number
}

export default function SobrePage() {
  const [user, setUser] = useState<UserInfo | null>(null)

  useEffect(() => {
    fetch('/api/me')
      .then((res) => res.json())
      .then((data) => {
        if (data?.id) setUser(data)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="max-w-xl">
      <Link
        href={user ? `/usuarios/${user.id}` : '/'}
        className="text-sm transition-colors mb-6 inline-block hover:underline"
        style={{ color: 'var(--text-tertiary)' }}
      >
        ← Voltar ao perfil
      </Link>

      <h1 className="text-2xl font-semibold mb-8" style={{ color: 'var(--text-primary)' }}>Sobre o aplicativo</h1>

      <div className="flex flex-col gap-6">
        <section className="rounded-lg p-5" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <h2 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Meu App</h2>
          <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Uma plataforma completa para criar, compartilhar e explorar posts com suporte offline,
            notificações push e mapa interativo.
          </p>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Versão 0.1.0</span>
          </div>
        </section>

        <section className="rounded-lg p-5" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <h2 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Funcionalidades</h2>
          <ul className="text-sm space-y-2" style={{ color: 'var(--text-secondary)' }}>
            <li className="flex items-center gap-2">
              <span>📝</span>
              <span>Criação e gerenciamento de posts</span>
            </li>
            <li className="flex items-center gap-2">
              <span>🗺️</span>
              <span>Mapa interativo com Leaflet</span>
            </li>
            <li className="flex items-center gap-2">
              <span>🔔</span>
              <span>Notificações push em tempo real</span>
            </li>
            <li className="flex items-center gap-2">
              <span>📴</span>
              <span>Suporte offline completo</span>
            </li>
            <li className="flex items-center gap-2">
              <span>🌙</span>
              <span>Tema claro e escuro</span>
            </li>
            <li className="flex items-center gap-2">
              <span>📱</span>
              <span>PWA - instalável em qualquer dispositivo</span>
            </li>
          </ul>
        </section>

        <section className="rounded-lg p-5" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <h2 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Instalar aplicativo</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            Instale o aplicativo na sua tela inicial para acesso rápido e melhor experiência offline.
          </p>
          <InstallPWAButton />
        </section>

        <section className="rounded-lg p-5" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <h2 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Tecnologias</h2>
          <div className="flex flex-wrap gap-2">
            {['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Prisma', 'PostgreSQL', 'Leaflet'].map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 rounded-md text-xs"
                style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-lg p-5" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <h2 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Como instalar</h2>
          <div className="text-sm space-y-3" style={{ color: 'var(--text-secondary)' }}>
            <div>
              <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Chrome / Edge</p>
              <p className="text-xs">Clique no ícone de instalar que aparece na barra de endereço do navegador.</p>
            </div>
            <div>
              <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Firefox</p>
              <p className="text-xs">Clique nos 3 pontos do menu → &quot;Instalar&quot;.</p>
            </div>
            <div>
              <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Safari (iOS)</p>
              <p className="text-xs">Toque no botão &quot;Compartilhar&quot; → &quot;Adicionar à Tela de Início&quot;.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
