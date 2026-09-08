import { obterSessao } from '@/lib/session'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = {
  title: 'Publicações - Admin',
}

function formatarData(data: Date) {
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function AdminPublicacoesPage() {
  const usuario = await obterSessao()
  if (!usuario || !usuario.isAdmin) redirect('/')

  const publicacoes = await prisma.publicacao.findMany({
    select: {
      id: true,
      titulo: true,
      conteudo: true,
      tipo: true,
      criadoEm: true,
      autor: { select: { id: true, nome: true } },
      canal: { select: { id: true, nome: true } },
      _count: { select: { reacoes: true } },
    },
    orderBy: { criadoEm: 'desc' },
    take: 100,
  })

  const tipoLabels: Record<string, string> = {
    texto: 'Texto',
    evento: 'Evento',
    enquete: 'Enquete',
  }

  const tipoCores: Record<string, string> = {
    texto: '#3b82f6',
    evento: '#8b5cf6',
    enquete: '#f59e0b',
  }

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-xs mb-3 hover:underline"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Voltar
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Publicações
          </h1>
          <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
            {publicacoes.length} publicações no sistema
          </p>
        </div>

        <div className="space-y-2">
          {publicacoes.length === 0 ? (
            <div className="card text-center py-8" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--input-border)' }}>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Nenhuma publicação encontrada
              </p>
            </div>
          ) : (
            publicacoes.map((pub) => (
              <div
                key={pub.id}
                className="card"
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--input-border)' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: `${tipoCores[pub.tipo]}20`, color: tipoCores[pub.tipo] }}
                      >
                        {tipoLabels[pub.tipo] || pub.tipo}
                      </span>
                      <Link
                        href={`/canais/${pub.canal.id}`}
                        className="text-[10px] hover:underline"
                        style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}
                      >
                        {pub.canal.nome}
                      </Link>
                    </div>
                    {pub.titulo && (
                      <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>
                        {pub.titulo}
                      </p>
                    )}
                    {pub.conteudo && (
                      <p className="text-[11px] line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                        {pub.conteudo}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                        por {pub.autor.nome}
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                        {formatarData(pub.criadoEm)}
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                        {pub._count.reacoes} reações
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
