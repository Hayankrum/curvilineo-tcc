'use client'

import Link from 'next/link'
import { usePosts, useUsuario } from '@/lib/useData'
import { primeiroNome } from '@/lib/utils'
import OfflineBanner from '@/components/OfflineBanner'

export default function PostListPage() {
  const { posts: rawPosts, loading, fromCache } = usePosts()
  const { usuario } = useUsuario()
  const posts = Array.isArray(rawPosts) ? rawPosts : []

  return (
    <div>
      <OfflineBanner fromCache={fromCache} />

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Posts</h1>
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

      {loading && (
        <p style={{ color: 'var(--text-tertiary)' }}>Carregando...</p>
      )}

      {!loading && posts.length === 0 && (
        <p style={{ color: 'var(--text-tertiary)' }}>Nenhum post ainda.</p>
      )}

      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <div key={post.id} className="rounded-lg p-5" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <h2 className="font-medium text-lg mb-1" style={{ color: 'var(--text-primary)' }}>{post.titulo}</h2>
            <p className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>
              por{' '}
              <Link href={`/usuarios/${post.autor.id}`} className="transition-colors hover:underline">
                {primeiroNome(post.autor.nome)}
              </Link>
            </p>
            <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{post.conteudo.length > 150 ? post.conteudo.slice(0, 150) + '...' : post.conteudo}</p>
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
