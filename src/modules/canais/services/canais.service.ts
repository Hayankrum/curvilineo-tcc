import { prisma } from '@/lib/prisma'

export class CanalService {
  static async listarCanaisAtivos() {
    return prisma.canal.findMany({
      where: { ativo: true },
      include: {
        autor: { select: { id: true, nome: true } },
        _count: { select: { publicacoes: true } },
      },
      orderBy: { nome: 'asc' },
    })
  }

  static async obterCanal(id: number) {
    return prisma.canal.findUnique({
      where: { id },
      include: {
        autor: { select: { id: true, nome: true } },
        _count: { select: { publicacoes: true } },
      },
    })
  }

  static async listarPublicacoesDoCanal(canalId: number, pagina: number = 1, porPagina: number = 20) {
    const skip = (pagina - 1) * porPagina

    const [publicacoes, total] = await Promise.all([
      prisma.publicacao.findMany({
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
        skip,
        take: porPagina,
      }),
      prisma.publicacao.count({ where: { canalId } }),
    ])

    return {
      publicacoes,
      total,
      paginas: Math.ceil(total / porPagina),
      pagina,
    }
  }

  static async listarTodasPublicacoes(pagina: number = 1, porPagina: number = 20) {
    const skip = (pagina - 1) * porPagina

    const [publicacoes, total] = await Promise.all([
      prisma.publicacao.findMany({
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
        skip,
        take: porPagina,
      }),
      prisma.publicacao.count(),
    ])

    return {
      publicacoes,
      total,
      paginas: Math.ceil(total / porPagina),
      pagina,
    }
  }

  static async listarCanaisAdmin(autorId: number) {
    return prisma.canal.findMany({
      where: { autorId },
      include: {
        _count: { select: { publicacoes: true } },
      },
      orderBy: { atualizadoEm: 'desc' },
    })
  }
}
