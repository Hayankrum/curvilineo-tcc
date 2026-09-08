import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { obterSessao } from '@/lib/session'
import CanalHeader from '@/modules/canais/components/CanalHeader'
import Feed from '@/modules/canais/components/Feed'
import FormPublicacao from '@/modules/canais/components/FormPublicacao'
import BotaoNotificacaoCanal from '@/modules/canais/components/BotaoNotificacaoCanal'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const canal = await prisma.canal.findUnique({
    where: { id: Number(id) },
    select: { nome: true },
  })
  return { title: canal?.nome || 'Canal' }
}

export default async function CanalDetailPage({ params }: PageProps) {
  const { id } = await params
  const canalId = Number(id)

  if (isNaN(canalId)) notFound()

  const canal = await prisma.canal.findUnique({
    where: { id: canalId },
    include: {
      _count: { select: { publicacoes: true } },
    },
  })

  if (!canal || !canal.ativo) notFound()

  const usuario = await obterSessao()

  let inscritoCanal = false
  if (usuario) {
    const inscricao = await prisma.notificacaoCanal.findUnique({
      where: { usuarioId_canalId: { usuarioId: usuario.id, canalId } },
    })
    inscritoCanal = !!inscricao
  }

  const publicacoes = await prisma.publicacao.findMany({
    where: { canalId },
    include: {
      autor: { select: { id: true, nome: true } },
      canal: { select: { id: true, nome: true } },
      evento: true,
      enquete: {
        include: {
          opcoes: { orderBy: { ordem: 'asc' } },
          votos: true,
        },
      },
      reacoes: {
        include: { usuario: { select: { id: true, nome: true } } },
      },
    },
    orderBy: { criadoEm: 'desc' },
    take: 50,
  })

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-6">
        <CanalHeader
          nome={canal.nome}
          descricao={canal.descricao}
          totalPublicacoes={canal._count.publicacoes}
        />
        {usuario && (
          <div className="flex-shrink-0 mt-1">
            <BotaoNotificacaoCanal canalId={canal.id} inscritoInicial={inscritoCanal} />
          </div>
        )}
      </div>

      {usuario?.isAdmin && (
        <div className="mb-6">
          <FormPublicacao canalId={canal.id} canalNome={canal.nome} />
        </div>
      )}

      <Feed
        publicacoes={publicacoes}
        usuarioId={usuario?.id}
      />
    </div>
  )
}
