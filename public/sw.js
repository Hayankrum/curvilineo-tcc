const CACHE_STATIC = 'static-v2'
const CACHE_PAGES = 'pages-v2'
const CACHE_API = 'api-v2'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => ![CACHE_STATIC, CACHE_PAGES, CACHE_API].includes(k))
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  )
})

// Network first para API, com fallback cache
async function networkFirstWithCache(request) {
  if (request.url.startsWith('chrome-extension://')) return fetch(request)
  const cache = await caches.open(CACHE_API)
  try {
    const response = await fetch(request)
    if (response && response.status === 200 && request.url.startsWith('http')) {
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached
    return new Response(JSON.stringify({ error: 'offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// Cache first para assets estáticos (JS, CSS, icons)
async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_STATIC)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('', { status: 503 })
  }
}

// Stale-while-revalidate para navegação (HTML pages)
async function navigationHandler(request) {
  const cache = await caches.open(CACHE_PAGES)
  const cached = await cache.match(request)

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        cache.put(request, response.clone())
      }
      return response
    })
    .catch(() => {
      // Offline e não tem cache → retorna página offline leve
      if (cached) return cached
      return caches.match('/offline')
    })

  // Retorna cache imediatamente se existe, senão espera a rede
  return cached || fetchPromise
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // API routes → network first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithCache(request))
    return
  }

  // Static assets → cache first
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.woff2')
  ) {
    event.respondWith(cacheFirst(request))
    return
  }

  // Navigation (HTML pages) → stale while revalidate
  if (request.mode === 'navigate') {
    event.respondWith(navigationHandler(request))
    return
  }

  // Outros → network first com cache
  event.respondWith(networkFirstWithCache(request))
})

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()

  const options = {
    body: data.body || data.mensagem,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'dismiss', title: 'Dispensar' },
    ],
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'dismiss') return

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-mutations') {
    event.waitUntil(syncPending())
  }
})

async function syncPending() {
  const clients_list = await self.clients.matchAll()
  for (const client of clients_list) {
    client.postMessage({ type: 'SYNC_MUTATIONS' })
  }
}
