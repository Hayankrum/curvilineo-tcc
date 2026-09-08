import { obterSessao } from '@/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import CanalForm from '@/modules/canais/components/CanalForm'

export const metadata = {
  title: 'Novo Canal',
}

export default async function NovoCanalPage() {
  const usuario = await obterSessao()
  if (!usuario || !usuario.isAdmin) redirect('/')

  return (
    <div>
      <Link
        href="/canais"
        className="text-sm transition-colors mb-6 inline-block hover:underline"
        style={{ color: 'var(--text-tertiary)' }}
      >
        ← Voltar
      </Link>

      <h1 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
        Novo Canal
      </h1>

      <CanalForm modo="criar" />
    </div>
  )
}
