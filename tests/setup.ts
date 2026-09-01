import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock navigator.serviceWorker
Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    ready: Promise.resolve({
      pushManager: {
        getSubscription: vi.fn().mockResolvedValue(null),
        subscribe: vi.fn().mockResolvedValue({
          endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint',
          toJSON: () => ({
            endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint',
            keys: { p256dh: 'test-p256dh', auth: 'test-auth' },
          }),
          unsubscribe: vi.fn().mockResolvedValue(undefined),
        }),
      },
      active: { state: 'activated' },
      installing: null,
      waiting: null,
    }),
    register: vi.fn().mockResolvedValue({
      scope: '/',
      active: { state: 'activated' },
      pushManager: {
        getSubscription: vi.fn().mockResolvedValue(null),
        subscribe: vi.fn().mockResolvedValue({
          endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint',
          toJSON: () => ({
            endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint',
            keys: { p256dh: 'test-p256dh', auth: 'test-auth' },
          }),
          unsubscribe: vi.fn().mockResolvedValue(undefined),
        }),
      },
    }),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
  writable: true,
})

// Mock Notification API
Object.defineProperty(window, 'Notification', {
  value: {
    permission: 'default',
    requestPermission: vi.fn().mockResolvedValue('granted'),
  },
  writable: true,
})

// Mock PushManager
Object.defineProperty(window, 'PushManager', {
  value: class PushManager {},
  writable: true,
})

// Mock fetch globally
global.fetch = vi.fn()

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})
