'use client'

import PublicacaoCard from './PublicacaoCard'

interface ReacaoData {
  tipo: string
  count: number
}

interface Publicacao {
  id: number
  tipo: string
  titulo?: string | null
  conteudo?: string | null
  criadoEm: string | Date
  autor: { id: number; nome: string } | null
  canal: { id: number; nome: string } | null
  evento?: {
    data: string | Date
    horaInicio: string
    horaFim?: string | null
    local?: string | null
    link?: string | null
  } | null
  enquete?: {
    id: number
    permiteMultiplaEscolha: boolean
    opcoes: {
      id: number
      texto: string
      ordem: number
      votos?: { id: number }[]
      _count?: { votos: number }
    }[]
    votos: unknown[]
  } | null
  reacoes: {
    tipo: string
    usuario: { id: number; nome: string }
  }[]
}

interface FeedProps {
  publicacoes: Publicacao[]
  usuarioId?: number | null
  showCanal?: boolean
}

function agruparReacoes(reacoes: { tipo: string }[]): ReacaoData[] {
  const map = new Map<string, number>()
  for (const r of reacoes) {
    map.set(r.tipo, (map.get(r.tipo) || 0) + 1)
  }
  return Array.from(map.entries()).map(([tipo, count]) => ({ tipo, count }))
}

function obterReacaoUsuario(reacoes: { tipo: string; usuario: { id: number } }[], usuarioId?: number | null): string | null {
  if (!usuarioId) return null
  const reacao = reacoes.find(r => r.usuario.id === usuarioId)
  return reacao?.tipo ?? null
}

export default function Feed({ publicacoes, usuarioId, showCanal = false }: FeedProps) {
  if (publicacoes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          Nenhuma publicação encontrada
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {publicacoes.map(pub => (
        <PublicacaoCard
          key={pub.id}
          id={pub.id}
          tipo={pub.tipo}
          titulo={pub.titulo}
          conteudo={pub.conteudo}
          criadoEm={pub.criadoEm}
          autor={pub.autor}
          canal={pub.canal}
          evento={pub.evento}
          enquete={pub.enquete}
          reacoes={agruparReacoes(pub.reacoes)}
          reacaoUsuario={obterReacaoUsuario(pub.reacoes, usuarioId)}
          showCanal={showCanal}
        />
      ))}
    </div>
  )
}
