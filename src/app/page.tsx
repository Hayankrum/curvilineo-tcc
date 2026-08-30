import Link from 'next/link'
import { getUsuarioLogado } from '@/modules/usuarios/usuarios.actions'
import { primeiroNome } from '@/lib/utils'
import ClientPopups from '@/components/ClientPopups'

export default async function Home() {
  const usuario = await getUsuarioLogado()

  return (
    <ClientPopups>
      <div className="max-w-xl">
        <h1 className="text-3xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          {usuario ? `Bem-vindo, ${primeiroNome(usuario.nome)}` : 'Bem-vindo ao Meu App'}
        </h1>

        <p className="leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
          Um app de base com sistema de posts e autenticação de usuários.
        </p>

        <div className="flex gap-4">
          <Link
            href="/posts"
            className="font-medium rounded-lg px-4 py-2 text-sm transition-colors"
            style={{ backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }}
          >
            Ver posts
          </Link>

          {!usuario && (
            <Link
              href="/usuarios/login"
              className="rounded-lg px-4 py-2 text-sm transition-colors"
              style={{ backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--text-primary)' }}
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </ClientPopups>
  )
}
