'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="text-6xl mb-6">⚠️</div>
      <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Algo deu errado</h1>
      <p className="mb-6 max-w-md" style={{ color: 'var(--text-secondary)' }}>
        Ocorreu um erro inesperado. Por favor, tente novamente.
      </p>
      <button
        onClick={() => reset()}
        className="border px-6 py-3 rounded-lg transition-colors"
        style={{ backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
      >
        Tentar Novamente
      </button>
    </div>
  )
}
