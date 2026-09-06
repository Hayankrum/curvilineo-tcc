'use server'

import { prisma } from '@/lib/prisma'
import { obterSessao } from '@/lib/session'
import { revalidatePath } from 'next/cache'

export interface CursosDisponiveis {
  id: number
  nome: string
  descricao: string | null
  duracao: number | null
  dataInicio: Date | null
  dataFim: Date | null
  anosDisponiveis: number[]
  criadoEm: Date
  turmas: {
    id: number
    nome: string
    dataInicio: Date
    dataFim: Date
  }[]
}

export async function listarCursos(): Promise<CursosDisponiveis[]> {
  const cursos = await prisma.curso.findMany({
    include: {
      turmas: {
        orderBy: { dataInicio: 'asc' }
      }
    },
    orderBy: { nome: 'asc' }
  })

  return cursos.map(c => ({
    ...c,
    anosDisponiveis: (Array.isArray(c.anosDisponiveis) ? c.anosDisponiveis : []) as number[]
  }))
}

export async function criarCurso(
  nome: string,
  descricao?: string,
  duracao?: number,
  dataInicio?: string | null,
  dataFim?: string | null,
  anosDisponiveis?: number[]
) {
  const usuario = await obterSessao()
  if (!usuario) return { error: 'Não autenticado' }
  if (!usuario.isAdmin) return { error: 'Sem permissão' }

  if (!nome || nome.trim().length === 0) {
    return { error: 'Nome do curso é obrigatório' }
  }

  await prisma.curso.create({
    data: {
      nome: nome.trim(),
      descricao: descricao?.trim() || null,
      duracao: duracao || null,
      dataInicio: dataInicio ? new Date(dataInicio) : null,
      dataFim: dataFim ? new Date(dataFim) : null,
      anosDisponiveis: JSON.parse(JSON.stringify(anosDisponiveis || []))
    }
  })

  revalidatePath('/cadastro')
  revalidatePath('/admin/cursos')
  return { success: 'Curso criado com sucesso' }
}

export async function criarTurma(
  cursoId: number,
  nome: string,
  dataInicio: string,
  dataFim: string
) {
  const usuario = await obterSessao()
  if (!usuario) return { error: 'Não autenticado' }
  if (!usuario.isAdmin) return { error: 'Sem permissão' }

  if (!nome || nome.trim().length === 0) {
    return { error: 'Nome da turma é obrigatório' }
  }
  if (!dataInicio || !dataFim) {
    return { error: 'Datas de início e fim são obrigatórias' }
  }

  const inicio = new Date(dataInicio)
  const fim = new Date(dataFim)

  if (fim <= inicio) {
    return { error: 'Data de fim deve ser posterior à data de início' }
  }

  const curso = await prisma.curso.findUnique({ where: { id: cursoId } })
  if (!curso) return { error: 'Curso não encontrado' }

  await prisma.turma.create({
    data: {
      nome: nome.trim(),
      dataInicio: inicio,
      dataFim: fim,
      cursoId
    }
  })

  revalidatePath('/cadastro')
  return { success: 'Turma criada com sucesso' }
}

export async function inscreverUsuario(
  turmaId: number,
  tipoUsuario: string
) {
  const usuario = await obterSessao()
  if (!usuario) return { error: 'Não autenticado' }

  const tiposValidos = ['discente', 'docente']
  if (!tiposValidos.includes(tipoUsuario)) {
    return { error: 'Tipo de usuário inválido' }
  }

  const turma = await prisma.turma.findUnique({
    where: { id: turmaId },
    include: {
      curso: {
        select: {
          id: true,
          nome: true,
          anosDisponiveis: true
        }
      }
    }
  })
  if (!turma) return { error: 'Turma não encontrada' }

  const agora = new Date()
  if (agora < turma.dataInicio) {
    return { error: 'Inscrições ainda não foram abertas para esta turma' }
  }
  if (agora > turma.dataFim) {
    return { error: 'Inscrições já foram encerradas para esta turma' }
  }

  const anoAtual = agora.getFullYear()
  const anosDisponiveis = (Array.isArray(turma.curso.anosDisponiveis) ? turma.curso.anosDisponiveis : []) as number[]

  if (anosDisponiveis && anosDisponiveis.length > 0) {
    if (!anosDisponiveis.includes(anoAtual)) {
      return { error: `Inscrições não estão disponíveis para o ano de ${anoAtual}. Anos disponíveis: ${anosDisponiveis.join(', ')}` }
    }
  }

  const inscricaoExistente = await prisma.inscricao.findUnique({
    where: {
      usuarioId_turmaId: {
        usuarioId: usuario.id,
        turmaId
      }
    }
  })

  if (inscricaoExistente) {
    return { error: 'Você já está inscrito nesta turma' }
  }

  await prisma.inscricao.create({
    data: {
      usuarioId: usuario.id,
      turmaId,
      tipoUsuario
    }
  })

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { tipoUsuario }
  })

  revalidatePath('/cadastro')
  revalidatePath('/usuarios/configuracoes')
  revalidatePath('/salas')
  return { success: 'Inscrição realizada com sucesso' }
}

export async function cancelarInscricao(inscricaoId: number) {
  const usuario = await obterSessao()
  if (!usuario) return { error: 'Não autenticado' }

  const inscricao = await prisma.inscricao.findUnique({
    where: { id: inscricaoId }
  })

  if (!inscricao) return { error: 'Inscrição não encontrada' }
  if (inscricao.usuarioId !== usuario.id && !usuario.isAdmin) {
    return { error: 'Sem permissão' }
  }

  await prisma.inscricao.update({
    where: { id: inscricaoId },
    data: { status: 'cancelada' }
  })

  revalidatePath('/cadastro')
  return { success: 'Inscrição cancelada' }
}

export async function listarInscricoesUsuario() {
  const usuario = await obterSessao()
  if (!usuario) return []

  return await prisma.inscricao.findMany({
    where: { usuarioId: usuario.id },
    include: {
      turma: {
        include: { curso: true }
      }
    },
    orderBy: { dataInscricao: 'desc' }
  })
}

export async function obterInscricoesTurma(turmaId: number) {
  const usuario = await obterSessao()
  if (!usuario) return []

  return await prisma.inscricao.findMany({
    where: { turmaId },
    include: {
      usuario: {
        select: {
          id: true,
          nome: true,
          email: true,
          tipoUsuario: true
        }
      }
    },
    orderBy: { dataInscricao: 'asc' }
  })
}

export async function verificarPermissao(feature: string): Promise<boolean> {
  const usuario = await obterSessao()
  if (!usuario) return false

  if (usuario.isAdmin) return true

  const permissoes: Record<string, string[]> = {
    'editar-post': ['discente', 'docente'],
    'criar-post': ['docente'],
    'responder-questionario': ['discente'],
    'criar-questionario': ['docente'],
    'visualizar-mapa': ['discente', 'docente'],
    'gerenciar-usuarios': ['docente']
  }

  const permissoesPermitidas = permissoes[feature] || []
  return permissoesPermitidas.includes(usuario.tipoUsuario)
}
