import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const debug: Record<string, unknown> = {}

  debug.vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY ? 'SET (len: ' + process.env.VAPID_PUBLIC_KEY.length + ')' : 'MISSING',
    privateKey: process.env.VAPID_PRIVATE_KEY ? 'SET' : 'MISSING',
    email: process.env.VAPID_EMAIL || 'MISSING',
  }

  const inscricoes = await prisma.inscricaoPush.findMany({
    include: { usuario: { select: { id: true, nome: true, email: true } } },
  })
  debug.inscricoes = inscricoes.map((i) => ({
    id: i.id,
    usuarioId: i.usuarioId,
    usuario: i.usuario.nome,
    endpoint: i.endpoint.substring(0, 50) + '...',
    criadoEm: i.criadoEm,
  }))
  debug.totalInscricoes = inscricoes.length

  if (inscricoes.length > 0) {
    try {
      const webPushModule = await import('web-push')
      const webpush = webPushModule.default ?? webPushModule

      const vapidPublicKey = process.env.VAPID_PUBLIC_KEY
      const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
      const vapidEmail = process.env.VAPID_EMAIL

      if (!vapidPublicKey || !vapidPrivateKey || !vapidEmail) {
        debug.pushTest = 'VAPID keys missing'
      } else {
        webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey)

        const first = inscricoes[0]
        const result = await webpush.sendNotification(
          {
            endpoint: first.endpoint,
            keys: { p256dh: first.p256dh, auth: first.auth },
          },
          JSON.stringify({
            title: 'Teste de notificação',
            body: 'Se você está vendo isso, as notificações push estão funcionando!',
            url: '/',
          })
        )
        debug.pushTest = { success: true, statusCode: result.statusCode }
      }
    } catch (error: unknown) {
      const err = error as { message?: string; statusCode?: number; body?: string }
      debug.pushTest = {
        success: false,
        error: err.message,
        statusCode: err.statusCode,
        body: err.body,
      }
    }
  } else {
    debug.pushTest = 'Nenhuma inscrição encontrada - ative as notificações primeiro'
  }

  return NextResponse.json(debug, { spaces: 2 })
}
