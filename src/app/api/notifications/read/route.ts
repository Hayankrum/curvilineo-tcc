import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { obterSessao } from '@/lib/session'

export async function POST(request: Request) {
  try {
    const usuario = await obterSessao()
    if (!usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    await prisma.notificacao.updateMany({
      where: {
        id,
        usuarioId: usuario.id,
      },
      data: { lida: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Mark Read] Error:', error)
    return NextResponse.json({ error: 'Erro ao marcar como lida' }, { status: 500 })
  }
}
