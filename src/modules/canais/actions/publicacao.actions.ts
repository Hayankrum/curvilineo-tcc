'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getUsuarioLogado } from '@/modules/usuarios/usuarios.actions'
import { criarNotificacao } from '@/lib/notifications'

const MAX_TITULO = 200
const MAX_CONTEUDO = 5000
const MAX_TEXTO_OPCAO = 200
const MIN_OPCOES_ENQUETE = 2
const MAX_OPCOES_ENQUETE = 10

const TIPOS_VALIDOS = ['texto', 'evento', 'enquete']

function sanitizeInput(value: string): string {
  return value.replace(/[<>]/g, '').trim()
}

async function verificarAdmin() {
  const usuario = await getUsuarioLogado()
  if (!usuario) return { error: 'Você precisa estar logado' as const, usuario: null }
  if (!usuario.isAdmin) return { error: 'Apenas administradores podem criar publicações' as const, usuario: null }
  return { usuario, error: null as string | null }
}

async function notificarInscritosCanal(canalId: number, titulo: string, mensagem: string, url?: string) {
  try {
    const inscricoes = await prisma.notificacaoCanal.findMany({
      where: { canalId },
      select: { usuarioId: true },
    })

    await Promise.allSettled(
      inscricoes.map((inscricao) =>
        criarNotificacao({
          usuarioId: inscricao.usuarioId,
          titulo,
          mensagem,
          url,
          tipo: 'canal',
          canalId,
        })
      )
    )
  } catch (error) {
    console.error('[Publicação] Erro ao notificar inscritos do canal:', error)
  }
}

