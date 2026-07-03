import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import BotaoDeletar from './BotaoDeletar'
import FormComentario from './FormComentario'
import ListaComentarios from './ListaComentarios'
import { getUsuarioLogado } from '@/modules/usuarios/usuarios.actions'
import { primeiroNome } from '@/lib/utils'

interface Props {
  id: number
}

export default async function PostDetailPage({ id }: Props) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      autor: true,
      comentarios: {
        include: { autor: true },
        orderBy: { criadoEm: 'desc' },
      },
    },
  })

  if (!post) notFound()

  const usuario = await getUsuarioLogado()
  const ehAutor = usuario?.id === post.autorId

  return (
    <div className="max-w-xl">
      <Link
        href="/posts"
        className="text-sm text-zinc-500 hover:text-white transition-colors mb-6 inline-block"
      >
        ← Voltar
      </Link>
      <h1 className="text-2xl font-semibold mb-2">{post.titulo}</h1>
      <p className="text-zinc-500 text-sm mb-6">
        por{' '}
        <Link href={`/usuarios/${post.autor.id}`} className="hover:text-white transition-colors">
          {primeiroNome(post.autor.nome)}
        </Link>
      </p>
      <p className="text-zinc-400 leading-relaxed mb-8">{post.conteudo}</p>

      {ehAutor && (
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={`/posts/${post.id}/editar`}
            className="bg-zinc-800 text-white rounded-lg px-4 py-2 text-sm hover:bg-zinc-700 transition-colors"
          >
            Editar
          </Link>
          <BotaoDeletar id={post.id} />
        </div>
      )}

      <div className="border-t border-zinc-800 pt-6">
        <ListaComentarios
          comentarios={post.comentarios}
          usuarioLogadoId={usuario?.id}
        />
        {usuario ? (
          <FormComentario postId={post.id} />
        ) : (
          <p className="text-zinc-500 text-sm mt-4">
            <Link href="/usuarios/login" className="text-white hover:underline">
              Faça login
            </Link>{' '}
            para comentar.
          </p>
        )}
      </div>
    </div>
  )
}
