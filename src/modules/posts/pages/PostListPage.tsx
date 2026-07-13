import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getUsuarioLogado } from '@/modules/usuarios/usuarios.actions'
import { primeiroNome } from '@/lib/utils'
import MapaGlobalClient from '@/modules/mapa/components/MapaGlobalClient'

export default async function PostListPage() {
  const usuario = await getUsuarioLogado()
  const posts = await prisma.post.findMany({
    include: { autor: true },
    orderBy: { criadoEm: 'desc' }
  })

  const postsComCoordenadas = posts
    .filter(p => p.latitude && p.longitude)
    .map(p => ({
      id: p.id,
      titulo: p.titulo,
      latitude: p.latitude!,
      longitude: p.longitude!,
      autorNome: p.autor.nome,
      criadoEm: p.criadoEm.toISOString(),
    }))

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Posts</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/mapa"
            className="text-sm transition-colors hover:underline"
            style={{ color: 'var(--text-secondary)' }}
          >
            Mapa global
          </Link>
          {usuario && (
            <Link
              href="/posts/novo"
              className="font-medium rounded-lg px-4 py-2 text-sm transition-colors"
              style={{ backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }}
            >
              Novo post
            </Link>
          )}
        </div>
      </div>

      {postsComCoordenadas.length > 0 && (
        <div className="mb-8">
          <MapaGlobalClient posts={postsComCoordenadas} />
        </div>
      )}

      {posts.length === 0 && (
        <p style={{ color: 'var(--text-tertiary)' }}>Nenhum post ainda.</p>
      )}

      <div className="flex flex-col gap-4">
        {posts.map(post => (
          <div key={post.id} className="rounded-lg p-5" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <h2 className="font-medium text-lg mb-1" style={{ color: 'var(--text-primary)' }}>{post.titulo}</h2>
            <p className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>
              por{' '}
              <Link href={`/usuarios/${post.autor.id}`} className="transition-colors hover:underline">
                {primeiroNome(post.autor.nome)}
              </Link>
            </p>
            <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{post.conteudo}</p>
            <Link
              href={`/posts/${post.id}`}
              className="text-sm transition-colors hover:underline"
              style={{ color: 'var(--text-secondary)' }}
            >
              Ver post →
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}