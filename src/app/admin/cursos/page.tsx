import { obterSessao } from '@/lib/session'
import { redirect } from 'next/navigation'
import GerenciarCursosAdmin from '@/modules/admin/pages/GerenciarCursosAdmin'

export const metadata = {
  title: 'Gerenciar Cursos - Admin',
}

export default async function AdminCursosPage() {
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
        <GerenciarCursosAdmin />
      </div>
    </div>
  )
}
