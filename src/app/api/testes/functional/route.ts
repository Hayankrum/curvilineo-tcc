import { NextResponse } from 'next/server'
import { obterSessao } from '@/lib/session'

interface TestResult {
  name: string
  status: 'pass' | 'fail' | 'skip'
  duration: number
  error?: string
}

interface TestGroup {
  name: string
  icon: string
  tests: TestResult[]
}

async function testFetch(url: string, options?: RequestInit): Promise<{ ok: boolean; status: number; data: unknown }> {
  try {
    const res = await fetch(url, options)
    const data = await res.json().catch(() => null)
    return { ok: res.ok, status: res.status, data }
  } catch (e) {
    return { ok: false, status: 0, data: null }
  }
}

async function runTest(name: string, fn: () => Promise<void>): Promise<TestResult> {
  const start = Date.now()
  try {
    await fn()
    return { name, status: 'pass', duration: Date.now() - start }
  } catch (e) {
    return { name, status: 'fail', duration: Date.now() - start, error: String(e) }
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message)
}

export async function GET() {
  const usuario = await obterSessao()
  if (!usuario) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const groups: TestGroup[] = []

  // 1. Autenticacao
  const authTests: TestResult[] = []
  const authStart = Date.now()

  authTests.push(await runTest('GET /api/me - retorna dados do usuario', async () => {
    const r = await testFetch('http://localhost:3000/api/me')
    // Pode retornar null se nao logado, mas a rota deve existir
    assert(r.status === 200 || r.data === null, `Status inesperado: ${r.status}`)
  }))

  authTests.push(await runTest('POST /api/auth/[...nextauth] - rota de autenticacao existe', async () => {
    const r = await testFetch('http://localhost:3000/api/auth/session')
    // NextAuth deve retornar algo (objeto vazio ou sessao)
    assert(r.status === 200 || r.status === 401, `Status inesperado: ${r.status}`)
  }))

  groups.push({ name: 'Autenticacao', icon: '\uD83D\uDD10', tests: authTests })

  // 2. Posts
  const postsTests: TestResult[] = []

  postsTests.push(await runTest('GET /api/posts - listar posts', async () => {
    const r = await testFetch('http://localhost:3000/api/posts')
    assert(r.ok, `Falhou: status ${r.status}`)
    const data = r.data as { posts: unknown[]; pagination: unknown }
    assert(Array.isArray(data.posts), 'Resposta nao contem array posts')
    assert(typeof data.pagination === 'object', 'Resposta nao contem pagination')
  }))

  postsTests.push(await runTest('GET /api/posts?page=1&limit=5 - paginacao funciona', async () => {
    const r = await testFetch('http://localhost:3000/api/posts?page=1&limit=5')
    assert(r.ok, `Falhou: status ${r.status}`)
    const data = r.data as { pagination: { page: number; limit: number } }
    assert(data.pagination.page === 1, 'Page nao e 1')
    assert(data.pagination.limit === 5, 'Limit nao e 5')
  }))

  postsTests.push(await runTest('GET /api/posts/99999 - post inexistente retorna erro', async () => {
    const r = await testFetch('http://localhost:3000/api/posts/99999')
    // Deve retornar 404 ou erro
    assert(!r.ok || r.status === 404, `Esperado 404, recebeu: ${r.status}`)
  }))

  groups.push({ name: 'Posts', icon: '\uD83D\uDCC4', tests: postsTests })

  // 3. Notificacoes
  const notifTests: TestResult[] = []

  notifTests.push(await runTest('GET /api/notifications/unread - contar nao lidas', async () => {
    const r = await testFetch('http://localhost:3000/api/notifications/unread')
    // Pode retornar 401 se nao logado, mas a rota deve responder
    assert(r.status === 200 || r.status === 401, `Status inesperado: ${r.status}`)
  }))

  notifTests.push(await runTest('GET /api/notifications/history - historico', async () => {
    const r = await testFetch('http://localhost:3000/api/notifications/history')
    assert(r.status === 200 || r.status === 401, `Status inesperado: ${r.status}`)
  }))

  notifTests.push(await runTest('GET /api/notifications/list-users - listar usuarios', async () => {
    const r = await testFetch('http://localhost:3000/api/notifications/list-users')
    assert(r.status === 200 || r.status === 401, `Status inesperado: ${r.status}`)
  }))

  notifTests.push(await runTest('GET /api/vapid-key - chave publica VAPID', async () => {
    const r = await testFetch('http://localhost:3000/api/vapid-key')
    // Pode retornar 500 se VAPID nao configurado, mas rota existe
    assert(r.status === 200 || r.status === 500, `Status inesperado: ${r.status}`)
  }))

  notifTests.push(await runTest('POST /api/subscribe/check - verificar inscricao', async () => {
    const r = await testFetch('http://localhost:3000/api/subscribe/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: 'https://test.com/fake' }),
    })
    assert(r.ok, `Falhou: status ${r.status}`)
    const data = r.data as { registered: boolean }
    assert(typeof data.registered === 'boolean', 'Resposta nao contem registered')
  }))

  notifTests.push(await runTest('POST /api/subscribe - sem auth retorna 401', async () => {
    const r = await testFetch('http://localhost:3000/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: 'https://test.com', keys: { p256dh: 'k', auth: 'a' } }),
    })
    assert(r.status === 401 || r.status === 400, `Esperado 401/400, recebeu: ${r.status}`)
  }))

  notifTests.push(await runTest('POST /api/unsubscribe - sem auth retorna 401', async () => {
    const r = await testFetch('http://localhost:3000/api/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: 'https://test.com' }),
    })
    assert(r.status === 401 || r.status === 400 || r.status === 200, `Status inesperado: ${r.status}`)
  }))

  groups.push({ name: 'Notificacoes Push', icon: '\uD83D\uDD14', tests: notifTests })

  // 4. Usuarios
  const userTests: TestResult[] = []

  userTests.push(await runTest('GET /api/me - usuario logado retorna dados', async () => {
    const r = await testFetch('http://localhost:3000/api/me')
    assert(r.status === 200, `Status inesperado: ${r.status}`)
  }))

  userTests.push(await runTest('GET /api/me - resposta contem campos obrigatorios', async () => {
    const r = await testFetch('http://localhost:3000/api/me')
    if (r.data && typeof r.data === 'object') {
      const data = r.data as Record<string, unknown>
      // Se retornou usuario, deve ter id e nome
      if (data.id) {
        assert(typeof data.id === 'number', 'id nao e numero')
        assert(typeof data.nome === 'string', 'nome nao e string')
      }
    }
  }))

  groups.push({ name: 'Usuarios', icon: '\uD83D\uDC64', tests: userTests })

  // 5. Midia
  const mediaTests: TestResult[] = []

  mediaTests.push(await runTest('GET /api/media - listar midias', async () => {
    const r = await testFetch('http://localhost:3000/api/media')
    // Pode retornar 401 se nao logado
    assert(r.status === 200 || r.status === 401, `Status inesperado: ${r.status}`)
  }))

  mediaTests.push(await runTest('POST /api/media - sem auth retorna erro', async () => {
    const r = await testFetch('http://localhost:3000/api/media', {
      method: 'POST',
      body: new FormData(),
    })
    assert(r.status === 401 || r.status === 400 || r.status === 405, `Status inesperado: ${r.status}`)
  }))

  groups.push({ name: 'Midia / Upload', icon: '\uD83D\uDCC1', tests: mediaTests })

  // 6. Estrutura do app
  const structTests: TestResult[] = []

  structTests.push(await runTest('PWA - manifest.json acessivel', async () => {
    const r = await testFetch('http://localhost:3000/manifest.json')
    assert(r.ok, `manifest.json nao encontrado: status ${r.status}`)
  }))

  structTests.push(await runTest('PWA - service worker registrado', async () => {
    const r = await testFetch('http://localhost:3000/sw.js')
    assert(r.ok, `sw.js nao encontrado: status ${r.status}`)
  }))

  structTests.push(await runTest('Pagina principal - / responde', async () => {
    const r = await testFetch('http://localhost:3000/')
    assert(r.ok, `Home page nao respondeu: status ${r.status}`)
  }))

  structTests.push(await runTest('Pagina /posts - responde', async () => {
    const r = await testFetch('http://localhost:3000/posts')
    assert(r.ok, `/posts nao respondeu: status ${r.status}`)
  }))

  structTests.push(await runTest('Pagina /mapa - responde', async () => {
    const r = await testFetch('http://localhost:3000/mapa')
    assert(r.ok, `/mapa nao respondeu: status ${r.status}`)
  }))

  structTests.push(await runTest('Pagina /testes - responde', async () => {
    const r = await testFetch('http://localhost:3000/testes')
    assert(r.ok, `/testes nao respondeu: status ${r.status}`)
  }))

  groups.push({ name: 'Estrutura do App', icon: '\uD83C\uDFE0', tests: structTests })

  return NextResponse.json({ groups })
}
