'use client'

import { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

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
  media?: number
  min?: number
  max?: number
}

interface Props {
  resultado: ResultadoPergunta
  corDestaque?: string
}

function gerarPaleta(cor: string): string[] {
  return [
    cor,
    `color-mix(in srgb, ${cor} 62%, white)`,
    `color-mix(in srgb, ${cor} 45%, var(--bg-secondary))`,
    `color-mix(in srgb, ${cor} 55%, black)`,
    `color-mix(in srgb, ${cor} 35%, white)`,
    `color-mix(in srgb, ${cor} 30%, var(--text-tertiary))`,
    'var(--btn-secondary-bg)',
    'var(--text-tertiary)',
  ]
}

function TooltipEstilizado(props: unknown) {
  const { active, payload, label } = props as {
    active?: boolean
    payload?: { payload: { name: string; value: number; count?: number; percentual?: number } }[]
    label?: string
  }
  if (!active || !payload || payload.length === 0) return null
  const dados = payload[0].payload
  return (
    <div
      className="rounded-lg px-3 py-2"
      style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
    >
      <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>{label}</p>
      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        <strong style={{ color: 'var(--text-primary)' }}>{dados.value}</strong>{' '}
        {dados.value === 1 ? 'voto' : 'votos'}
        {dados.percentual != null && <span style={{ color: 'var(--text-tertiary)' }}> · {dados.percentual.toFixed(0)}%</span>}
      </p>
    </div>
  )
}

export default function GraficoResultado({ resultado, corDestaque = 'var(--btn-primary-bg)' }: Props) {
  const [tipoGrafico, setTipoGrafico] = useState<'barras' | 'pizza'>('barras')

  if (resultado.tipo !== 'escolha_unica' && resultado.tipo !== 'multipla_escolha') {
    return null
  }

  if (!resultado.distribuicao || resultado.distribuicao.length === 0) {
    return null
  }

  const palette = gerarPaleta(corDestaque)

  const dadosBarras = resultado.distribuicao.map((d) => ({
    name: d.texto.length > 20 ? d.texto.slice(0, 20) + '...' : d.texto,
    value: d.count,
    percentual: d.percentual,
    correta: d.correta,
  }))

  const dadosPizza = resultado.distribuicao.map((d) => ({
    name: d.texto,
    value: d.count,
    percentual: d.percentual,
    correta: d.correta,
  }))

  const totalValor = dadosPizza.reduce((acc, d) => acc + d.value, 0)
  const maiorSlice = dadosPizza.length > 0 ? dadosPizza.reduce((a, b) => (b.value > a.value ? b : a)) : null

  return (
    <div className="flex flex-col gap-4 mt-3 rounded-xl p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-tertiary)' }}>
            <path d="M3 3v18h18"/>
            <path d="M7 15v3"/>
            <path d="M12 11v7"/>
            <path d="M17 6v12"/>
          </svg>
          <p className="text-xs font-semibold" style={{ color: 'var(--text-tertiary)' }}>Visualização</p>
        </div>
        <div className="inline-flex rounded-lg overflow-hidden p-0.5" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <button
            type="button"
            onClick={() => setTipoGrafico('barras')}
            className="px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5"
            style={{
              backgroundColor: tipoGrafico === 'barras' ? corDestaque : 'transparent',
              color: tipoGrafico === 'barras' ? 'var(--btn-primary-text)' : 'var(--text-tertiary)',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="8" y2="18"/>
              <line x1="16" y1="6" x2="16" y2="18"/>
            </svg>
            Barras
          </button>
          <button
            type="button"
            onClick={() => setTipoGrafico('pizza')}
            className="px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5"
            style={{
              backgroundColor: tipoGrafico === 'pizza' ? corDestaque : 'transparent',
              color: tipoGrafico === 'pizza' ? 'var(--btn-primary-text)' : 'var(--text-tertiary)',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
            </svg>
            Pizza
          </button>
        </div>
      </div>

      {tipoGrafico === 'barras' ? (
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosBarras} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={55}
                axisLine={{ stroke: 'var(--card-border)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }}
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip content={<TooltipEstilizado />} cursor={{ fill: 'var(--accent-dim)' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {dadosBarras.map((d, index) => (
                  <Cell key={`cell-${index}`} fill={d.correta ? '#22c55e' : palette[index % palette.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-60 flex items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dadosPizza}
                cx="50%"
                cy="50%"
                outerRadius={85}
                innerRadius={45}
                dataKey="value"
                paddingAngle={2}
                cornerRadius={4}
                strokeWidth={0}
              >
                {dadosPizza.map((d, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={d.correta ? '#22c55e' : palette[index % palette.length]}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip content={<TooltipEstilizado />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {tipoGrafico === 'pizza' && maiorSlice && totalValor > 0 && (
        <p className="text-xs text-center -mt-2" style={{ color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>{maiorSlice.name}</strong>{' '}
          é a resposta mais comum ({maiorSlice.percentual.toFixed(0)}%)
        </p>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-2 border-t pt-3" style={{ borderColor: 'var(--card-border)' }}>
        {resultado.distribuicao.map((d, idx) => (
          <div key={d.opcaoId} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: d.correta ? '#22c55e' : palette[idx % palette.length] }}
            />
            <span className="max-w-44 truncate">
              {d.texto}
              {d.correta && <span style={{ color: '#16a34a' }}> ✓</span>}
            </span>
            <span style={{ color: 'var(--text-tertiary)' }}>({d.percentual.toFixed(0)}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}