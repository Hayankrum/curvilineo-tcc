'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getUsuarioLogado } from '@/modules/usuarios/usuarios.actions'
import webpush from 'web-push'

export async function criarComentario(postId: number, texto: string) {
  const usuario = await getUsuarioLogado()
  if (!usuario) return { error: 'Você precisa estar logado para comentar' }

  if (!texto.trim()) return { error: 'O comentário não pode estar vazio' }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { autor: true },
  })
  if (!post) return { error: 'Post não encontrado' }

  await prisma.comentario.create({
    data: {
      texto: texto.trim(),
      postId,
      autorId: usuario.id,
    },
  })

  if (post.autorId !== usuario.id && post.autor.notificacoesAtivas) {
    await enviarNotificacao(post.autorId, {
      titulo: `${usuario.nome} comentou no seu post`,
      mensagem: texto.trim().slice(0, 100),
      url: `/posts/${postId}`,
    })
  }

  revalidatePath(`/posts/${postId}`)
  return { success: true }
}

export async function editarComentario(id: number, texto: string) {
  const usuario = await getUsuarioLogado()
  if (!usuario) return { error: 'Não autorizado' }

  if (!texto.trim()) return { error: 'O comentário não pode estar vazio' }

  const comentario = await prisma.comentario.findUnique({ where: { id } })
  if (!comentario) return { error: 'Comentário não encontrado' }
  if (comentario.autorId !== usuario.id) return { error: 'Você só pode editar seus próprios comentários' }

  await prisma.comentario.update({
    where: { id },
    data: { texto: texto.trim() },
  })

  revalidatePath(`/posts/${comentario.postId}`)
  return { success: true }
}

export async function deletarComentario(id: number) {
  const usuario = await getUsuarioLogado()
  if (!usuario) return { error: 'Não autorizado' }

  const comentario = await prisma.comentario.findUnique({ where: { id } })
  if (!comentario) return { error: 'Comentário não encontrado' }
  if (comentario.autorId !== usuario.id) return { error: 'Você só pode deletar seus próprios comentários' }

  await prisma.comentario.delete({ where: { id } })
  revalidatePath(`/posts/${comentario.postId}`)
  return { success: true }
}

async function enviarNotificacao(
  usuarioId: number,
  dados: { titulo: string; mensagem: string; url: string }
) {
  try {
    await prisma.notificacao.create({
      data: {
        titulo: dados.titulo,
        mensagem: dados.mensagem,
        url: dados.url,
        usuarioId,
      },
    })

    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
    const vapidEmail = process.env.VAPID_EMAIL

    if (!vapidPublicKey || !vapidPrivateKey || !vapidEmail) return

    webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey)

    const inscricoes = await prisma.inscricaoPush.findMany({
      where: { usuarioId },
    })

    if (inscricoes.length === 0) return

    const payload = JSON.stringify({
      title: dados.titulo,
      body: dados.mensagem,
      url: dados.url,
    })

    await Promise.allSettled(
      inscricoes.map(async (inscricao) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: inscricao.endpoint,
              keys: { p256dh: inscricao.p256dh, auth: inscricao.auth },
            },
            payload
          )
        } catch (error: unknown) {
          const statusCode = (error as { statusCode?: number }).statusCode
          if (statusCode === 410 || statusCode === 404) {
            await prisma.inscricaoPush.delete({ where: { id: inscricao.id } })
          }
        }
      })
    )
  } catch (error) {
    console.error('[Notificação] Error:', error)
  }
}
