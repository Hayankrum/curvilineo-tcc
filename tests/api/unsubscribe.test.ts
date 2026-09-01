import { describe, it, expect, beforeEach, vi } from 'vitest'
import { POST } from '@/app/api/unsubscribe/route'

const mockPrisma = vi.hoisted(() => ({
  inscricaoPush: { deleteMany: vi.fn() },
}))

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

const mockObterSessao = vi.hoisted(() => vi.fn())
vi.mock('@/lib/session', () => ({ obterSessao: (...a: unknown[]) => mockObterSessao(...a) }))

const mockUsuario = { id: 1, nome: 'Test', email: 'test@test.com' }

function createMockRequest(body?: unknown): Request {
  return new Request('http://localhost:3000/api/unsubscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

describe('POST /api/unsubscribe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockObterSessao.mockReset()
    mockPrisma.inscricaoPush.deleteMany.mockReset()
  })

  it('should return 401 when not authenticated', async () => {
    mockObterSessao.mockResolvedValue(null)
    const request = createMockRequest({ endpoint: 'https://test.com' })
    const response = await POST(request)
    const data = await response.json()
    expect(response.status).toBe(401)
  })

  it('should return 400 when endpoint is missing', async () => {
    mockObterSessao.mockResolvedValue(mockUsuario)
    const request = createMockRequest({})
    const response = await POST(request)
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.error).toBe('Endpoint inválido')
  })

  it('should delete subscription successfully', async () => {
    mockObterSessao.mockResolvedValue(mockUsuario)
    mockPrisma.inscricaoPush.deleteMany.mockResolvedValue({ count: 1 })
    const request = createMockRequest({ endpoint: 'https://fcm.googleapis.com/fcm/send/test' })
    const response = await POST(request)
    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data.message).toBe('Desinscrito com sucesso')
  })

  it('should handle database errors', async () => {
    mockObterSessao.mockResolvedValue(mockUsuario)
    mockPrisma.inscricaoPush.deleteMany.mockRejectedValue(new Error('DB Error'))
    const request = createMockRequest({ endpoint: 'https://test.com' })
    const response = await POST(request)
    const data = await response.json()
    expect(response.status).toBe(500)
  })
})
