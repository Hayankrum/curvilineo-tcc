'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toggleCanalAtivo, excluirCanal } from '../actions/canal.actions'
import { excluirPublicacao } from '../actions/publicacao.actions'

interface AdminCanalPanelProps {
  canalId: number
  ativo: boolean
}

export default function AdminCanalPanel({ canalId, ativo }: AdminCanalPanelProps) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function handleToggle() {
    if (pending) return
    setPending(true)
    try {
      await toggleCanalAtivo(canalId)
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  async function handleExcluir() {
    if (!confirm('Tem certeza que deseja excluir este canal e todas as suas publicações?')) return
    if (pending) return
    setPending(true)
    try {
      await excluirCanal(canalId)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleToggle}
        disabled={pending}
        className="btn-secondary rounded-lg px-3 py-1.5 text-xs"
      >
        {ativo ? 'Desativar' : 'Ativar'}
      </button>
      <button
        onClick={handleExcluir}
        disabled={pending}
        className="btn rounded-lg px-3 py-1.5 text-xs"
        style={{ color: '#dc2626', backgroundColor: '#fee2e2', border: '1px solid #fecaca' }}
      >
        Excluir
      </button>
    </div>
  )
}

interface AdminPublicacaoPanelProps {
  publicacaoId: number
  canalId: number
}

export function AdminPublicacaoPanel({ publicacaoId }: AdminPublicacaoPanelProps) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function handleExcluir() {
    if (!confirm('Tem certeza que deseja excluir esta publicação?')) return
    if (pending) return
    setPending(true)
    try {
      await excluirPublicacao(publicacaoId)
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      onClick={handleExcluir}
      disabled={pending}
      className="btn rounded-lg px-2 py-1 text-[10px]"
      style={{ color: '#dc2626' }}
      title="Excluir publicação"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      </svg>
    </button>
  )
}
