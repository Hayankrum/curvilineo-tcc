import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { obterSessao } from '@/lib/session'
import webpush from 'web-push'

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!
const vapidEmail = process.env.VAPID_EMAIL!

webpush.setVapidDetails(
  vapidEmail,
  vapidPublicKey,
  vapidPrivateKey
)

export async function POST(request: Request) {
  try {
    const usuario = await obterSessao()
    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { titulo, mensagem, url } = await request.json()

    if (!titulo || !mensagem) {
      return NextResponse.json({ error: 'Título e mensagem são obrigatórios' }, { status: 400 })
    }

    const notificacao = await prisma.notificacao.create({
      data: {
        titulo,
        mensagem,
        url: url || null,
      },
    })

    const inscricoes = await prisma.inscricaoPush.findMany()

    const payload = JSON.stringify({
      title: titulo,
      body: mensagem,
      url: url || '/',
    })

    const results = await Promise.allSettled(
      inscricoes.map(async (inscricao) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: inscricao.endpoint,
              keys: {
                p256dh: inscricao.p256dh,
                auth: inscricao.auth,
              },
            },
            payload
          )
          return { success: true, id: inscricao.id }
        } catch (error: unknown) {
          const statusCode = (error as { statusCode?: number }).statusCode
          if (statusCode === 410 || statusCode === 404) {
            await prisma.inscricaoPush.delete({
              where: { id: inscricao.id },
            })
          }
          return { success: false, id: inscricao.id }
        }
      })
    )

    await prisma.notificacao.update({
      where: { id: notificacao.id },
      data: { enviadaEm: new Date() },
    })

    const enviadas = results.filter((r) => r.status === 'fulfilled' && r.value?.success).length
    const falhas = results.filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value?.success)).length

    return NextResponse.json({
      message: 'Notificação enviada',
      notificacaoId: notificacao.id,
      enviadas,
      falhas,
      total: inscricoes.length,
    })
  } catch (error) {
    console.error('[Send Notification] Error:', error)
    return NextResponse.json({ error: 'Erro ao enviar notificação' }, { status: 500 })
  }
}
