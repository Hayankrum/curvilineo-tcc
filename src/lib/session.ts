import { cookies, headers } from 'next/headers'
import { prisma } from './prisma'
import { signOut } from './auth'
import { getToken } from 'next-auth/jwt'

const SESSION_COOKIE = 'sessionToken'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 dias

async function isSecureConnection(): Promise<boolean> {
  if (process.env.NODE_ENV === 'production') {
    return process.env.PLATFORM === 'vercel' || process.env.FORCE_HTTPS === 'true'
  }
  const h = await headers()
  const proto = h.get('x-forwarded-proto')
  if (proto) return proto === 'https'
  const host = h.get('host') ?? ''
  return !host.startsWith('localhost') && !host.startsWith('127.')
}

export async function criarSessao(usuarioId: number): Promise<string> {
  const token = crypto.randomUUID()

  await prisma.sessao.create({
    data: {
      token,
      usuarioId,
      expiraEm: new Date(Date.now() + SESSION_MAX_AGE * 1000),
    },
  })

  const secure = await isSecureConnection()
  const cookieStore = await cookies()
  const cookieOptions: Record<string, unknown> = {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE,
    path: '/',
  }

  if (secure) {
    cookieOptions.secure = true
    cookieOptions.sameSite = 'lax'
  }

  cookieStore.set(SESSION_COOKIE, token, cookieOptions)
  return token
}

export async function obterSessao() {
  const cookieStore = await cookies()

  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (token) {
    const sessao = await prisma.sessao.findUnique({
      where: { token },
      include: { usuario: true },
    })
    if (sessao && sessao.expiraEm >= new Date()) return sessao.usuario
    if (sessao) await prisma.sessao.delete({ where: { token } })
  }

  try {
    const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ')
    const jwt = await getToken({
      req: { headers: { cookie: cookieHeader } },
      secret: process.env.AUTH_SECRET,
      secureCookie: await isSecureConnection(),
    })
    if (jwt?.email) {
      const usuario = await prisma.usuario.findUnique({ where: { email: jwt.email } })
      if (usuario) return usuario
    }
  } catch {
    return null
  }

  return null
}

export async function destruirSessao() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  if (token) {
    await prisma.sessao.deleteMany({ where: { token } })
    cookieStore.delete(SESSION_COOKIE)
  }

  try {
    await signOut({ redirect: false })
  } catch {
    // ignore - pode falhar se não existe sessão NextAuth
  }
}
