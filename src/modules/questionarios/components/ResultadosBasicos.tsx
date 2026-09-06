'use client'

import GraficoResultado from './GraficoResultado'

interface ResultadoPergunta {
  perguntaId: number
  texto: string
  tipo: string
  totalRespostas: number
  distribuicao?: {
    opcaoId: number
    texto: string
    correta?: boolean
    count: number
    percentual: number
  }[]
  temCorretas?: boolean
  acertos?: number
  taxaAcerto?: number
  media?: number
  min?: number
  max?: number
  respostas?: string[]
}

interface Props {
  totalRespostas: number
  resultados: ResultadoPergunta[]
  corTema?: string
}

export default function ResultadosBasicos({ totalRespostas, resultados, corTema }: Props) {
  const cor = corTema || '#6366f1'

  if (totalRespostas === 0) {
    return (
      <div className="text-center py-8">
        <p style={{ color: 'var(--text-tertiary)' }}>Nenhuma resposta recebida ainda.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {resultados.map((r) => (
        <div
          key={r.perguntaId}
          className="rounded-lg p-4 flex flex-col gap-3"
          style={{ backgroundColor: 'var(--card-bg)', borderLeft: `3px solid ${cor}` }}
        >
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium flex-1" style={{ color: 'var(--text-primary)' }}>
              {r.texto}
            </p>
            <span className="text-xs ml-2 whitespace-nowrap" style={{ color: 'var(--text-tertiary)' }}>
              {r.totalRespostas} {r.totalRespostas === 1 ? 'resposta' : 'respostas'}
            </span>
          </div>

          {(r.tipo === 'escolha_unica' || r.tipo === 'multipla_escolha') && r.distribuicao && (
            <div className="flex flex-col gap-2">
              {r.distribuicao.map((d) => (
                <div key={d.opcaoId} className="flex items-center gap-3">
                  <span className="text-xs w-32 truncate" style={{ color: d.correta ? '#22c55e' : 'var(--text-secondary)' }}>
                    {d.texto}
                    {d.correta && ' ✓'}
                  </span>
                  <div className="flex-1 h-5 rounded overflow-hidden" style={{ backgroundColor: 'var(--input-bg)' }}>
                    <div
                      className="h-full rounded transition-all"
                      style={{
                        width: `${d.percentual}%`,
                        backgroundColor: d.correta ? '#22c55e' : cor,
                        minWidth: d.count > 0 ? '2px' : '0',
                      }}
                    />
                  </div>
                  <span className="text-xs w-16 text-right" style={{ color: 'var(--text-tertiary)' }}>
                    {d.count} ({d.percentual}%)
                  </span>
                </div>
              ))}
              {r.temCorretas && r.tipo === 'escolha_unica' && (
                <p className="text-xs font-medium mt-1" style={{ color: '#22c55e' }}>
                  Taxa de acerto: {r.taxaAcerto}% ({r.acertos}/{r.totalRespostas})
                </p>
              )}
              <GraficoResultado resultado={r} />
            </div>
          )}

          {r.tipo === 'escala' && r.media != null && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-tertiary)' }}>
                <span>{r.min}</span>
                <span>{r.max}</span>
              </div>
              <div className="relative h-5 rounded overflow-hidden" style={{ backgroundColor: 'var(--input-bg)' }}>
                <div
                  className="absolute left-0 top-0 h-full rounded transition-all"
                  style={{
                    width: `${((r.media - (r.min || 0)) / ((r.max || 10) - (r.min || 0))) * 100}%`,
                    backgroundColor: cor,
                  }}
                />
              </div>
              <p className="text-sm font-medium text-center" style={{ color: 'var(--text-primary)' }}>
                Média: {r.media.toFixed(1)}
              </p>
            </div>
          )}

          {(r.tipo === 'texto_curto' || r.tipo === 'texto_longo') && r.respostas && (
            <div className="flex flex-col gap-2">
              {r.respostas.slice(0, 10).map((resp, idx) => (
                <div
                  key={idx}
                  className="text-sm p-2 rounded"
                  style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-secondary)' }}
                >
                  {resp}
                </div>
              ))}
              {r.respostas.length > 10 && (
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  ... e mais {r.respostas.length - 10} respostas
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
