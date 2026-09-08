import Link from 'next/link'

interface CanalCardProps {
  id: number
  nome: string
  descricao?: string | null
  totalPublicacoes: number
}

export default function CanalCard({ id, nome, descricao, totalPublicacoes }: CanalCardProps) {
  return (
    <Link
      href={`/canais/${id}`}
      className="block card transition-all hover:scale-[1.01]"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
        textDecoration: 'none',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold"
          style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
        >
          {nome.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
            {nome}
          </h3>
          {descricao && (
            <p
              className="text-xs line-clamp-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              {descricao}
            </p>
          )}
          <p className="text-[10px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
            {totalPublicacoes} {totalPublicacoes === 1 ? 'publicação' : 'publicações'}
          </p>
        </div>
      </div>
    </Link>
  )
}
