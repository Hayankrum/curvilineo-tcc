interface EventoData {
  data: string | Date
  horaInicio: string
  horaFim?: string | null
  local?: string | null
  link?: string | null
}

interface PublicacaoEventoProps {
  titulo?: string | null
  conteudo?: string | null
  evento: EventoData
}

function formatarData(data: string | Date) {
  const d = new Date(data)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default function PublicacaoEvento({ titulo, conteudo, evento }: PublicacaoEventoProps) {
  return (
    <div className="space-y-3">
      <div
        className="rounded-lg p-3 border"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="flex-shrink-0 w-12 h-12 rounded-lg flex flex-col items-center justify-center text-center"
            style={{ backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }}
          >
            <span className="text-[10px] font-bold leading-none">
              {new Date(evento.data).toLocaleDateString('pt-BR', { day: '2-digit' })}
            </span>
            <span className="text-[10px] font-bold leading-none uppercase">
              {new Date(evento.data).toLocaleDateString('pt-BR', { month: 'short' })}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            {titulo && (
              <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                {titulo}
              </h3>
            )}
            <div className="space-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <p>{formatarData(evento.data)}</p>
              <p>
                {evento.horaInicio}
                {evento.horaFim && ` \u2014 ${evento.horaFim}`}
              </p>
              {evento.local && <p>{evento.local}</p>}
            </div>
          </div>
        </div>
      </div>

      {conteudo && (
        <div
          className="text-xs leading-relaxed whitespace-pre-wrap"
          style={{ color: 'var(--text-secondary)' }}
        >
          {conteudo}
        </div>
      )}

      {evento.link && (
        <a
          href={evento.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
          style={{
            backgroundColor: 'var(--btn-secondary-bg)',
            color: 'var(--text-primary)',
          }}
        >
          Saiba mais
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>
      )}
    </div>
  )
}
