import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { usePushSubscription } from '@/lib/usePushSubscription'

function mockServiceWorker(overrides?: {
  subscription?: unknown
  subscribe?: ReturnType<typeof vi.fn>
}) {
  const mockGetSubscription = vi.fn().mockResolvedValue(overrides?.subscription ?? null)
  const mockSubscribe = overrides?.subscribe ?? vi.fn().mockResolvedValue({
    endpoint: 'https://fcm.googleapis.com/fcm/send/new',
    toJSON: () => ({ endpoint: 'https://fcm.googleapis.com/fcm/send/new', keys: { p256dh: 'k', auth: 'a' } }),
    unsubscribe: vi.fn(),
  })

  Object.defineProperty(navigator, 'serviceWorker', {
    value: {
      ready: Promise.resolve({
        pushManager: { getSubscription: mockGetSubscription, subscribe: mockSubscribe },
        active: { state: 'activated' },
      }),
      register: vi.fn().mockResolvedValue({}),
    },
    writable: true,
  })

  return { mockGetSubscription, mockSubscribe }
}

describe('usePushSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(window, 'Notification', {
      value: { permission: 'default', requestPermission: vi.fn().mockResolvedValue('granted') },
      writable: true,
    })
  })

  it('should initialize with correct default state', () => {
    mockServiceWorker()
    const { result } = renderHook(() => usePushSubscription())
    expect(typeof result.current.subscribe).toBe('function')
    expect(typeof result.current.unsubscribe).toBe('function')
  })

  it('should detect no subscription on mount', async () => {
    mockServiceWorker()
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ registered: false }) })

    const { result } = renderHook(() => usePushSubscription())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.isSubscribed).toBe(false)
  })

  it('should detect existing subscription verified by server', async () => {
    mockServiceWorker({
      subscription: { endpoint: 'https://fcm.googleapis.com/fcm/send/existing' },
    })
    global.fetch = vi.fn().mockResolvedValue({
      ok: true, json: () => Promise.resolve({ registered: true }),
    })

    const { result } = renderHook(() => usePushSubscription())
    await waitFor(() => {
      expect(result.current.isSubscribed).toBe(true)
    })
  })

  it('should return error when notification permission is denied', async () => {
    Object.defineProperty(window, 'Notification', {
      value: { permission: 'denied', requestPermission: vi.fn() },
      writable: true,
    })
    mockServiceWorker()

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === '/api/vapid-key') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ publicKey: 'test-key' }) })
      }
      if (url === '/api/subscribe/check') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ registered: false }) })
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    })

    const { result } = renderHook(() => usePushSubscription())
    await waitFor(() => { expect(result.current.isLoading).toBe(false) })

    const response = await result.current.subscribe()
    expect(response.success).toBe(false)
    expect(response.error).toContain('Permissão negada')
  })

  it('should subscribe successfully', async () => {
    mockServiceWorker()

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === '/api/vapid-key') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ publicKey: 'test-key' }) })
      }
      if (url === '/api/subscribe/check') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ registered: false }) })
      }
      if (url === '/api/subscribe') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ message: 'OK' }) })
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    })

    const { result } = renderHook(() => usePushSubscription())
    await waitFor(() => { expect(result.current.isLoading).toBe(false) })

    let response: { success: boolean; error?: string }
    await act(async () => {
      response = await result.current.subscribe()
    })
    expect(response!.success).toBe(true)

    await waitFor(() => {
      expect(result.current.isSubscribed).toBe(true)
    })
  })

  it('should unsubscribe successfully', async () => {
    const mockUnsubLocal = vi.fn().mockResolvedValue(undefined)
    mockServiceWorker({
      subscription: {
        endpoint: 'https://fcm.googleapis.com/fcm/send/active',
        unsubscribe: mockUnsubLocal,
        toJSON: () => ({
          endpoint: 'https://fcm.googleapis.com/fcm/send/active',
          keys: { p256dh: 'k', auth: 'a' },
        }),
      },
    })

    global.fetch = vi.fn().mockResolvedValue({
      ok: true, json: () => Promise.resolve({ registered: true }),
    })

    const { result } = renderHook(() => usePushSubscription())
    await waitFor(() => { expect(result.current.isSubscribed).toBe(true) })

    global.fetch = vi.fn().mockResolvedValue({
      ok: true, json: () => Promise.resolve({ message: 'OK' }),
    })

    await act(async () => {
      await result.current.unsubscribe()
    })

    await waitFor(() => {
      expect(result.current.isSubscribed).toBe(false)
    })
  })

  it('should handle VAPID key fetch error', async () => {
    mockServiceWorker()
    global.fetch = vi.fn().mockResolvedValue({
      ok: false, json: () => Promise.resolve({ error: 'VAPID not configured' }),
    })

    const { result } = renderHook(() => usePushSubscription())
    await waitFor(() => { expect(result.current.isLoading).toBe(false) })

    const response = await result.current.subscribe()
    expect(response.success).toBe(false)
    expect(response.error).toContain('VAPID')
  })

  it('should prevent double subscription', async () => {
    let resolveFirst: (value: unknown) => void
    const firstCall = new Promise((resolve) => { resolveFirst = resolve })

    mockServiceWorker({
      subscribe: vi.fn().mockReturnValue(firstCall),
    })

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === '/api/vapid-key') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ publicKey: 'test-key' }) })
      }
      if (url === '/api/subscribe/check') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ registered: false }) })
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    })

    const { result } = renderHook(() => usePushSubscription())
    await waitFor(() => { expect(result.current.isLoading).toBe(false) })

    act(() => { result.current.subscribe() })

    const response = await result.current.subscribe()
    expect(response.success).toBe(false)
    expect(response.error).toBe('Aguarde...')

    resolveFirst!({
      endpoint: 'https://fcm.send/new',
      toJSON: () => ({ endpoint: 'https://fcm.send/new', keys: { p256dh: 'k', auth: 'a' } }),
      unsubscribe: vi.fn(),
    })
  })
})
