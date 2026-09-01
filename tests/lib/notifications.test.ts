import { describe, it, expect, beforeEach, vi } from 'vitest'
import { criarNotificacao } from '@/lib/notifications'

const mockPrisma = vi.hoisted(() => ({
  usuario: { findUnique: vi.fn() },
  notificacao: { create: vi.fn() },
  inscricaoPush: { findMany: vi.fn(), delete: vi.fn() },
}))

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

const mockSendNotification = vi.hoisted(() => vi.fn())
vi.mock('web-push', () => ({
  default: { setVapidDetails: vi.fn(), sendNotification: mockSendNotification },
}))

describe('criarNotificacao', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('VAPID_PUBLIC_KEY', 'test-key')
    vi.stubEnv('VAPID_PRIVATE_KEY', 'test-private')
    vi.stubEnv('VAPID_EMAIL', 'mailto:test@test.com')
  })

  it('should return undefined when user not found', async () => {
    mockPrisma.usuario.findUnique.mockResolvedValue(null)
    const result = await criarNotificacao({ usuarioId: 999, titulo: 'Test', mensagem: 'Msg' })
    expect(result).toBeUndefined()
  })

  it('should return undefined when notifications disabled', async () => {
    mockPrisma.usuario.findUnique.mockResolvedValue({
      id: 1, notificacoesAtivas: false, notificarComentarios: true, notificarSistema: true,
    })
    const result = await criarNotificacao({ usuarioId: 1, titulo: 'Test', mensagem: 'Msg' })
    expect(result).toBeUndefined()
  })

  it('should return undefined when comment notifications disabled', async () => {
    mockPrisma.usuario.findUnique.mockResolvedValue({
      id: 1, notificacoesAtivas: true, notificarComentarios: false, notificarSistema: true,
    })
    const result = await criarNotificacao({ usuarioId: 1, titulo: 'Test', mensagem: 'Msg', tipo: 'comentario' })
    expect(result).toBeUndefined()
  })

  it('should return undefined when system notifications disabled', async () => {
    mockPrisma.usuario.findUnique.mockResolvedValue({
      id: 1, notificacoesAtivas: true, notificarComentarios: true, notificarSistema: false,
    })
    const result = await criarNotificacao({ usuarioId: 1, titulo: 'Test', mensagem: 'Msg', tipo: 'sistema' })
    expect(result).toBeUndefined()
  })

  it('should create notification in database', async () => {
    mockPrisma.usuario.findUnique.mockResolvedValue({
      id: 1, notificacoesAtivas: true, notificarComentarios: true, notificarSistema: true,
    })
    mockPrisma.notificacao.create.mockResolvedValue({
      id: 1, titulo: 'Test', mensagem: 'Msg', url: '/test', lida: false, criadaEm: new Date(), usuarioId: 1,
    })
    mockPrisma.inscricaoPush.findMany.mockResolvedValue([])
    const result = await criarNotificacao({ usuarioId: 1, titulo: 'Test', mensagem: 'Msg', url: '/test' })
    expect(result).toBeDefined()
    expect(result?.id).toBe(1)
    expect(mockPrisma.notificacao.create).toHaveBeenCalled()
  })

  it('should send push notifications to all subscriptions', async () => {
    mockPrisma.usuario.findUnique.mockResolvedValue({
      id: 1, notificacoesAtivas: true, notificarComentarios: true, notificarSistema: true,
    })
    mockPrisma.notificacao.create.mockResolvedValue({
      id: 1, titulo: 'Test', mensagem: 'Msg', url: null, lida: false, criadaEm: new Date(), usuarioId: 1,
    })
    mockPrisma.inscricaoPush.findMany.mockResolvedValue([
      { id: 1, endpoint: 'https://fcm.send/ep1', p256dh: 'k1', auth: 'a1', usuarioId: 1 },
      { id: 2, endpoint: 'https://fcm.send/ep2', p256dh: 'k2', auth: 'a2', usuarioId: 1 },
    ])
    mockSendNotification.mockResolvedValue({})
    await criarNotificacao({ usuarioId: 1, titulo: 'Test', mensagem: 'Msg' })
    expect(mockSendNotification).toHaveBeenCalledTimes(2)
  })

  it('should remove expired subscriptions (404)', async () => {
    mockPrisma.usuario.findUnique.mockResolvedValue({
      id: 1, notificacoesAtivas: true, notificarComentarios: true, notificarSistema: true,
    })
    mockPrisma.notificacao.create.mockResolvedValue({
      id: 1, titulo: 'Test', mensagem: 'Msg', url: null, lida: false, criadaEm: new Date(), usuarioId: 1,
    })
    mockPrisma.inscricaoPush.findMany.mockResolvedValue([
      { id: 1, endpoint: 'https://fcm.send/expired', p256dh: 'k1', auth: 'a1', usuarioId: 1 },
    ])
    mockSendNotification.mockRejectedValue({ statusCode: 404 })
    mockPrisma.inscricaoPush.delete.mockResolvedValue({ id: 1 })
    await criarNotificacao({ usuarioId: 1, titulo: 'Test', mensagem: 'Msg' })
    expect(mockPrisma.inscricaoPush.delete).toHaveBeenCalledWith({ where: { id: 1 } })
  })

  it('should remove expired subscriptions (410)', async () => {
    mockPrisma.usuario.findUnique.mockResolvedValue({
      id: 1, notificacoesAtivas: true, notificarComentarios: true, notificarSistema: true,
    })
    mockPrisma.notificacao.create.mockResolvedValue({
      id: 1, titulo: 'Test', mensagem: 'Msg', url: null, lida: false, criadaEm: new Date(), usuarioId: 1,
    })
    mockPrisma.inscricaoPush.findMany.mockResolvedValue([
      { id: 2, endpoint: 'https://fcm.send/gone', p256dh: 'k1', auth: 'a1', usuarioId: 1 },
    ])
    mockSendNotification.mockRejectedValue({ statusCode: 410 })
    mockPrisma.inscricaoPush.delete.mockResolvedValue({ id: 2 })
    await criarNotificacao({ usuarioId: 1, titulo: 'Test', mensagem: 'Msg' })
    expect(mockPrisma.inscricaoPush.delete).toHaveBeenCalledWith({ where: { id: 2 } })
  })

  it('should handle non-404/410 push errors gracefully', async () => {
    mockPrisma.usuario.findUnique.mockResolvedValue({
      id: 1, notificacoesAtivas: true, notificarComentarios: true, notificarSistema: true,
    })
    mockPrisma.notificacao.create.mockResolvedValue({
      id: 1, titulo: 'Test', mensagem: 'Msg', url: null, lida: false, criadaEm: new Date(), usuarioId: 1,
    })
    mockPrisma.inscricaoPush.findMany.mockResolvedValue([
      { id: 1, endpoint: 'https://fcm.send/test', p256dh: 'k1', auth: 'a1', usuarioId: 1 },
    ])
    mockSendNotification.mockRejectedValue(new Error('Network error'))
    const result = await criarNotificacao({ usuarioId: 1, titulo: 'Test', mensagem: 'Msg' })
    expect(result).toBeDefined()
  })

  it('should handle missing VAPID env vars gracefully', async () => {
    delete process.env.VAPID_PUBLIC_KEY
    delete process.env.VAPID_PRIVATE_KEY
    delete process.env.VAPID_EMAIL
    mockPrisma.usuario.findUnique.mockResolvedValue({
      id: 1, notificacoesAtivas: true, notificarComentarios: true, notificarSistema: true,
    })
    mockPrisma.notificacao.create.mockResolvedValue({
      id: 1, titulo: 'Test', mensagem: 'Msg', url: null, lida: false, criadaEm: new Date(), usuarioId: 1,
    })
    mockPrisma.inscricaoPush.findMany.mockResolvedValue([
      { id: 1, endpoint: 'https://fcm.send/test', p256dh: 'k1', auth: 'a1', usuarioId: 1 },
    ])
    const result = await criarNotificacao({ usuarioId: 1, titulo: 'Test', mensagem: 'Msg' })
    expect(result).toBeDefined()
    expect(mockSendNotification).not.toHaveBeenCalled()
  })
})
