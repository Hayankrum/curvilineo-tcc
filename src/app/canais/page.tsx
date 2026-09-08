import { obterSessao } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import CanalCard from '@/modules/canais/components/CanalCard'

export const metadata = {
  title: 'Canais',
}

export default async function CanaisPage() {
  const usuario = await obterSessao()

  const canais = await prisma.canal.findMany({
    where: { ativo: true },
    include: {
      _count: { select: { publicacoes: true } },
    },
    orderBy: { nome: 'asc' },
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          Canais
        </h1>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          Acompanhe as publicações dos canais institucionais
        </p>
      </div>

      {usuario?.isAdmin && (
        <div className="mb-6">
          <Link
            href="/canais/novo"
            className="btn-primary inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Novo canal
          </Link>
        </div>
      )}

      {canais.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Nenhum canal disponível
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {canais.map(canal => (
            <CanalCard
              key={canal.id}
              id={canal.id}
              nome={canal.nome}
              descricao={canal.descricao}
              totalPublicacoes={canal._count.publicacoes}
            />
          ))}
        </div>
      )}
    </div>
  )
}
