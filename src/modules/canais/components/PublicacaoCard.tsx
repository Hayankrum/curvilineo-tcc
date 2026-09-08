'use client'

import PublicacaoTexto from './PublicacaoTexto'
import PublicacaoEvento from './PublicacaoEvento'
import PublicacaoEnquete from './PublicacaoEnquete'
import Reacoes from './Reacoes'

interface ReacaoData {
  tipo: string
  count: number
}

interface PublicacaoCardProps {
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
  reacoes: ReacaoData[]
  reacaoUsuario: string | null
  showCanal?: boolean
}

function formatarData(data: string | Date) {
  const d = new Date(data)
  const agora = new Date()
  const diffMs = agora.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMs / 3600000)
  const diffD = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Agora'
  if (diffMin < 60) return `${diffMin}min`
  if (diffH < 24) return `${diffH}h`
  if (diffD < 7) return `${diffD}d`

  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function TipoBadge({ tipo }: { tipo: string }) {
  const config: Record<string, { label: string; color: string }> = {
    texto: { label: 'Texto', color: '#3b82f6' },
    evento: { label: 'Evento', color: '#f59e0b' },
    enquete: { label: 'Enquete', color: '#8b5cf6' },
  }

  const c = config[tipo] || config.texto

  return (
    <span
      className="text-[10px] font-medium px-1.5 py-0.5 rounded"
      style={{ backgroundColor: `${c.color}18`, color: c.color }}
    >
      {c.label}
    </span>
  )
}

export default function PublicacaoCard({
  id,
  tipo,
  titulo,
  conteudo,
  criadoEm,
  autor,
  canal,
  evento,
  enquete,
  reacoes,
  reacaoUsuario,
  showCanal = false,
}: PublicacaoCardProps) {
  return (
    <div
      className="card animate-in"
      style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {showCanal && canal && (
            <a
              href={`/canais/${canal.id}`}
              className="text-xs font-medium hover:underline"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {canal.nome}
            </a>
          )}
          <TipoBadge tipo={tipo} />
        </div>
        <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
          {formatarData(criadoEm)}
        </span>
      </div>

      {tipo === 'texto' && (
        <PublicacaoTexto titulo={titulo} conteudo={conteudo} />
      )}

      {tipo === 'evento' && evento && (
        <PublicacaoEvento titulo={titulo} conteudo={conteudo} evento={evento} />
      )}

      {tipo === 'enquete' && enquete && (
        <PublicacaoEnquete titulo={titulo} enquete={enquete} publicacaoId={id} />
      )}

      <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center justify-between">
          {autor && (
            <div className="flex items-center gap-2">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium"
                style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
              >
                {autor.nome.charAt(0).toUpperCase()}
              </span>
              <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                {autor.nome}
              </span>
            </div>
          )}
          <Reacoes
            publicacaoId={id}
            reacoes={reacoes}
            reacaoUsuario={reacaoUsuario}
          />
        </div>
      </div>
    </div>
  )
}
