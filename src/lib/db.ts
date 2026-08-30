import { openDB, type IDBPDatabase } from 'idb'

interface Post {
  id: number
  titulo: string
  conteudo: string
  latitude: number | null
  longitude: number | null
  criadoEm: string
  autorId: number
  autor: { id: number; nome: string; fotoUrl: string | null }
}

interface PostCompleto extends Post {
  comentarios: {
    id: number
    texto: string
    criadoEm: string
    postId: number
    autorId: number
    autor: { id: number; nome: string; fotoUrl: string | null }
  }[]
}

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

let dbPromise: Promise<IDBPDatabase> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB('meu-app-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('posts')) {
          db.createObjectStore('posts', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('postsDetail')) {
          db.createObjectStore('postsDetail', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('usuario')) {
          db.createObjectStore('usuario', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('pendingMutations')) {
          const store = db.createObjectStore('pendingMutations', {
            keyPath: 'id',
            autoIncrement: true,
          })
          store.createIndex('createdAt', 'createdAt')
        }
      },
    })
  }
  return dbPromise
}

// ---------- Posts ----------

export async function cachePosts(posts: Post[]) {
  const db = await getDB()
  const tx = db.transaction('posts', 'readwrite')
  await tx.store.clear()
  for (const post of posts) {
    await tx.store.put(post)
  }
  await tx.done
}

export async function getCachedPosts(): Promise<Post[]> {
  const db = await getDB()
  return db.getAll('posts')
}

export async function cachePostDetail(post: PostCompleto) {
  const db = await getDB()
  await db.put('postsDetail', post)
}

export async function getCachedPostDetail(id: number): Promise<PostCompleto | undefined> {
  const db = await getDB()
  return db.get('postsDetail', id)
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

// ---------- Sync ----------

export async function syncPendingMutations() {
  const mutations = await getPendingMutations()
  for (const m of mutations) {
    try {
      await fetch(m.url, {
        method: m.method,
        headers: { 'Content-Type': 'application/json' },
        body: m.body,
      })
      if (m.id) await removePendingMutation(m.id)
    } catch {
      break // fica offline, tenta na próxima
    }
  }
}
