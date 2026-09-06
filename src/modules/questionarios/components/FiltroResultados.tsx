'use client'

import { useState } from 'react'

interface Filtros {
  dataInicio: string
  dataFim: string
}

interface Props {
  onFiltrar: (filtros: Filtros) => void
  loading?: boolean
}

export default function FiltroResultados({ onFiltrar, loading }: Props) {
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  function handleFiltrar() {
    onFiltrar({ dataInicio, dataFim })
  }

  function handleLimpar() {
    setDataInicio('')
    setDataFim('')
    onFiltrar({ dataInicio: '', dataFim: '' })
  }

  return (
    <div
      className="rounded-lg p-4 flex flex-col sm:flex-row items-end gap-4"
      style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
    >
      <div className="flex flex-col gap-1 flex-1 w-full sm:w-auto">
        <label className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          Data inicial
        </label>
        <input
          type="date"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
          className="rounded-lg px-3 py-2 text-sm focus:outline-none"
          style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
        />
      </div>

      <div className="flex flex-col gap-1 flex-1 w-full sm:w-auto">
        <label className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          Data final
        </label>
        <input
          type="date"
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
          className="rounded-lg px-3 py-2 text-sm focus:outline-none"
          style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleFiltrar}
          disabled={loading}
          className="text-sm font-medium rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
          style={{ backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }}
        >
          {loading ? 'Filtrando...' : 'Filtrar'}
        </button>
        <button
          onClick={handleLimpar}
          disabled={loading}
          className="text-sm font-medium rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
          style={{ backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)' }}
        >
          Limpar
        </button>
      </div>
    </div>
  )
}
