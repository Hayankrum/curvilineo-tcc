import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { obterSessao } from '@/lib/session'

export async function POST(request: Request) {
  try {
    const usuario = await obterSessao()
    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { endpoint, keys } = await request.json()

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const inscricaoExistente = await prisma.inscricaoPush.findUnique({
      where: { endpoint },
    })

    if (inscricaoExistente) {
      if (inscricaoExistente.usuarioId !== usuario.id) {
        await prisma.inscricaoPush.delete({
          where: { endpoint },
        })
      } else {
        return NextResponse.json({ message: 'Já inscrito' })
      }
    }

    await prisma.inscricaoPush.create({
      data: {
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        usuarioId: usuario.id,
      },
    })

    return NextResponse.json({ message: 'Inscrito com sucesso' })
  } catch (error) {
    console.error('[Subscribe] Error:', error)
    return NextResponse.json({ error: 'Erro ao inscrever' }, { status: 500 })
  }
}
