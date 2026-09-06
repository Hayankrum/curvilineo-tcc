import { obterSessao } from '@/lib/session'
import { Metadata } from 'next'
import CadastroPageClient from './CadastroPageClient'

export const metadata: Metadata = {
  title: 'Cadastro - Sistema de Cursos',
  description: 'Cadastre-se em cursos e gerencie sua participação'
}

export default async function CadastroPage() {
  const usuario = await obterSessao()
  
  return (
    <CadastroPageClient 
      usuarioLogado={!!usuario}
      isAdmin={usuario?.isAdmin || false}
      usuario={usuario ? {
        id: usuario.id,
        nome: usuario.nome,
        tipoUsuario: usuario.tipoUsuario
      } : null}
    />
  )
}
