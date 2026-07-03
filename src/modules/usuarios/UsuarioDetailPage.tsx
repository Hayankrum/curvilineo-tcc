import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getUsuarioLogado } from '@/modules/usuarios/usuarios.actions'
import BotaoDeletarPerfil from './BotaoDeletarPerfil'
import { primeiroNome } from '@/lib/utils'

interface Props {
  id: number
}

export default async function UsuarioDetailPage({ id }: Props) {
  const usuario = await prisma.usuario.findUnique({
    where: { id },
    include: {
      posts: {
        orderBy: { criadoEm: 'desc' }
      }
    }
  })

  if (!usuario) notFound()

  const usuarioLogado = await getUsuarioLogado()
  const isDono = usuarioLogado?.id === usuario.id

  return (
    <div className="max-w-xl">
      <Link
        href="/posts"
        className="text-sm text-zinc-500 hover:text-white transition-colors mb-6 inline-block"
      >
        ← Voltar
      </Link>

      <div className="flex items-start gap-5 mb-6">
        <div className="w-16 h-16 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xl font-semibold text-zinc-400 flex-shrink-0">
          {usuario.nome.charAt(0).toUpperCase()}
        </div>

        <div>
          <h1 className="text-2xl font-semibold">{usuario.nome}</h1>
          <p className="text-zinc-500 text-sm">{usuario.email}</p>
        </div>
      </div>

      {usuario.bio && (
        <p className="text-zinc-300 text-sm mb-6 leading-relaxed">{usuario.bio}</p>
      )}

      {isDono && (
        <div className="flex flex-wrap gap-4 mb-8 pb-6 border-b border-zinc-800">
          <Link
            href={`/usuarios/${usuario.id}/editar`}
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Editar perfil
          </Link>
          {usuario.senha && (
            <Link
              href={`/usuarios/${usuario.id}/senha`}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Alterar senha
            </Link>
          )}
          <Link href="/notificacoes" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Notificações
          </Link>
          <BotaoDeletarPerfil id={usuario.id} temSenha={!!usuario.senha} />
        </div>
      )}

      <h2 className="text-lg font-medium mb-4">Posts de {primeiroNome(usuario.nome)}</h2>

      {usuario.posts.length === 0 && (
        <p className="text-zinc-500">Nenhum post ainda.</p>
      )}

      <div className="flex flex-col gap-4">
        {usuario.posts.map(post => (
          <div key={post.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
            <h3 className="font-medium text-lg mb-1">{post.titulo}</h3>
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
