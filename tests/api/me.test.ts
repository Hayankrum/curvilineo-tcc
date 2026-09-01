import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET } from '@/app/api/me/route'

const mockPrisma = vi.hoisted(() => ({
  usuario: { findUnique: vi.fn() },
}))

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

const mockObterSessao = vi.hoisted(() => vi.fn())
vi.mock('@/lib/session', () => ({ obterSessao: (...a: unknown[]) => mockObterSessao(...a) }))

describe('GET /api/me', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockObterSessao.mockReset()
    mockPrisma.usuario.findUnique.mockReset()
  })

  it('should return null when not authenticated', async () => {
    mockObterSessao.mockResolvedValue(null)
    const response = await GET()
    const data = await response.json()
    expect(data).toBeNull()
  })

  it('should return user data when authenticated', async () => {
    mockObterSessao.mockResolvedValue({ id: 1 })
    mockPrisma.usuario.findUnique.mockResolvedValue({
      id: 1,
      nome: 'Test User',
      email: 'test@test.com',
      bio: 'Hello',
      fotoUrl: null,
      senha: null,
      notificarComentarios: true,
      notificarSistema: true,
    })

    const response = await GET()
    const data = await response.json()

    expect(data.id).toBe(1)
    expect(data.nome).toBe('Test User')
    expect(data.email).toBe('test@test.com')
    expect(data.bio).toBe('Hello')
    expect(data.temSenha).toBe(false)
  })

  it('should return temSenha true when password exists', async () => {
    mockObterSessao.mockResolvedValue({ id: 1 })
    mockPrisma.usuario.findUnique.mockResolvedValue({
      id: 1,
      nome: 'Test',
      email: 'test@test.com',
      bio: null,
      fotoUrl: null,
      senha: 'hashed-password',
      notificarComentarios: false,
      notificarSistema: false,
    })

    const response = await GET()
    const data = await response.json()

    expect(data.temSenha).toBe(true)
  })

  it('should return null when user not found in database', async () => {
    mockObterSessao.mockResolvedValue({ id: 999 })
    mockPrisma.usuario.findUnique.mockResolvedValue(null)

    const response = await GET()
    const data = await response.json()

    expect(data).toBeNull()
  })
})
