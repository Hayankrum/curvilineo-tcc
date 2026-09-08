import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const canais = await prisma.canal.findMany({
    where: { ativo: true },
    select: {
      id: true,
      nome: true,
      descricao: true,
    },
    orderBy: { nome: 'asc' },
  })

  return NextResponse.json(canais)
}
