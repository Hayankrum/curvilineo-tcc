'use client'

import { useState, useEffect, useRef } from 'react'

interface Props {
  questionarioId: number
  titulo: string
}

export default function BotaoCompartilhar({ questionarioId, titulo }: Props) {
  const [aberto, setAberto] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/questionarios/${questionarioId}/responder`
    : ''

  useEffect(() => {
    if (aberto && url) {
      import('qrcode').then((QRCode) => {
        QRCode.toDataURL(url, {
          width: 256,
          margin: 2,
          color: { dark: '#18181b', light: '#ffffff' },
        }).then((dataUrl) => setQrCode(dataUrl))
      })
    }
  }, [aberto, url])

  useEffect(() => {
    if (!aberto) return
    function handleClick(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setAberto(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [aberto])

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    }
  }

  function compartilhar() {
    if (navigator.share) {
      navigator.share({
        title: titulo,
        text: `Responda o questionário: ${titulo}`,
        url,
      })
    } else {
      setAberto(true)
    }
  }

  return (
    <>
      <button
        onClick={compartilhar}
        className="text-sm font-medium rounded-lg px-4 py-2 transition-colors"
        style={{ backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)' }}
      >
        Compartilhar
      </button>

      {aberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div
            ref={modalRef}
            className="w-full max-w-sm flex flex-col rounded-lg overflow-hidden"
            style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
          >
            <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <h3 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Compartilhar questionário</h3>
              <button
                type="button"
                onClick={() => { setAberto(false); setQrCode(null) }}
                className="text-lg px-2"
                style={{ color: 'var(--text-tertiary)' }}
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col items-center gap-4 p-6">
              {qrCode ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrCode} alt="QR Code" className="w-48 h-48 rounded-lg" />
              ) : (
                <div className="w-48 h-48 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--card-bg)' }}>
                  <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Gerando QR Code...</p>
                </div>
              )}

              <p className="text-xs text-center break-all px-4" style={{ color: 'var(--text-tertiary)' }}>
                {url}
              </p>

              <button
                onClick={copiarLink}
                className="w-full text-sm font-medium rounded-lg px-4 py-2 transition-colors"
                style={{
                  backgroundColor: copiado ? '#22c55e' : 'var(--btn-primary-bg)',
                  color: copiado ? '#fff' : 'var(--btn-primary-text)',
                }}
              >
                {copiado ? 'Link copiado!' : 'Copiar link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
