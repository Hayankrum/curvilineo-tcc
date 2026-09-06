import { obterSessao } from '@/lib/session'
import { redirect } from 'next/navigation'
import GerenciarSalasAdmin from '@/modules/admin/pages/GerenciarSalasAdmin'

export const metadata = {
  title: 'Gerenciar Salas - Admin',
}

export default async function AdminSalasPage() {
  const usuario = await obterSessao()

  if (!usuario || !usuario.isAdmin) {
    redirect('/')
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem 1rem',
      backgroundColor: 'var(--bg-primary)'
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        <GerenciarSalasAdmin />
      </div>
    </div>
  )
}
