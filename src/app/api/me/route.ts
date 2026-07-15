import { NextResponse } from 'next/server'
import { obterSessao } from '@/lib/session'

export async function GET() {
  const usuario = await obterSessao()
  if (!usuario) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }
  return NextResponse.json({ id: usuario.id, temSenha: !!usuario.senha })
}
