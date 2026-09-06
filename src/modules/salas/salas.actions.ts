'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { obterSessao } from '@/lib/session'

// ---------- TYPES ----------

export interface SalaComInfo {
  id: number
  nome: string
  dataInicio: Date
  dataFim: Date
  criadoEm: Date
  curso: {
    id: number
    nome: string
    descricao: string | null
  }
  responsavel: {
    id: number
    nome: string
    email: string
  } | null
  _count: {
    inscricoes: number
    questionarios: number
  }
}

export interface SalaDetalhada extends SalaComInfo {
  inscricoes: {
    id: number
    tipoUsuario: string
    status: string
    dataInscricao: Date
    usuario: {
      id: number
      nome: string
      email: string
      tipoUsuario: string
    }
  }[]
  questionarios: {
    id: number
    titulo: string
    descricao: string | null
    status: string
    criadoEm: Date
    encerraEm: Date | null
    _count: {
      respostas: number
    }
  }[]
}

// ---------- LISTAR SALAS DO USUÁRIO ----------

export async function listarSalasDoUsuario(): Promise<SalaComInfo[]> {
  const usuario = await obterSessao()
  if (!usuario) return []

  const inscricoes = await prisma.inscricao.findMany({
    where: {
      usuarioId: usuario.id,
      status: 'ativa'
    },
    include: {
      turma: {
        include: {
          curso: {
            select: {
              id: true,
              nome: true,
              descricao: true
            }
          },
          responsavel: {
            select: {
              id: true,
              nome: true,
              email: true
            }
          },
          _count: {
            select: {
              inscricoes: true,
              questionarios: true
            }
          }
        }
      }
    },
    orderBy: {
      dataInscricao: 'desc'
    }
  })

  return inscricoes.map(inscricao => ({
    id: inscricao.turma.id,
    nome: inscricao.turma.nome,
    dataInicio: inscricao.turma.dataInicio,
    dataFim: inscricao.turma.dataFim,
    criadoEm: inscricao.turma.criadoEm,
    curso: inscricao.turma.curso,
    responsavel: inscricao.turma.responsavel,
    _count: inscricao.turma._count
  }))
}

// ---------- OBTER SALA ----------

export async function obterSala(salaId: number): Promise<SalaDetalhada | { error: string }> {
  const usuario = await obterSessao()
  if (!usuario) return { error: 'Você precisa estar logado' }

  const temAcesso = await verificarAcessoSala(salaId)
  if (!temAcesso) return { error: 'Você não tem acesso a esta sala' }

  const turma = await prisma.turma.findUnique({
    where: { id: salaId },
    include: {
      curso: {
        select: {
          id: true,
          nome: true,
          descricao: true
        }
      },
      responsavel: {
        select: {
          id: true,
          nome: true,
          email: true
        }
      },
      inscricoes: {
        where: { status: 'ativa' },
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
      },
      questionarios: {
        where: {
          status: { in: ['publicado', 'encerrado'] }
        },
        select: {
          id: true,
          titulo: true,
          descricao: true,
          status: true,
          criadoEm: true,
          encerraEm: true,
          _count: {
            select: {
              respostas: true
            }
          }
        },
        orderBy: { criadoEm: 'desc' }
      },
      _count: {
        select: {
          inscricoes: true,
          questionarios: true
        }
      }
    }
  })

  if (!turma) return { error: 'Sala não encontrada' }

  return turma
}

// ---------- VERIFICAR ACESSO ----------

export async function verificarAcessoSala(salaId: number): Promise<boolean> {
  const usuario = await obterSessao()
  if (!usuario) return false

  if (usuario.isAdmin) return true

  const turma = await prisma.turma.findUnique({
    where: { id: salaId },
    select: {
      dataInicio: true,
      dataFim: true
    }
  })

  if (!turma) return false

  const agora = new Date()
  const dentroDoPeriodo = agora >= turma.dataInicio && agora <= turma.dataFim

  if (!dentroDoPeriodo) return false

  const inscricao = await prisma.inscricao.findUnique({
    where: {
      usuarioId_turmaId: {
        usuarioId: usuario.id,
        turmaId: salaId
      }
    }
  })

  return inscricao?.status === 'ativa'
}

// ---------- VERIFICAR SE ESTA NO PERIODO ----------

export async function verificarPeriodoSala(salaId: number): Promise<{ dentroDoPeriodo: boolean; dataInicio: Date; dataFim: Date }> {
  const turma = await prisma.turma.findUnique({
    where: { id: salaId },
    select: {
      dataInicio: true,
      dataFim: true
    }
  })

  if (!turma) return { dentroDoPeriodo: false, dataInicio: new Date(), dataFim: new Date() }

  const agora = new Date()
  const dentroDoPeriodo = agora >= turma.dataInicio && agora <= turma.dataFim

  return {
    dentroDoPeriodo,
    dataInicio: turma.dataInicio,
    dataFim: turma.dataFim
  }
}

