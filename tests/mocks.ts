import { vi } from 'vitest'

// Mock Prisma - must be before any imports
export const mockPrisma = {
  inscricaoPush: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
  notificacao: {
    create: vi.fn(),
    findMany: vi.fn(),
    updateMany: vi.fn(),
    count: vi.fn(),
  },
  usuario: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
}

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

// Mock session
export const mockUsuario = {
  id: 1,
  nome: 'Test User',
  email: 'test@example.com',
  notificacoesAtivas: true,
  notificarComentarios: true,
  notificarSistema: true,
}

export const mockObterSessao = vi.fn()

vi.mock('@/lib/session', () => ({
  obterSessao: (...args: unknown[]) => mockObterSessao(...args),
}))

// Helper to create mock Request
export function createMockRequest(body?: unknown, method = 'POST'): Request {
  return new Request('http://localhost:3000/api/test', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

// Helper to reset all mocks
export function resetMocks() {
  vi.clearAllMocks()
  mockObterSessao.mockReset()
  Object.values(mockPrisma.inscricaoPush).forEach(fn => fn.mockReset())
  Object.values(mockPrisma.notificacao).forEach(fn => fn.mockReset())
  Object.values(mockPrisma.usuario).forEach(fn => fn.mockReset())
}
