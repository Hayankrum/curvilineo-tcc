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
}

const TIPOS_LABELS: Record<string, string> = {
  texto_curto: 'Texto Curto',
  texto_longo: 'Texto Longo',
  escolha_unica: 'Escolha Única',
  multipla_escolha: 'Múltipla Escolha',
  escala: 'Escala',
}

const CORES_CHART = ['var(--btn-primary-bg)', 'var(--btn-secondary-bg)', 'var(--text-tertiary)', '#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#a855f7']

export default function ResultadosBasicos({ totalRespostas, resultados }: Props) {
  if (totalRespostas === 0) {
    return (
      <div
        className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 p-10 text-center"
        style={{ borderColor: 'var(--card-border)' }}
      >
        <span className="flex items-center justify-center w-12 h-12 rounded-full" style={{ backgroundColor: 'var(--accent-dim)', color: 'var(--text-primary)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18"/>
            <path d="M7 17v-6"/>
            <path d="M12 17V9"/>
            <path d="M17 17V5"/>
          </svg>
        </span>
        <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          Nenhuma resposta recebida ainda
        </p>
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          Compartilhe o link do questionário para começar a receber respostas.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Respostas por pergunta</h2>
        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'var(--accent-dim)', color: 'var(--text-primary)' }}>
          {resultados.length} {resultados.length === 1 ? 'pergunta' : 'perguntas'}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {resultados.map((r, idx) => {
          const corDestaque = CORES_CHART[idx % CORES_CHART.length]

          return (
            <div
              key={r.perguntaId}
              className="card !rounded-xl overflow-hidden"
              style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              <div className="flex flex-wrap items-center gap-2.5 pb-4" style={{ borderBottom: '1px solid var(--card-border)' }}>
                <span
                  className="flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-semibold shrink-0"
                  style={{ backgroundColor: 'var(--accent-dim)', color: 'var(--text-primary)' }}
                >
                  {idx + 1}
                </span>
                <p className="text-sm font-medium flex-1 min-w-40" style={{ color: 'var(--text-primary)' }}>
                  {r.texto}
                </p>
                <span className="text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-md" style={{ backgroundColor: 'var(--accent-dim)', color: 'var(--text-tertiary)' }}>
                  {TIPOS_LABELS[r.tipo] || r.tipo}
                </span>
                <span
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ backgroundColor: 'var(--accent-dim)', color: 'var(--text-primary)' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  {r.totalRespostas} {r.totalRespostas === 1 ? 'resposta' : 'respostas'}
                </span>
              </div>

              <div className="pt-4 flex flex-col gap-4">
                {(r.tipo === 'escolha_unica' || r.tipo === 'multipla_escolha') && r.distribuicao && (
                  <>
                    <div className="flex flex-col gap-3">
                      {r.distribuicao.map((d) => (
                        <div key={d.opcaoId} className="flex items-center gap-3">
                          <span
                            className="text-xs min-w-0 flex-1 truncate"
                            style={{ color: d.correta ? '#16a34a' : 'var(--text-secondary)' }}
                          >
                            {d.texto}
                            {d.correta && (
                              <span className="ml-1 text-[10px] font-medium uppercase" style={{ color: '#16a34a' }}>✓ correta</span>
                            )}
                          </span>
                          <div className="flex-1 h-6 rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--input-bg)' }}>
                            <div
                              className="h-full rounded-lg transition-all flex items-center justify-end pr-1.5"
                              style={{
                                width: `${d.percentual}%`,
                                backgroundColor: d.correta ? '#22c55e' : corDestaque,
                                minWidth: d.count > 0 ? '2px' : '0',
                              }}
                            >
                              {d.percentual >= 15 && (
                                <span className="text-[10px] font-semibold text-white">{d.percentual}%</span>
                              )}
                            </div>
                          </div>
                          <span className="text-xs w-24 text-right whitespace-nowrap" style={{ color: 'var(--text-tertiary)' }}>
                            {d.count} {d.count === 1 ? 'voto' : 'votos'}
                          </span>
                        </div>
                      ))}
                    </div>

                    {r.temCorretas && r.tipo === 'escolha_unica' && (
                      <div
                        className="flex flex-wrap items-center gap-2 rounded-lg px-3 py-2 w-fit"
                        style={{ backgroundColor: 'rgba(22,163,74,0.1)' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="m9 12 2 2 4-4"/>
                        </svg>
                        <p className="text-xs font-medium" style={{ color: '#16a34a' }}>
                          Taxa de acerto: {r.taxaAcerto}% ({r.acertos}/{r.totalRespostas})
                        </p>
                      </div>
                    )}

                    <GraficoResultado resultado={r} corDestaque={corDestaque} />
                  </>
                )}

                {r.tipo === 'escala' && r.media != null && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      <span className="font-medium">Mín {r.min}</span>
                      <span className="font-medium">Máx {r.max}</span>
                    </div>
                    <div className="relative h-6 rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--input-bg)' }}>
                      <div
                        className="absolute left-0 top-0 h-full rounded-lg transition-all"
                        style={{
                          width: `${((r.media - (r.min || 0)) / ((r.max || 10) - (r.min || 0))) * 100}%`,
                          backgroundColor: corDestaque,
                        }}
                      />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2"
                        style={{ left: `calc(${((r.media - (r.min || 0)) / ((r.max || 10) - (r.min || 0))) * 100}% - 6px)`, backgroundColor: 'var(--card-bg)', borderColor: corDestaque }}
                      />
                    </div>
                    <p className="text-sm font-medium text-center" style={{ color: 'var(--text-primary)' }}>
                      Média: <span style={{ color: corDestaque }}>{r.media.toFixed(1)}</span>
                    </p>
                  </div>
                )}

                {(r.tipo === 'texto_curto' || r.tipo === 'texto_longo') && r.respostas && (
                  <div className="flex flex-col gap-2">
                    {r.respostas.slice(0, 10).map((resp, idx) => (
                      <div
                        key={idx}
                        className="text-sm p-3 rounded-lg"
                        style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-secondary)' }}
                      >
                        {resp}
                      </div>
                    ))}
                    {r.respostas.length > 10 && (
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        ... e mais {r.respostas.length - 10} {r.respostas.length - 10 === 1 ? 'resposta' : 'respostas'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}