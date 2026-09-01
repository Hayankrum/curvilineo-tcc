import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET } from '@/app/api/posts/route'

const mockPrisma = vi.hoisted(() => ({
  post: {
    findMany: vi.fn(),
    count: vi.fn(),
  },
}))

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

function createMockRequest(url: string): Request {
  return new Request(url)
}

describe('GET /api/posts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma.post.findMany.mockReset()
    mockPrisma.post.count.mockReset()
  })

  it('should return paginated posts', async () => {
    const mockPosts = [
      { id: 1, titulo: 'Post 1', autor: { id: 1, nome: 'User', fotoUrl: null } },
      { id: 2, titulo: 'Post 2', autor: { id: 2, nome: 'User 2', fotoUrl: null } },
    ]
    mockPrisma.post.findMany.mockResolvedValue(mockPosts)
    mockPrisma.post.count.mockResolvedValue(2)

    const request = createMockRequest('http://localhost:3000/api/posts')
    const response = await GET(request as any)
    const data = await response.json()

    expect(data.posts).toHaveLength(2)
    expect(data.pagination.page).toBe(1)
    expect(data.pagination.limit).toBe(20)
    expect(data.pagination.total).toBe(2)
    expect(data.pagination.totalPages).toBe(1)
  })

  it('should respect page parameter', async () => {
    mockPrisma.post.findMany.mockResolvedValue([])
    mockPrisma.post.count.mockResolvedValue(50)

    const request = createMockRequest('http://localhost:3000/api/posts?page=2&limit=10')
    const response = await GET(request as any)
    const data = await response.json()

    expect(data.pagination.page).toBe(2)
    expect(data.pagination.limit).toBe(10)
    expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 })
    )
  })

  it('should cap limit at 50', async () => {
    mockPrisma.post.findMany.mockResolvedValue([])
    mockPrisma.post.count.mockResolvedValue(100)

    const request = createMockRequest('http://localhost:3000/api/posts?limit=100')
    const response = await GET(request as any)
    const data = await response.json()

    expect(data.pagination.limit).toBe(50)
  })

  it('should default to page 1 and limit 20', async () => {
    mockPrisma.post.findMany.mockResolvedValue([])
    mockPrisma.post.count.mockResolvedValue(0)

    const request = createMockRequest('http://localhost:3000/api/posts')
    const response = await GET(request as any)
    const data = await response.json()

    expect(data.pagination.page).toBe(1)
    expect(data.pagination.limit).toBe(20)
  })

  it('should calculate total pages correctly', async () => {
    mockPrisma.post.findMany.mockResolvedValue([])
    mockPrisma.post.count.mockResolvedValue(45)

    const request = createMockRequest('http://localhost:3000/api/posts?limit=20')
    const response = await GET(request as any)
    const data = await response.json()

    expect(data.pagination.totalPages).toBe(3)
  })
})
