import { openDB, type IDBPDatabase } from 'idb'

// ---------- Types ----------

interface Usuario {
  id: number
  nome: string
  email: string
  bio: string | null
  fotoUrl: string | null
}

interface PendingMutation {
  id?: number
  url: string
  method: string
  body: string
  createdAt: number
}

interface CachedQuestionario {
  id: number
  titulo: string
  descricao: string | null
  anonimo: boolean
  corTema: string | null
  encerraEm: string | null
  perguntas: CachedPergunta[]
  cachedAt: number
}

interface CachedPergunta {
  id: number
  texto: string
  tipo: string
  obrigatoria: boolean
  ordem: number
  opcoes: { id: number; texto: string; ordem: number; correta: boolean }[]
  configEscala: { min: number; max: number; passo: number } | null
}

interface PendingResposta {
  id?: number
  questionarioId: number
  syncId: string
  valores: Array<{
    perguntaId: number
    tipo: string
    texto: string | null
    opcaoId: number | null
    opcaoIds: number[]
    valorNumerico: number | null
  }>
  nomeAnonimo?: string
  isEdicao: boolean
  respostaId?: number
  createdAt: number
}

// ---------- DB ----------

let dbPromise: Promise<IDBPDatabase> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB('meu-app-db', 2, {
      upgrade(db) {
        // Store: usuario (always present)
        if (!db.objectStoreNames.contains('usuario')) {
          db.createObjectStore('usuario', { keyPath: 'id' })
        }

        // Store: pendingMutations (v1)
        if (!db.objectStoreNames.contains('pendingMutations')) {
          const store = db.createObjectStore('pendingMutations', {
            keyPath: 'id',
            autoIncrement: true,
          })
          store.createIndex('createdAt', 'createdAt')
        }

        // Store: questionarios (v2 - offline cache)
        if (!db.objectStoreNames.contains('questionarios')) {
          db.createObjectStore('questionarios', { keyPath: 'id' })
        }

        // Store: pendingRespostas (v2 - offline response queue)
        if (!db.objectStoreNames.contains('pendingRespostas')) {
          const store = db.createObjectStore('pendingRespostas', {
            keyPath: 'id',
            autoIncrement: true,
          })
          store.createIndex('createdAt', 'createdAt')
          store.createIndex('questionarioId', 'questionarioId')
        }
      },
    })
  }
  return dbPromise
}

// ---------- Usuario ----------

export async function cacheUsuario(usuario: Usuario) {
  const db = await getDB()
  await db.put('usuario', usuario)
}

export async function getCachedUsuario(): Promise<Usuario | undefined> {
  const db = await getDB()
  const all = await db.getAll('usuario')
  return all[0]
}

// ---------- Pending Mutations (fila offline) ----------

export async function addPendingMutation(mutation: Omit<PendingMutation, 'id'>) {
  const db = await getDB()
  await db.add('pendingMutations', mutation)
}

export async function getPendingMutations(): Promise<PendingMutation[]> {
  const db = await getDB()
  return db.getAll('pendingMutations')
}

export async function clearPendingMutations() {
  const db = await getDB()
  await db.clear('pendingMutations')
}

export async function removePendingMutation(id: number) {
  const db = await getDB()
  await db.delete('pendingMutations', id)
}

// ---------- Questionario Cache ----------

export async function cacheQuestionario(questionario: CachedQuestionario) {
  const db = await getDB()
  await db.put('questionarios', { ...questionario, cachedAt: Date.now() })
}

export async function getCachedQuestionario(id: number): Promise<CachedQuestionario | undefined> {
  const db = await getDB()
  return db.get('questionarios', id)
}

export async function clearOldQuestionarioCache(maxAgeMs: number = 24 * 60 * 60 * 1000) {
  const db = await getDB()
  const all = await db.getAll('questionarios')
  const now = Date.now()
  for (const q of all) {
    if (now - q.cachedAt > maxAgeMs) {
      await db.delete('questionarios', q.id)
    }
  }
}

// ---------- Pending Respostas (offline queue) ----------

export async function addPendingResposta(resposta: Omit<PendingResposta, 'id'>) {
  const db = await getDB()
  await db.add('pendingRespostas', resposta)
}

export async function getPendingRespostas(): Promise<PendingResposta[]> {
  const db = await getDB()
  return db.getAll('pendingRespostas')
}

export async function getPendingRespostasByQuestionario(questionarioId: number): Promise<PendingResposta[]> {
  const db = await getDB()
  return db.getAllFromIndex('pendingRespostas', 'questionarioId', questionarioId)
}

export async function removePendingResposta(id: number) {
  const db = await getDB()
  await db.delete('pendingRespostas', id)
}

export async function clearPendingRespostas() {
  const db = await getDB()
  await db.clear('pendingRespostas')
}

// ---------- Sync ----------

export async function syncPendingRespostas() {
  const respostas = await getPendingRespostas()
  for (const r of respostas) {
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resposta',
          data: {
            questionarioId: r.questionarioId,
            syncId: r.syncId,
            valores: r.valores,
            nomeAnonimo: r.nomeAnonimo,
            isEdicao: r.isEdicao,
            respostaId: r.respostaId,
          },
        }),
      })

      if (response.ok) {
        if (r.id) await removePendingResposta(r.id)
      } else if (response.status < 500) {
        // erro permanente (ex: já respondeu, validação) - não vai ser resolvido
        // com nova tentativa, então remove da fila para não bloquear as demais
        if (r.id) await removePendingResposta(r.id)
      } else {
        break
      }
    } catch {
      break
    }
  }
}

export async function syncPendingMutations() {
  const mutations = await getPendingMutations()
  for (const m of mutations) {
    try {
      const response = await fetch(m.url, {
        method: m.method,
        headers: { 'Content-Type': 'application/json' },
        body: m.body,
      })
      if (response.ok && m.id) {
        await removePendingMutation(m.id)
      } else if (response.status < 500 && m.id) {
        await removePendingMutation(m.id)
      } else {
        break
      }
    } catch {
      break
    }
  }
}

export async function syncAll() {
  await syncPendingRespostas()
  await syncPendingMutations()
}

export type {
  CachedQuestionario,
  CachedPergunta,
  PendingResposta,
  PendingMutation,
}
