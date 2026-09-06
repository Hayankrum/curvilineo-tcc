'use server'

import { prisma } from '@/lib/prisma'
import { obterSessao } from '@/lib/session'
import { revalidatePath } from 'next/cache'

// ---------- VERIFICAR ADMIN ----------

async function verificarAdmin() {
  const usuario = await obterSessao()
  if (!usuario) return { error: 'Não autenticado', usuario: null }
  if (!usuario.isAdmin) return { error: 'Sem permissão', usuario: null }
  return { error: null, usuario }
}

// ---------- TYPES ----------

export interface CursoAdmin {
  id: number
  nome: string
  descricao: string | null
  duracao: number | null
  dataInicio: Date | null
  dataFim: Date | null
  anosDisponiveis: number[]
  criadoEm: Date
  _count: {
    turmas: number
  }
}

export interface CursoDetalhado extends CursoAdmin {
  turmas: {
    id: number
    nome: string
    dataInicio: Date
    dataFim: Date
    responsavel: {
      id: number
      nome: string
    } | null
    _count: {
      inscricoes: number
    }
  }[]
}

export interface CursoSelect {
  id: number
  nome: string
  anosDisponiveis: number[]
}

function parseAnos(value: unknown): number[] {
  if (Array.isArray(value)) return value as number[]
  return []
}

// ---------- CURSOS ----------

export async function listarCursosAdmin(): Promise<CursoAdmin[]> {
  const { error } = await verificarAdmin()
  if (error) return []

  const cursos = await prisma.curso.findMany({
    include: {
      _count: {
        select: {
          turmas: true
        }
      }
    },
    orderBy: { nome: 'asc' }
  })

  return cursos.map(c => ({
    ...c,
    anosDisponiveis: parseAnos(c.anosDisponiveis)
  }))
}

export async function obterCursoAdmin(cursoId: number): Promise<CursoDetalhado | { error: string }> {
  const { error } = await verificarAdmin()
  if (error) return { error }

  const curso = await prisma.curso.findUnique({
    where: { id: cursoId },
    include: {
      turmas: {
        include: {
          responsavel: {
            select: {
              id: true,
              nome: true
            }
          },
          _count: {
            select: {
              inscricoes: true
            }
          }
        },
        orderBy: { dataInicio: 'desc' }
      },
      _count: {
        select: {
          turmas: true
        }
      }
    }
  })

  if (!curso) return { error: 'Curso não encontrado' }
  return {
    ...curso,
    anosDisponiveis: parseAnos(curso.anosDisponiveis)
  }
}

export async function criarCursoAdmin(
  nome: string,
  descricao?: string,
  duracao?: number,
  dataInicio?: string | null,
  dataFim?: string | null,
  anosDisponiveis?: number[]
) {
  const { error } = await verificarAdmin()
  if (error) return { error }

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

  revalidatePath('/admin/cursos')
  revalidatePath('/cadastro')
  return { success: 'Curso criado com sucesso' }
}

export async function atualizarCursoAdmin(
  cursoId: number,
  nome: string,
  descricao?: string,
  duracao?: number,
  dataInicio?: string | null,
  dataFim?: string | null,
  anosDisponiveis?: number[]
) {
  const { error } = await verificarAdmin()
  if (error) return { error }

  if (!nome || nome.trim().length === 0) {
    return { error: 'Nome do curso é obrigatório' }
  }

  const curso = await prisma.curso.findUnique({ where: { id: cursoId } })
  if (!curso) return { error: 'Curso não encontrado' }

  await prisma.curso.update({
    where: { id: cursoId },
    data: {
      nome: nome.trim(),
      descricao: descricao?.trim() || null,
      duracao: duracao || null,
      dataInicio: dataInicio ? new Date(dataInicio) : null,
      dataFim: dataFim ? new Date(dataFim) : null,
      anosDisponiveis: JSON.parse(JSON.stringify(anosDisponiveis || []))
    }
  })

  revalidatePath('/admin/cursos')
  revalidatePath('/cadastro')
  return { success: 'Curso atualizado com sucesso' }
}

export async function excluirCursoAdmin(cursoId: number) {
  const { error } = await verificarAdmin()
  if (error) return { error }

  const curso = await prisma.curso.findUnique({
    where: { id: cursoId },
    include: {
      _count: {
        select: {
          turmas: true
        }
      }
    }
  })

  if (!curso) return { error: 'Curso não encontrado' }

  if (curso._count.turmas > 0) {
    return { error: 'Não é possível excluir um curso com turmas vinculadas' }
  }

  await prisma.curso.delete({ where: { id: cursoId } })

  revalidatePath('/admin/cursos')
  revalidatePath('/cadastro')
  return { success: 'Curso excluído com sucesso' }
}

// ---------- SALAS (TURMAS) ----------

