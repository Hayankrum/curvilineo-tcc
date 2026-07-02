import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getUsuarioLogado } from '@/modules/usuarios/usuarios.actions'
import { primeiroNome } from '@/lib/utils'

export default async function PostListPage() {
  const usuario = await getUsuarioLogado()
  const posts = await prisma.post.findMany({
    include: { autor: true },
    orderBy: { criadoEm: 'desc' }
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Posts</h1>
        {usuario && (
          <Link
            href="/posts/novo"
            className="bg-white text-zinc-950 font-medium rounded-lg px-4 py-2 text-sm hover:bg-zinc-200 transition-colors"
          >
            Novo post
          </Link>
        )}
      </div>

      {posts.length === 0 && (
        <p className="text-zinc-500">Nenhum post ainda.</p>
      )}

      <div className="flex flex-col gap-4">
        {posts.map(post => (
          <div key={post.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
            <h2 className="font-medium text-lg mb-1">{post.titulo}</h2>
            <p className="text-zinc-500 text-xs mb-3">
              por{' '}
              <Link href={`/usuarios/${post.autor.id}`} className="hover:text-white transition-colors">
                {primeiroNome(post.autor.nome)}
              </Link>
            </p>
            <p className="text-zinc-400 text-sm mb-4 line-clamp-2">{post.conteudo}</p>
            <Link
              href={`/posts/${post.id}`}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Ver post →
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}