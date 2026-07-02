'use client'

import { useActionState } from 'react'
import { editarPerfil } from './usuarios.actions'
import Link from 'next/link'

interface Props {
  usuario: { id: number; nome: string; bio: string | null }
}

async function editarAction(_prev: { error?: string } | null, formData: FormData) {
  const id = Number(formData.get('id'))
  const nome = formData.get('nome') as string
  const bio = formData.get('bio') as string
  return await editarPerfil(id, nome, bio)
}

export default function EditarPerfilPage({ usuario }: Props) {
  const [estado, formAction, pending] = useActionState(editarAction, null)

  return (
    <div className="max-w-sm">
      <Link
        href={`/usuarios/${usuario.id}`}
        className="text-sm text-zinc-500 hover:text-white transition-colors mb-6 inline-block"
      >
        ← Voltar
      </Link>

      <h1 className="text-2xl font-semibold mb-6">Editar perfil</h1>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="id" value={usuario.id} />

        {estado?.error && (
          <p className="text-red-400 text-sm bg-red-950/40 border border-red-900 rounded-lg px-4 py-2">
            {estado.error}
          </p>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-400">Nome</label>
          <input
            name="nome"
            defaultValue={usuario.nome}
            maxLength={50}
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-400">Bio</label>
          <textarea
            name="bio"
            defaultValue={usuario.bio ?? ''}
            placeholder="Fale um pouco sobre você..."
            rows={3}
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="bg-white text-zinc-950 font-medium rounded-lg px-4 py-2 hover:bg-zinc-200 transition-colors w-fit disabled:opacity-50"
        >
          {pending ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </div>
  )
}
