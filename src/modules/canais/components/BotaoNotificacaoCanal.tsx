'use client'

import { useState } from 'react'
import { toggleNotificacaoCanal } from '@/modules/canais/actions/canal.actions'

interface BotaoNotificacaoCanalProps {
  canalId: number
  inscritoInicial: boolean
}

export default function BotaoNotificacaoCanal({ canalId, inscritoInicial }: BotaoNotificacaoCanalProps) {
  const [inscrito, setInscrito] = useState(inscritoInicial)
  const [carregando, setCarregando] = useState(false)

  const handleToggle = async () => {
    if (carregando) return
    setCarregando(true)
    const antes = inscrito
    setInscrito(!antes)
    const result = await toggleNotificacaoCanal(canalId)
    if (result.error) {
      setInscrito(antes)
    }
    setCarregando(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={carregando}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
      style={{
        backgroundColor: inscrito ? 'var(--btn-primary-bg)' : 'var(--btn-secondary-bg)',
        color: inscrito ? 'var(--btn-primary-text)' : 'var(--text-secondary)',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={inscrito ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
      {carregando ? '...' : inscrito ? 'Notificações ativas' : 'Ativar notificações'}
    </button>
  )
}
