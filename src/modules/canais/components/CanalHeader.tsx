import Link from 'next/link'

interface CanalHeaderProps {
  nome: string
  descricao?: string | null
  totalPublicacoes: number
}

export default function CanalHeader({ nome, descricao, totalPublicacoes }: CanalHeaderProps) {
  return (
    <div className="mb-6">
      <Link
        href="/canais"
        className="inline-flex items-center gap-1 text-xs mb-3 hover:underline"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Canais
      </Link>

      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold"
          style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
        >
          {nome.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {nome}
          </h1>
          {descricao && (
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              {descricao}
            </p>
          )}
          <p className="text-[10px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
            {totalPublicacoes} {totalPublicacoes === 1 ? 'publicação' : 'publicações'}
          </p>
        </div>
      </div>
    </div>
  )
}
