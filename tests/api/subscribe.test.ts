import { describe, it, expect, beforeEach, vi } from 'vitest'
import { POST } from '@/app/api/subscribe/route'

const mockPrisma = vi.hoisted(() => ({
  inscricaoPush: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
}))

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

const mockObterSessao = vi.hoisted(() => vi.fn())
vi.mock('@/lib/session', () => ({ obterSessao: (...a: unknown[]) => mockObterSessao(...a) }))

const mockUsuario = {
  id: 1, nome: 'Test User', email: 'test@example.com',
  notificacoesAtivas: true, notificarComentarios: true, notificarSistema: true,
}

function createMockRequest(body?: unknown): Request {
  return new Request('http://localhost:3000/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

describe('POST /api/subscribe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockObterSessao.mockReset()
    Object.values(mockPrisma.inscricaoPush).forEach(fn => fn.mockReset())
  })

  it('should return 401 when not authenticated', async () => {
    mockObterSessao.mockResolvedValue(null)
    const request = createMockRequest({
      endpoint: 'https://fcm.googleapis.com/fcm/send/test',
      keys: { p256dh: 'test-p256dh', auth: 'test-auth' },
    })
    const response = await POST(request)
    const data = await response.json()
    expect(response.status).toBe(401)
    expect(data.error).toBe('Não autorizado')
  })

  it('should return 400 when endpoint is missing', async () => {
    mockObterSessao.mockResolvedValue(mockUsuario)
    const request = createMockRequest({ keys: { p256dh: 'test', auth: 'test' } })
    const response = await POST(request)
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.error).toBe('Endpoint inválido')
  })

  it('should return 400 when keys are missing', async () => {
    mockObterSessao.mockResolvedValue(mockUsuario)
    const request = createMockRequest({ endpoint: 'https://fcm.googleapis.com/fcm/send/test' })
    const response = await POST(request)
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.error).toBe('Chaves de criptografia inválidas')
  })

  it('should create subscription successfully', async () => {
    mockObterSessao.mockResolvedValue(mockUsuario)
    mockPrisma.inscricaoPush.findUnique.mockResolvedValue(null)
    mockPrisma.inscricaoPush.deleteMany.mockResolvedValue({ count: 0 })
    mockPrisma.inscricaoPush.create.mockResolvedValue({ id: 1 })
    const request = createMockRequest({
      endpoint: 'https://fcm.googleapis.com/fcm/send/new',
      keys: { p256dh: 'new-p256dh', auth: 'new-auth' },
    })
    const response = await POST(request)
    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data.message).toBe('Inscrito com sucesso')
    expect(mockPrisma.inscricaoPush.create).toHaveBeenCalled()
  })

  it('should update keys when endpoint exists for same user', async () => {
    mockObterSessao.mockResolvedValue(mockUsuario)
    mockPrisma.inscricaoPush.findUnique.mockResolvedValue({
      id: 1, endpoint: 'https://fcm.googleapis.com/fcm/send/existing', usuarioId: mockUsuario.id,
    })
    mockPrisma.inscricaoPush.update.mockResolvedValue({ id: 1 })
    const request = createMockRequest({
      endpoint: 'https://fcm.googleapis.com/fcm/send/existing',
      keys: { p256dh: 'updated', auth: 'updated' },
    })
    const response = await POST(request)
    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data.message).toBe('Inscrição atualizada com sucesso')
    expect(mockPrisma.inscricaoPush.update).toHaveBeenCalled()
  })

  it('should transfer endpoint from another user', async () => {
    mockObterSessao.mockResolvedValue(mockUsuario)
    mockPrisma.inscricaoPush.findUnique.mockResolvedValue({
      id: 2, endpoint: 'https://fcm.googleapis.com/fcm/send/other', usuarioId: 999,
    })
    mockPrisma.inscricaoPush.delete.mockResolvedValue({ id: 2 })
    mockPrisma.inscricaoPush.deleteMany.mockResolvedValue({ count: 0 })
    mockPrisma.inscricaoPush.create.mockResolvedValue({ id: 3 })
    const request = createMockRequest({
      endpoint: 'https://fcm.googleapis.com/fcm/send/other',
      keys: { p256dh: 'key', auth: 'auth' },
    })
    const response = await POST(request)
    expect(response.status).toBe(200)
    expect(mockPrisma.inscricaoPush.delete).toHaveBeenCalled()
  })

  it('should handle database errors', async () => {
    mockObterSessao.mockResolvedValue(mockUsuario)
    mockPrisma.inscricaoPush.findUnique.mockRejectedValue(new Error('DB Error'))
    const request = createMockRequest({
      endpoint: 'https://fcm.googleapis.com/fcm/send/test',
      keys: { p256dh: 'test', auth: 'test' },
    })
    const response = await POST(request)
    const data = await response.json()
    expect(response.status).toBe(500)
    expect(data.error).toBe('Erro ao inscrever')
  })
})
