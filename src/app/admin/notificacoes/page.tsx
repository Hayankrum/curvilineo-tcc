'use client'

import { useState } from 'react'

export default function AdminNotificacoesPage() {
  const [titulo, setTitulo] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [url, setUrl] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [result, setResult] = useState<{
    error?: string
    enviadas?: number
    total?: number
    falhas?: number
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSending(true)
    setResult(null)

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, mensagem, url: url || undefined }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar')
      }

      setResult(data)
      setTitulo('')
      setMensagem('')
      setUrl('')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      setResult({ error: message })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-6">Enviar Notificação Push</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Título *</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            placeholder="Ex: Novidade no app!"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Mensagem *</label>
          <textarea
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            required
            rows={3}
            placeholder="Ex: Acabamos de lançar uma nova funcionalidade..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">URL (opcional)</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="/posts ou https://exemplo.com"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
          />
        </div>

        <button
          type="submit"
          disabled={isSending}
          className="w-full bg-white text-zinc-950 font-medium rounded-lg px-4 py-2 text-sm hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? 'Enviando...' : 'Enviar Notificação'}
        </button>
      </form>

      {result && (
        <div className={`mt-6 p-4 rounded-lg text-sm ${result.error ? 'bg-red-950/50 border border-red-900 text-red-400' : 'bg-green-950/50 border border-green-900 text-green-400'}`}>
          {result.error ? (
            <p>{result.error}</p>
          ) : (
            <div>
              <p className="font-medium mb-1">Notificação enviada!</p>
              <p className="text-zinc-400">
                {result.enviadas} de {result.total} inscritos receberam
                {result.falhas && result.falhas > 0 && ` (${result.falhas} falha(s))`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