export async function criarPublicacao(
  canalId: number,
  tipo: string,
  dados: {
    titulo?: string
    conteudo?: string
    dataEvento?: string
    horaInicio?: string
    horaFim?: string
    localEvento?: string
    linkEvento?: string
    pergunta?: string
    opcoes?: string[]
    permiteMultiplaEscolha?: boolean
  }
) {
  const { error, usuario } = await verificarAdmin()
  if (error) return { error }

  if (!TIPOS_VALIDOS.includes(tipo)) return { error: 'Tipo de publicação inválido' }

  const canal = await prisma.canal.findUnique({ where: { id: canalId } })
  if (!canal) return { error: 'Canal não encontrado' }
  if (!canal.ativo) return { error: 'Este canal está inativo' }
  if (canal.autorId !== usuario!.id) return { error: 'Você não tem permissão para publicar neste canal' }

  if (tipo === 'texto') {
    const tituloClean = dados.titulo ? sanitizeInput(dados.titulo) : null
    const conteudoClean = dados.conteudo ? sanitizeInput(dados.conteudo) : null

    if (!conteudoClean || conteudoClean.length < 1) return { error: 'Conteúdo é obrigatório' }
    if (tituloClean && tituloClean.length > MAX_TITULO) return { error: `Título deve ter no máximo ${MAX_TITULO} caracteres` }
    if (conteudoClean.length > MAX_CONTEUDO) return { error: `Conteúdo deve ter no máximo ${MAX_CONTEUDO} caracteres` }

    const publicacao = await prisma.publicacao.create({
      data: {
        tipo: 'texto',
        titulo: tituloClean,
        conteudo: conteudoClean,
        canalId,
        autorId: usuario!.id,
      },
    })

    revalidatePath('/canais')
    revalidatePath(`/canais/${canalId}`)
    revalidatePath('/admin/canais')
    revalidatePath(`/admin/canais/${canalId}`)

    const tituloNotif = tituloClean || 'Nova publicação'
    const resumo = conteudoClean && conteudoClean.length > 100 ? conteudoClean.substring(0, 100) + '...' : conteudoClean
    await notificarInscritosCanal(canalId, tituloNotif, resumo || 'Nova publicação de texto no canal', `/canais/${canalId}`)

    return { success: true, publicacaoId: publicacao.id }
  }

  if (tipo === 'evento') {
    const tituloClean = sanitizeInput(dados.titulo || '')
    const descricaoClean = dados.conteudo ? sanitizeInput(dados.conteudo) : null
    const localClean = dados.localEvento ? sanitizeInput(dados.localEvento) : null

    if (!tituloClean || tituloClean.length < 3) return { error: 'Título do evento é obrigatório (mínimo 3 caracteres)' }
    if (tituloClean.length > MAX_TITULO) return { error: `Título deve ter no máximo ${MAX_TITULO} caracteres` }
    if (!dados.dataEvento) return { error: 'Data do evento é obrigatória' }
    if (!dados.horaInicio) return { error: 'Horário de início é obrigatório' }

    const dataEvento = new Date(dados.dataEvento)
    if (isNaN(dataEvento.getTime())) return { error: 'Data do evento inválida' }

    if (dados.linkEvento) {
      try {
        new URL(dados.linkEvento)
      } catch {
        return { error: 'Link do evento inválido' }
      }
    }

    const publicacao = await prisma.publicacao.create({
      data: {
        tipo: 'evento',
        titulo: tituloClean,
        conteudo: descricaoClean,
        canalId,
        autorId: usuario!.id,
        evento: {
          create: {
            data: dataEvento,
            horaInicio: dados.horaInicio,
            horaFim: dados.horaFim || null,
            local: localClean,
            link: dados.linkEvento || null,
          },
        },
      },
    })

    revalidatePath('/canais')
    revalidatePath(`/canais/${canalId}`)
    revalidatePath('/admin/canais')
    revalidatePath(`/admin/canais/${canalId}`)

    const dataFormatada = dataEvento.toLocaleDateString('pt-BR')
    await notificarInscritosCanal(canalId, `📅 Evento: ${tituloClean}`, `${tituloClean} em ${dataFormatada}`, `/canais/${canalId}`)

    return { success: true, publicacaoId: publicacao.id }
  }

  if (tipo === 'enquete') {
    const perguntaClean = sanitizeInput(dados.pergunta || '')
    if (!perguntaClean || perguntaClean.length < 3) return { error: 'Pergunta é obrigatória (mínimo 3 caracteres)' }

    if (!dados.opcoes || dados.opcoes.length < MIN_OPCOES_ENQUETE) {
      return { error: `Enquete deve ter pelo menos ${MIN_OPCOES_ENQUETE} opções` }
    }
    if (dados.opcoes.length > MAX_OPCOES_ENQUETE) {
      return { error: `Enquete deve ter no máximo ${MAX_OPCOES_ENQUETE} opções` }
    }

    const opcoesLimpa = dados.opcoes.map(o => sanitizeInput(o)).filter(o => o.length > 0)
    if (opcoesLimpa.length < MIN_OPCOES_ENQUETE) {
      return { error: 'Enquete deve ter pelo menos 2 opções válidas' }
    }

    const opcoesDuplicadas = new Set(opcoesLimpa.map(o => o.toLowerCase()))
    if (opcoesDuplicadas.size !== opcoesLimpa.length) {
      return { error: 'Opções da enquete não podem ser duplicadas' }
    }

    for (let i = 0; i < opcoesLimpa.length; i++) {
      if (opcoesLimpa[i].length > MAX_TEXTO_OPCAO) {
        return { error: `Opção ${i + 1} deve ter no máximo ${MAX_TEXTO_OPCAO} caracteres` }
      }
    }

    const publicacao = await prisma.publicacao.create({
      data: {
        tipo: 'enquete',
        titulo: perguntaClean,
        canalId,
        autorId: usuario!.id,
        enquete: {
          create: {
            permiteMultiplaEscolha: dados.permiteMultiplaEscolha || false,
            opcoes: {
              create: opcoesLimpa.map((texto, idx) => ({
                texto,
                ordem: idx + 1,
              })),
            },
          },
        },
      },
    })

    revalidatePath('/canais')
    revalidatePath(`/canais/${canalId}`)
    revalidatePath('/admin/canais')
    revalidatePath(`/admin/canais/${canalId}`)

    await notificarInscritosCanal(canalId, `📊 Enquete: ${perguntaClean}`, `Nova enquete no canal - vote agora!`, `/canais/${canalId}`)

    return { success: true, publicacaoId: publicacao.id }
  }

  return { error: 'Tipo de publicação inválido' }
}

export async function excluirPublicacao(id: number) {
  const { error, usuario } = await verificarAdmin()
  if (error) return { error }

  const publicacao = await prisma.publicacao.findUnique({ where: { id } })
  if (!publicacao) return { error: 'Publicação não encontrada' }
  if (publicacao.autorId !== usuario!.id) return { error: 'Você não tem permissão para excluir esta publicação' }

  const canalId = publicacao.canalId
  await prisma.publicacao.delete({ where: { id } })

  revalidatePath('/canais')
  revalidatePath(`/canais/${canalId}`)
  revalidatePath('/admin/canais')
  revalidatePath(`/admin/canais/${canalId}`)
  return { success: true }
}

export async function obterPublicacao(id: number) {
  return prisma.publicacao.findUnique({
    where: { id },
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
  })
}

export async function listarPublicacoesDoCanal(canalId: number, pagina: number = 1, porPagina: number = 20) {
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

export async function listarTodasPublicacoes(pagina: number = 1, porPagina: number = 20) {
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