// ---------- VERIFICAR RESPONSÁVEL ----------

export async function verificarResponsavelSala(salaId: number): Promise<boolean> {
  const usuario = await obterSessao()
  if (!usuario) return false

  if (usuario.isAdmin) return true

  const turma = await prisma.turma.findUnique({
    where: { id: salaId },
    select: { responsavelId: true }
  })

  return turma?.responsavelId === usuario.id
}

// ---------- ADICIONAR MEMBRO ----------

export async function adicionarMembroSala(
  salaId: number,
  email: string,
  tipoUsuario: string = 'discente'
) {
  const usuario = await obterSessao()
  if (!usuario) return { error: 'Não autenticado' }

  const ehResponsavel = await verificarResponsavelSala(salaId)
  if (!ehResponsavel) return { error: 'Sem permissão para gerenciar esta sala' }

  const tiposValidos = ['discente', 'docente']
  if (!tiposValidos.includes(tipoUsuario)) {
    return { error: 'Tipo de usuário inválido' }
  }

  const turma = await prisma.turma.findUnique({ where: { id: salaId } })
  if (!turma) return { error: 'Sala não encontrada' }

  const usuarioAlvo = await prisma.usuario.findUnique({ where: { email } })
  if (!usuarioAlvo) return { error: 'Usuário não encontrado com este email' }

  const inscricaoExistente = await prisma.inscricao.findUnique({
    where: {
      usuarioId_turmaId: {
        usuarioId: usuarioAlvo.id,
        turmaId: salaId
      }
    }
  })

  if (inscricaoExistente) {
    if (inscricaoExistente.status === 'ativa') {
      return { error: 'Usuário já é membro desta sala' }
    }

    await prisma.inscricao.update({
      where: { id: inscricaoExistente.id },
      data: { status: 'ativa', tipoUsuario }
    })
  } else {
    await prisma.inscricao.create({
      data: {
        usuarioId: usuarioAlvo.id,
        turmaId: salaId,
        tipoUsuario
      }
    })
  }

  revalidatePath(`/salas/${salaId}`)
  return { success: `${usuarioAlvo.nome} adicionado à sala` }
}

// ---------- REMOVER MEMBRO ----------

export async function removerMembroSala(salaId: number, usuarioId: number) {
  const usuario = await obterSessao()
  if (!usuario) return { error: 'Não autenticado' }

  const ehResponsavel = await verificarResponsavelSala(salaId)
  if (!ehResponsavel) return { error: 'Sem permissão para gerenciar esta sala' }

  const inscricao = await prisma.inscricao.findUnique({
    where: {
      usuarioId_turmaId: {
        usuarioId,
        turmaId: salaId
      }
    },
    include: {
      usuario: {
        select: { nome: true }
      }
    }
  })

  if (!inscricao) return { error: 'Membro não encontrado nesta sala' }

  await prisma.inscricao.update({
    where: { id: inscricao.id },
    data: { status: 'cancelada' }
  })

  revalidatePath(`/salas/${salaId}`)
  return { success: `${inscricao.usuario.nome} removido da sala` }
}

// ---------- LISTAR MEMBROS ----------

export async function listarMembrosSala(salaId: number) {
  const usuario = await obterSessao()
  if (!usuario) return []

  const temAcesso = await verificarAcessoSala(salaId)
  if (!temAcesso) return []

  return await prisma.inscricao.findMany({
    where: {
      turmaId: salaId,
      status: 'ativa'
    },
    include: {
      usuario: {
        select: {
          id: true,
          nome: true,
          email: true,
          tipoUsuario: true,
          fotoUrl: true
        }
      }
    },
    orderBy: { dataInscricao: 'asc' }
  })
}

// ---------- TORNAR RESPONSÁVEL ----------

export async function tornarResponsavelSala(salaId: number, novoResponsavelId: number) {
  const usuario = await obterSessao()
  if (!usuario) return { error: 'Não autenticado' }

  if (!usuario.isAdmin) return { error: 'Sem permissão' }

  const turma = await prisma.turma.findUnique({ where: { id: salaId } })
  if (!turma) return { error: 'Sala não encontrada' }

  const novoResponsavel = await prisma.usuario.findUnique({ where: { id: novoResponsavelId } })
  if (!novoResponsavel) return { error: 'Usuário não encontrado' }

  const ehMembro = await prisma.inscricao.findUnique({
    where: {
      usuarioId_turmaId: {
        usuarioId: novoResponsavelId,
        turmaId: salaId
      }
    }
  })

  if (!ehMembro || ehMembro.status !== 'ativa') {
    return { error: 'O usuário precisa ser membro da sala para ser responsável' }
  }

  await prisma.turma.update({
    where: { id: salaId },
    data: { responsavelId: novoResponsavelId }
  })

  revalidatePath(`/salas/${salaId}`)
  return { success: `${novoResponsavel.nome} agora é responsável pela sala` }
}
