import { obterSessao } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import CanalForm from '@/modules/canais/components/CanalForm'
import FormPublicacao from '@/modules/canais/components/FormPublicacao'
import AdminCanalPanel, { AdminPublicacaoPanel } from '@/modules/canais/components/AdminCanalPanel'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const canal = await prisma.canal.findUnique({
    where: { id: Number(id) },
    select: { nome: true },
  })
  return { title: canal ? `${canal.nome} - Admin` : 'Canal' }
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

export default async function AdminCanalDetailPage({ params }: PageProps) {
  const { id } = await params
  const canalId = Number(id)

  if (isNaN(canalId)) notFound()

  const usuario = await obterSessao()
  if (!usuario || !usuario.isAdmin) redirect('/')

  const canal = await prisma.canal.findUnique({
    where: { id: canalId },
    include: {
      _count: { select: { publicacoes: true } },
    },
  })

  if (!canal || canal.autorId !== usuario.id) notFound()

  const publicacoes = await prisma.publicacao.findMany({
    where: { canalId },
    include: {
      autor: { select: { id: true, nome: true } },
      _count: { select: { reacoes: true } },
    },
    orderBy: { criadoEm: 'desc' },
  })

  const tipoLabels: Record<string, string> = {
    texto: 'Texto',
    evento: 'Evento',
    enquete: 'Enquete',
  }

  return (
    <div>
      <Link
        href="/admin/canais"
        className="inline-flex items-center gap-1 text-xs mb-3 hover:underline"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Canais
      </Link>

      <div className="mb-6 space-y-3">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {canal.nome}
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {canal._count.publicacoes} publicações
          </p>
        </div>
        <AdminCanalPanel canalId={canal.id} ativo={canal.ativo} />
      </div>

      <div className="space-y-6 lg:space-y-0 lg:grid lg:gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <CanalForm modo="editar" canal={canal} />
          <FormPublicacao canalId={canal.id} canalNome={canal.nome} />
        </div>

        <div>
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Publicações
          </h2>

          {publicacoes.length === 0 ? (
            <div className="card text-center py-8" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Nenhuma publicação ainda
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {publicacoes.map(pub => (
                <div
                  key={pub.id}
                  className="card"
                  style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                        >
                          {tipoLabels[pub.tipo] || pub.tipo}
                        </span>
                        <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                          {formatarData(pub.criadoEm)}
                        </span>
                      </div>
                      {pub.titulo && (
                        <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {pub.titulo}
                        </p>
                      )}
                      {pub.conteudo && (
                        <p className="text-[11px] truncate" style={{ color: 'var(--text-secondary)' }}>
                          {pub.conteudo}
                        </p>
                      )}
                      <p className="text-[10px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
                        {pub._count.reacoes} reações
                      </p>
                    </div>
                    <AdminPublicacaoPanel publicacaoId={pub.id} canalId={canal.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
