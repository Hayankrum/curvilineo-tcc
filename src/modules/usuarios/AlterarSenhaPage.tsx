'use client'

import { useActionState } from 'react'
import { alterarSenha } from './usuarios.actions'
import Link from 'next/link'
import CampoSenha from './CampoSenha'

interface Props {
  usuarioId: number
}

async function alterarAction(_prev: { error?: string; success?: string } | null, formData: FormData) {
  const id = Number(formData.get('id'))
  const senhaAtual = formData.get('senhaAtual') as string
  const novaSenha = formData.get('novaSenha') as string
  const confirmarSenha = formData.get('confirmarSenha') as string
  return await alterarSenha(id, senhaAtual, novaSenha, confirmarSenha)
}

export default function AlterarSenhaPage({ usuarioId }: Props) {
  const [estado, formAction, pending] = useActionState(alterarAction, null)

  return (
    <div className="max-w-sm">
      <Link
        href={`/usuarios/${usuarioId}`}
        className="text-sm text-zinc-500 hover:text-white transition-colors mb-6 inline-block"
      >
        ← Voltar
      </Link>

      <h1 className="text-2xl font-semibold mb-6">Alterar senha</h1>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="id" value={usuarioId} />

        {estado?.error && (
          <p className="text-red-400 text-sm bg-red-950/40 border border-red-900 rounded-lg px-4 py-2">
            {estado.error}
          </p>
        )}

        {estado?.success && (
          <p className="text-green-400 text-sm bg-green-950/40 border border-green-900 rounded-lg px-4 py-2">
            {estado.success}
          </p>
        )}

        <CampoSenha name="senhaAtual" label="Senha atual" />

        <CampoSenha name="novaSenha" label="Nova senha" minLength={8} placeholder="Mínimo 8 caracteres" />

        <CampoSenha name="confirmarSenha" label="Confirmar nova senha" minLength={8} placeholder="Repita a nova senha" />

        <button
          type="submit"
          disabled={pending}
          className="bg-white text-zinc-950 font-medium rounded-lg px-4 py-2 hover:bg-zinc-200 transition-colors w-fit disabled:opacity-50"
        >
          {pending ? 'Alterando...' : 'Alterar senha'}
        </button>
      </form>
    </div>
  )
}
