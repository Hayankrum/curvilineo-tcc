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
}

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308']

export default function GraficoResultado({ resultado }: Props) {
  const [tipoGrafico, setTipoGrafico] = useState<'barras' | 'pizza'>('barras')

  if (resultado.tipo !== 'escolha_unica' && resultado.tipo !== 'multipla_escolha') {
    return null
  }

  if (!resultado.distribuicao || resultado.distribuicao.length === 0) {
    return null
  }

  const dadosBarras = resultado.distribuicao.map((d) => ({
    name: d.texto.length > 20 ? d.texto.slice(0, 20) + '...' : d.texto,
    value: d.count,
    percentual: d.percentual,
  }))

  const dadosPizza = resultado.distribuicao.map((d) => ({
    name: d.texto,
    value: d.count,
  }))

  return (
    <div className="flex flex-col gap-3 mt-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
          Gráfico
        </p>
        <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
          <button
            type="button"
            onClick={() => setTipoGrafico('barras')}
            className="px-3 py-1 text-xs font-medium transition-colors"
            style={{
              backgroundColor: tipoGrafico === 'barras' ? 'var(--btn-primary-bg)' : 'transparent',
              color: tipoGrafico === 'barras' ? 'var(--btn-primary-text)' : 'var(--text-tertiary)',
            }}
          >
            Barras
          </button>
          <button
            type="button"
            onClick={() => setTipoGrafico('pizza')}
            className="px-3 py-1 text-xs font-medium transition-colors"
            style={{
              backgroundColor: tipoGrafico === 'pizza' ? 'var(--btn-primary-bg)' : 'transparent',
              color: tipoGrafico === 'pizza' ? 'var(--btn-primary-text)' : 'var(--text-tertiary)',
            }}
          >
            Pizza
          </button>
        </div>
      </div>

      {tipoGrafico === 'barras' ? (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosBarras} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'var(--text-primary)' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {dadosBarras.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dadosPizza}
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={35}
                fill="#8884d8"
                dataKey="value"
              >
                {dadosPizza.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mt-2">
        {resultado.distribuicao.map((d, idx) => (
          <div key={d.opcaoId} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
            <span className="truncate">{d.texto}</span>
            <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>({d.count} · {d.percentual.toFixed(0)}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}
