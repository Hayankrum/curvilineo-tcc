import { NextResponse } from 'next/server'
import { obterSessao } from '@/lib/session'

export async function GET() {
  const usuario = await obterSessao()
  if (!usuario) {
    return NextResponse.json(null)
  }
  return NextResponse.json({
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    bio: usuario.bio,
    fotoUrl: usuario.fotoUrl,
  })
}