export interface SalaAdmin {
  id: number
  nome: string
  dataInicio: Date
  dataFim: Date
  criadoEm: Date
  curso: {
    id: number
    nome: string
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

export interface SalaDetalhadaAdmin extends SalaAdmin {
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
    status: string
    _count: {
      respostas: number
    }
  }[]
}

export async function listarSalasAdmin(): Promise<SalaAdmin[]> {
  const { error } = await verificarAdmin()
  if (error) return []

  return await prisma.turma.findMany({
    include: {
      curso: {
        select: {
          id: true,
          nome: true
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
    },
    orderBy: { criadoEm: 'desc' }
  })
}

export async function obterSalaAdmin(salaId: number): Promise<SalaDetalhadaAdmin | { error: string }> {
  const { error } = await verificarAdmin()
  if (error) return { error }

  const turma = await prisma.turma.findUnique({
    where: { id: salaId },
    include: {
      curso: {
        select: {
          id: true,
          nome: true
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
        select: {
          id: true,
          titulo: true,
          status: true,
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

export async function criarSalaAdmin(
  cursoId: number,
  nome: string,
  dataInicio: string,
  dataFim: string,
  responsavelId?: number | null
) {
  const { error } = await verificarAdmin()
  if (error) return { error }

  if (!nome || nome.trim().length === 0) {
    return { error: 'Nome da sala é obrigatório' }
  }
  if (!dataInicio || !dataFim) {
    return { error: 'Datas são obrigatórias' }
  }

  const inicio = new Date(dataInicio)
  const fim = new Date(dataFim)

  if (fim <= inicio) {
    return { error: 'Data de fim deve ser posterior à data de início' }
  }

  const curso = await prisma.curso.findUnique({ where: { id: cursoId } })
  if (!curso) return { error: 'Curso não encontrado' }

  if (responsavelId) {
    const responsavel = await prisma.usuario.findUnique({ where: { id: responsavelId } })
    if (!responsavel) return { error: 'Responsável não encontrado' }
  }

  const turma = await prisma.turma.create({
    data: {
      nome: nome.trim(),
      dataInicio: inicio,
      dataFim: fim,
      cursoId,
      responsavelId: responsavelId || null
    }
  })

  if (responsavelId) {
    const inscricaoExistente = await prisma.inscricao.findUnique({
      where: {
        usuarioId_turmaId: {
          usuarioId: responsavelId,
          turmaId: turma.id
        }
      }
    })

    if (!inscricaoExistente) {
      await prisma.inscricao.create({
        data: {
          usuarioId: responsavelId,
          turmaId: turma.id,
          tipoUsuario: 'docente'
        }
      })
    }
  }

  revalidatePath('/admin/salas')
  revalidatePath('/salas')
  return { success: 'Sala criada com sucesso', salaId: turma.id }
}

export async function atualizarSalaAdmin(
  salaId: number,
  nome: string,
  dataInicio: string,
  dataFim: string,
  responsavelId?: number | null
) {
  const { error } = await verificarAdmin()
  if (error) return { error }

  if (!nome || nome.trim().length === 0) {
    return { error: 'Nome da sala é obrigatório' }
  }
  if (!dataInicio || !dataFim) {
    return { error: 'Datas são obrigatórias' }
  }

  const inicio = new Date(dataInicio)
  const fim = new Date(dataFim)

  if (fim <= inicio) {
    return { error: 'Data de fim deve ser posterior à data de início' }
  }

  const turma = await prisma.turma.findUnique({ where: { id: salaId } })
  if (!turma) return { error: 'Sala não encontrada' }

  if (responsavelId) {
    const responsavel = await prisma.usuario.findUnique({ where: { id: responsavelId } })
    if (!responsavel) return { error: 'Responsável não encontrado' }
  }

  await prisma.turma.update({
    where: { id: salaId },
    data: {
      nome: nome.trim(),
      dataInicio: inicio,
      dataFim: fim,
      responsavelId: responsavelId || null
    }
  })

  if (responsavelId) {
    const inscricaoExistente = await prisma.inscricao.findUnique({
      where: {
        usuarioId_turmaId: {
          usuarioId: responsavelId,
          turmaId: salaId
        }
      }
    })

    if (!inscricaoExistente) {
      await prisma.inscricao.create({
        data: {
          usuarioId: responsavelId,
          turmaId: salaId,
          tipoUsuario: 'docente'
        }
      })
    } else if (inscricaoExistente.status !== 'ativa') {
      await prisma.inscricao.update({
        where: { id: inscricaoExistente.id },
        data: { status: 'ativa', tipoUsuario: 'docente' }
      })
    }
  }

  revalidatePath('/admin/salas')
  revalidatePath(`/salas/${salaId}`)
  return { success: 'Sala atualizada com sucesso' }
}

export async function excluirSalaAdmin(salaId: number) {
  const { error } = await verificarAdmin()
  if (error) return { error }

  const turma = await prisma.turma.findUnique({
    where: { id: salaId },
    include: {
      _count: {
        select: {
          inscricoes: true,
          questionarios: true
        }
      }
    }
  })

  if (!turma) return { error: 'Sala não encontrada' }

  if (turma._count.questionarios > 0) {
    return { error: 'Não é possível excluir uma sala com questionários vinculados' }
  }

  await prisma.inscricao.deleteMany({ where: { turmaId: salaId } })
  await prisma.turma.delete({ where: { id: salaId } })

  revalidatePath('/admin/salas')
  revalidatePath('/salas')
  return { success: 'Sala excluída com sucesso' }
}

// ---------- LISTAR USUÁRIOS PARA RESPONSÁVEL ----------

export async function listarUsuariosParaResponsavel() {
  const { error } = await verificarAdmin()
  if (error) return []

  return await prisma.usuario.findMany({
    select: {
      id: true,
      nome: true,
      email: true,
      tipoUsuario: true
    },
    orderBy: { nome: 'asc' }
  })
}

// ---------- LISTAR CURSOS PARA SELECT ----------

export async function listarCursosParaSelect(): Promise<CursoSelect[]> {
  const cursos = await prisma.curso.findMany({
    select: {
      id: true,
      nome: true,
      anosDisponiveis: true
    },
    orderBy: { nome: 'asc' }
  })

  return cursos.map(c => ({
    id: c.id,
    nome: c.nome,
    anosDisponiveis: parseAnos(c.anosDisponiveis)
  }))
}
