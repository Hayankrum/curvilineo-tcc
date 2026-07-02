import Link from 'next/link'
import { getUsuarioLogado } from '@/modules/usuarios/usuarios.actions'
import { primeiroNome } from '@/lib/utils'

export default async function Home() {
  const usuario = await getUsuarioLogado()

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-semibold mb-4">
        {usuario ? `Bem-vindo, ${primeiroNome(usuario.nome)}` : 'Bem-vindo ao Meu App'}
      </h1>

      <p className="text-zinc-400 leading-relaxed mb-8">
        Um app de exemplo construído com Next.js, Prisma e SQLite, com
        sistema de posts e autenticação de usuários.
      </p>

      <div className="flex gap-4">
        <Link
          href="/posts"
          className="bg-white text-zinc-950 font-medium rounded-lg px-4 py-2 text-sm hover:bg-zinc-200 transition-colors"
        >
          Ver posts
        </Link>

        {!usuario && (
          <Link
            href="/usuarios/login"
            className="bg-zinc-800 text-white rounded-lg px-4 py-2 text-sm hover:bg-zinc-700 transition-colors"
          >
            Entrar
          </Link>
        )}
      </div>
    </div>
  )
}