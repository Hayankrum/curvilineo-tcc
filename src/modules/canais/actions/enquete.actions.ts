'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getUsuarioLogado } from '@/modules/usuarios/usuarios.actions'

export async function votarEnquete(enqueteId: number, opcaoId: number) {
  const usuario = await getUsuarioLogado()
  if (!usuario) return { error: 'Você precisa estar logado para votar' }

  const enquete = await prisma.enquete.findUnique({
    where: { id: enqueteId },
    include: {
      opcoes: true,
      publicacao: { select: { canalId: true } },
    },
  })

  if (!enquete) return { error: 'Enquete não encontrada' }

  const opcao = enquete.opcoes.find(o => o.id === opcaoId)
  if (!opcao) return { error: 'Opção inválida' }

  if (!enquete.permiteMultiplaEscolha) {
    const votoExistente = await prisma.voto.findUnique({
      where: {
        enqueteId_usuarioId: {
          enqueteId,
          usuarioId: usuario.id,
        },
      },
    })

    if (votoExistente) {
      if (votoExistente.opcaoId === opcaoId) {
        await prisma.voto.delete({ where: { id: votoExistente.id } })
        revalidatePath('/canais')
        revalidatePath(`/canais/${enquete.publicacao.canalId}`)
        return { success: true, removido: true }
      }

      await prisma.voto.update({
        where: { id: votoExistente.id },
        data: { opcaoId },
      })
      revalidatePath('/canais')
      revalidatePath(`/canais/${enquete.publicacao.canalId}`)
      return { success: true, atualizado: true }
    }
  } else {
    const votoExistente = await prisma.voto.findUnique({
      where: {
        enqueteId_usuarioId: {
          enqueteId,
          usuarioId: usuario.id,
        },
      },
    })

    if (votoExistente && votoExistente.opcaoId === opcaoId) {
      await prisma.voto.delete({ where: { id: votoExistente.id } })
      revalidatePath('/canais')
      revalidatePath(`/canais/${enquete.publicacao.canalId}`)
      return { success: true, removido: true }
    }
  }

  if (!enquete.permiteMultiplaEscolha) {
    await prisma.voto.upsert({
      where: {
        enqueteId_usuarioId: {
          enqueteId,
          usuarioId: usuario.id,
        },
      },
      update: { opcaoId },
      create: {
        enqueteId,
        opcaoId,
        usuarioId: usuario.id,
      },
    })
  } else {
    const votoExistente = await prisma.voto.findFirst({
      where: {
        enqueteId,
        usuarioId: usuario.id,
        opcaoId,
      },
    })

    if (!votoExistente) {
      await prisma.voto.create({
        data: {
          enqueteId,
          opcaoId,
          usuarioId: usuario.id,
        },
      })
    }
  }

  revalidatePath('/canais')
  revalidatePath(`/canais/${enquete.publicacao.canalId}`)
  return { success: true }
}

export async function obterResultadosEnquete(enqueteId: number) {
  const enquete = await prisma.enquete.findUnique({
    where: { id: enqueteId },
    include: {
      opcoes: {
        include: {
          _count: { select: { votos: true } },
        },
        orderBy: { ordem: 'asc' },
      },
      _count: { select: { votos: true } },
    },
  })

  if (!enquete) return null

  const totalVotos = enquete._count.votos

  return {
    id: enquete.id,
    permiteMultiplaEscolha: enquete.permiteMultiplaEscolha,
    totalVotos,
    opcoes: enquete.opcoes.map(opcao => ({
      id: opcao.id,
      texto: opcao.texto,
      ordem: opcao.ordem,
      votos: opcao._count.votos,
      percentual: totalVotos > 0 ? Math.round((opcao._count.votos / totalVotos) * 100) : 0,
    })),
  }
}

export async function obterVotoDoUsuario(enqueteId: number) {
  const usuario = await getUsuarioLogado()
  if (!usuario) return null

  const votos = await prisma.voto.findMany({
    where: {
      enqueteId,
      usuarioId: usuario.id,
    },
    select: { opcaoId: true },
  })

  return votos.map(v => v.opcaoId)
}
