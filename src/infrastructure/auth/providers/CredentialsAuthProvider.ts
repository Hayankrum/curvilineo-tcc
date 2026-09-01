import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import type {
  AuthProvider,
  AuthSession,
  LoginCredentials,
  RegisterData,
} from '../AuthProvider'

const SESSION_COOKIE = 'sessionToken'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days
const BCRYPT_SALT = 10
if (!process.env.AUTH_SECRET) {
  throw new Error('AUTH_SECRET não definido. Configure a variável de ambiente AUTH_SECRET.')
}
const JWT_SECRET = process.env.AUTH_SECRET

/**
 * Example CredentialsAuthProvider - JWT-based authentication
 * without NextAuth dependency.
 *
 * This provider can be used as a reference for implementing
 * alternative auth providers (e.g., custom JWT, OAuth2, etc.)
 */
export class CredentialsAuthProvider implements AuthProvider {
  async isSecureConnection(): Promise<boolean> {
    if (process.env.NODE_ENV === 'production') {
      return process.env.FORCE_HTTPS === 'true'
    }
    return false
  }

  async createSession(userId: number): Promise<string> {
    const token = jwt.sign({ userId }, JWT_SECRET, {
      expiresIn: SESSION_MAX_AGE,
    })

    const secure = await this.isSecureConnection()
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

  async getSession(): Promise<AuthSession | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value

    if (!token) return null

    try {
      const payload = jwt.verify(token, JWT_SECRET) as unknown as { userId: number }
      const usuario = await prisma.usuario.findUnique({
        where: { id: payload.userId },
      })

      if (!usuario) return null

      return this.mapUser(usuario)
    } catch {
      return null
    }
  }

  async destroySession(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete(SESSION_COOKIE)
  }

  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const usuario = await prisma.usuario.findUnique({
      where: { email: credentials.email },
    })

    if (!usuario) throw new Error('Email ou senha inválidos')

    if (!usuario.senha) {
      throw new Error(
        'Esta conta usa login com Google. Entre pela opção "Continuar com Google".'
      )
    }

    const senhaCorreta = await bcrypt.compare(credentials.password, usuario.senha)
    if (!senhaCorreta) throw new Error('Email ou senha inválidos')

    await this.createSession(usuario.id)
    return this.mapUser(usuario)
  }

  async register(data: RegisterData): Promise<AuthSession> {
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: data.email },
    })
    if (usuarioExistente) throw new Error('Esse email já está cadastrado')

    const senhaHash = await bcrypt.hash(data.senha, BCRYPT_SALT)
    const usuario = await prisma.usuario.create({
      data: {
        nome: data.nome,
        email: data.email,
        senha: senhaHash,
      },
    })

    await this.createSession(usuario.id)
    return this.mapUser(usuario)
  }

  async logout(): Promise<void> {
    await this.destroySession()
  }

  private mapUser(usuario: {
    id: number
    email: string
    nome: string
    bio?: string | null
    fotoUrl?: string | null
    notificacoesAtivas: boolean
    notificarComentarios: boolean
    notificarSistema: boolean
    criadoEm: Date
  }): AuthSession {
    return {
      user: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        bio: usuario.bio,
        fotoUrl: usuario.fotoUrl,
        notificacoesAtivas: usuario.notificacoesAtivas,
        notificarComentarios: usuario.notificarComentarios,
        notificarSistema: usuario.notificarSistema,
        criadoEm: usuario.criadoEm,
      },
    }
  }
}
