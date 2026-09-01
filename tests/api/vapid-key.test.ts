import { describe, it, expect, beforeEach } from 'vitest'
import { GET } from '@/app/api/vapid-key/route'

describe('GET /api/vapid-key', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  it('should return VAPID public key when configured', async () => {
    process.env.VAPID_PUBLIC_KEY = 'test-vapid-public-key'
    const response = await GET()
    const data = await response.json()
    expect(data.publicKey).toBe('test-vapid-public-key')
  })

  it('should return 500 when VAPID key is not configured', async () => {
    delete process.env.VAPID_PUBLIC_KEY
    const response = await GET()
    const data = await response.json()
    expect(response.status).toBe(500)
    expect(data.error).toBe('VAPID key not configured')
  })

  it('should return 500 when VAPID key is empty', async () => {
    process.env.VAPID_PUBLIC_KEY = ''
    const response = await GET()
    const data = await response.json()
    expect(response.status).toBe(500)
  })
})
