'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toggleNotificacoes } from '@/modules/usuarios/usuarios.actions'

interface Props {
  notificacoesAtivas: boolean
}

export default function BotaoNotificacoes({ notificacoesAtivas }: Props) {
  const router = useRouter()
  const [ativadas, setAtivadas] = useState(notificacoesAtivas)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    const result = await toggleNotificacoes()
    if (result.success) {
      setAtivadas(!ativadas)
    }
    setIsLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className="text-sm text-zinc-400 hover:text-white transition-colors"
    >
      {isLoading ? '...' :ativadas ? 'Desativar notificações' : 'Ativar notificações'}
    </button>
  )
}
