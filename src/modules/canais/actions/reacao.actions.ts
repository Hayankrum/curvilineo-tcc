'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getUsuarioLogado } from '@/modules/usuarios/usuarios.actions'

const TIPOS_REACAO_VALIDOS = ['curtir', 'amor', 'surpresa', 'triste']

export async function toggleReacao(publicacaoId: number, tipo: string) {
  const usuario = await getUsuarioLogado()
  if (!usuario) return { error: 'Você precisa estar logado para reagir' }

  if (!TIPOS_REACAO_VALIDOS.includes(tipo)) return { error: 'Tipo de reação inválido' }

  const publicacao = await prisma.publicacao.findUnique({ where: { id: publicacaoId } })
  if (!publicacao) return { error: 'Publicação não encontrada' }

  const reacaoExistente = await prisma.reacao.findUnique({
    where: {
      publicacaoId_usuarioId: {
        publicacaoId,
        usuarioId: usuario.id,
      },
    },
  })

  if (reacaoExistente) {
    if (reacaoExistente.tipo === tipo) {
      await prisma.reacao.delete({ where: { id: reacaoExistente.id } })
      revalidatePath('/canais')
      revalidatePath(`/canais/${publicacao.canalId}`)
      return { success: true, removido: true }
    }

    await prisma.reacao.update({
      where: { id: reacaoExistente.id },
      data: { tipo },
    })
  } else {
    await prisma.reacao.create({
      data: {
        publicacaoId,
        usuarioId: usuario.id,
        tipo,
      },
    })
  }

  revalidatePath('/canais')
  revalidatePath(`/canais/${publicacao.canalId}`)
  return { success: true }
}

export async function obterReacoesPublicacao(publicacaoId: number) {
  const reacoes = await prisma.reacao.groupBy({
    by: ['tipo'],
    where: { publicacaoId },
    _count: { tipo: true },
  })

  const usuario = await getUsuarioLogado()
  let reacaoUsuario: string | null = null

  if (usuario) {
    const reacao = await prisma.reacao.findUnique({
      where: {
        publicacaoId_usuarioId: {
          publicacaoId,
          usuarioId: usuario.id,
        },
      },
      select: { tipo: true },
    })
    reacaoUsuario = reacao?.tipo ?? null
  }

  return {
    reacoes: reacoes.map(r => ({
      tipo: r.tipo,
      count: r._count.tipo,
    })),
    reacaoUsuario,
  }
}
