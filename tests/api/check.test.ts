import { describe, it, expect, beforeEach, vi } from 'vitest'
import { POST } from '@/app/api/subscribe/check/route'

const mockPrisma = vi.hoisted(() => ({
  inscricaoPush: { findUnique: vi.fn() },
}))

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

function createMockRequest(body?: unknown): Request {
  return new Request('http://localhost:3000/api/subscribe/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

describe('POST /api/subscribe/check', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma.inscricaoPush.findUnique.mockReset()
  })

  it('should return false when endpoint is missing', async () => {
    const request = createMockRequest({})
    const response = await POST(request)
    const data = await response.json()
    expect(data.registered).toBe(false)
  })

  it('should return true when endpoint exists', async () => {
    mockPrisma.inscricaoPush.findUnique.mockResolvedValue({ id: 1 })
    const request = createMockRequest({ endpoint: 'https://fcm.googleapis.com/fcm/send/existing' })
    const response = await POST(request)
    const data = await response.json()
    expect(data.registered).toBe(true)
  })

  it('should return false when endpoint does not exist', async () => {
    mockPrisma.inscricaoPush.findUnique.mockResolvedValue(null)
    const request = createMockRequest({ endpoint: 'https://fcm.googleapis.com/fcm/send/nope' })
    const response = await POST(request)
    const data = await response.json()
    expect(data.registered).toBe(false)
  })

  it('should handle database errors gracefully', async () => {
    mockPrisma.inscricaoPush.findUnique.mockRejectedValue(new Error('DB Error'))
    const request = createMockRequest({ endpoint: 'https://test.com' })
    const response = await POST(request)
    const data = await response.json()
    expect(data.registered).toBe(false)
  })
})
