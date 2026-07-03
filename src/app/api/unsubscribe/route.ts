import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { obterSessao } from '@/lib/session'

export async function POST(request: Request) {
  try {
    const usuario = await obterSessao()
    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { endpoint } = await request.json()

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint inválido' }, { status: 400 })
    }

    await prisma.inscricaoPush.deleteMany({
      where: {
        endpoint,
        usuarioId: usuario.id,
      },
    })

    return NextResponse.json({ message: 'Desinscrito com sucesso' })
  } catch (error) {
    console.error('[Unsubscribe] Error:', error)
    return NextResponse.json({ error: 'Erro ao desinscrever' }, { status: 500 })
  }
}
