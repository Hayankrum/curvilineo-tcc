'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getUsuarioLogado } from '@/modules/usuarios/usuarios.actions'

const MAX_NOME_CANAL = 100
const MAX_DESCRICAO_CANAL = 500

function sanitizeInput(value: string): string {
  return value.replace(/[<>]/g, '').trim()
}

async function verificarAdmin() {
  const usuario = await getUsuarioLogado()
  if (!usuario) return { error: 'Você precisa estar logado' as const, usuario: null }
  if (!usuario.isAdmin) return { error: 'Apenas administradores podem acessar' as const, usuario: null }
  return { usuario, error: null as string | null }
}

export async function criarCanal(nome: string, descricao: string) {
  const { error, usuario } = await verificarAdmin()
  if (error) return { error }

  const nomeClean = sanitizeInput(nome)
  if (!nomeClean || nomeClean.length < 3) return { error: 'Nome deve ter pelo menos 3 caracteres' }
  if (nomeClean.length > MAX_NOME_CANAL) return { error: `Nome deve ter no máximo ${MAX_NOME_CANAL} caracteres` }

  const descricaoClean = sanitizeInput(descricao)
  if (descricaoClean.length > MAX_DESCRICAO_CANAL) return { error: `Descrição deve ter no máximo ${MAX_DESCRICAO_CANAL} caracteres` }

  const canal = await prisma.canal.create({
    data: {
      nome: nomeClean,
      descricao: descricaoClean || null,
      autorId: usuario!.id,
    },
  })

  revalidatePath('/canais')
  revalidatePath('/admin')
  redirect(`/canais/${canal.id}`)
}

export async function editarCanal(id: number, nome: string, descricao: string) {
  const { error, usuario } = await verificarAdmin()
  if (error) return { error }

  const canal = await prisma.canal.findUnique({ where: { id } })
  if (!canal) return { error: 'Canal não encontrado' }
  if (canal.autorId !== usuario!.id) return { error: 'Você não tem permissão para editar este canal' }

  const nomeClean = sanitizeInput(nome)
  if (!nomeClean || nomeClean.length < 3) return { error: 'Nome deve ter pelo menos 3 caracteres' }
  if (nomeClean.length > MAX_NOME_CANAL) return { error: `Nome deve ter no máximo ${MAX_NOME_CANAL} caracteres` }

  const descricaoClean = sanitizeInput(descricao)
  if (descricaoClean.length > MAX_DESCRICAO_CANAL) return { error: `Descrição deve ter no máximo ${MAX_DESCRICAO_CANAL} caracteres` }

  await prisma.canal.update({
    where: { id },
    data: {
      nome: nomeClean,
      descricao: descricaoClean || null,
    },
  })

  revalidatePath('/canais')
  revalidatePath(`/canais/${id}`)
  revalidatePath('/admin')
}

export async function toggleCanalAtivo(id: number) {
  const { error, usuario } = await verificarAdmin()
  if (error) return { error }

  const canal = await prisma.canal.findUnique({ where: { id } })
  if (!canal) return { error: 'Canal não encontrado' }
  if (canal.autorId !== usuario!.id) return { error: 'Você não tem permissão para alterar este canal' }

  await prisma.canal.update({
    where: { id },
    data: { ativo: !canal.ativo },
  })

  revalidatePath('/canais')
  revalidatePath(`/canais/${id}`)
  revalidatePath('/admin')
  return { success: true }
}

export async function excluirCanal(id: number) {
  const { error, usuario } = await verificarAdmin()
  if (error) return { error }

  const canal = await prisma.canal.findUnique({ where: { id } })
  if (!canal) return { error: 'Canal não encontrado' }
  if (canal.autorId !== usuario!.id) return { error: 'Você não tem permissão para excluir este canal' }

  await prisma.canal.delete({ where: { id } })
  revalidatePath('/canais')
  revalidatePath('/admin')
  redirect('/admin')
}

export async function obterCanal(id: number) {
  return prisma.canal.findUnique({
    where: { id },
    include: {
      autor: { select: { id: true, nome: true } },
      _count: { select: { publicacoes: true } },
    },
  })
}

export async function listarCanais() {
  return prisma.canal.findMany({
    where: { ativo: true },
    include: {
      autor: { select: { id: true, nome: true } },
      _count: { select: { publicacoes: true } },
    },
    orderBy: { nome: 'asc' },
  })
}

export async function listarCanaisAdmin() {
  const { error, usuario } = await verificarAdmin()
  if (error) return { canais: [], error }

  const canais = await prisma.canal.findMany({
    where: { autorId: usuario!.id },
    include: {
      _count: { select: { publicacoes: true } },
    },
    orderBy: { atualizadoEm: 'desc' },
  })

  return { canais, error: null }
}

// ---------- NOTIFICAÇÕES POR CANAL ----------

export async function toggleNotificacaoCanal(canalId: number) {
  const usuario = await getUsuarioLogado()
  if (!usuario) return { error: 'Você precisa estar logado' }

  const canal = await prisma.canal.findUnique({ where: { id: canalId } })
  if (!canal) return { error: 'Canal não encontrado' }

  const inscricaoExistente = await prisma.notificacaoCanal.findUnique({
    where: { usuarioId_canalId: { usuarioId: usuario.id, canalId } },
  })

  if (inscricaoExistente) {
    await prisma.notificacaoCanal.delete({
      where: { id: inscricaoExistente.id },
    })
    revalidatePath(`/canais/${canalId}`)
    return { inscrito: false }
  } else {
    await prisma.notificacaoCanal.create({
      data: { usuarioId: usuario.id, canalId },
    })
    revalidatePath(`/canais/${canalId}`)
    return { inscrito: true }
  }
}

export async function verificarInscricaoCanal(canalId: number) {
  const usuario = await getUsuarioLogado()
  if (!usuario) return { inscrito: false }

  const inscricao = await prisma.notificacaoCanal.findUnique({
    where: { usuarioId_canalId: { usuarioId: usuario.id, canalId } },
  })

  return { inscrito: !!inscricao }
}

export async function listarInscricoesCanais() {
  const usuario = await getUsuarioLogado()
  if (!usuario) return []

  const inscricoes = await prisma.notificacaoCanal.findMany({
    where: { usuarioId: usuario.id },
    select: { canalId: true },
  })

  return inscricoes.map((i) => i.canalId)
}
