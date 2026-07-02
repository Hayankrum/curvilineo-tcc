'use client'

import { useActionState } from 'react'
import { registrar } from './usuarios.actions'
import Link from 'next/link'
import CampoSenha from './CampoSenha'

async function registrarAction(_prev: { error?: string } | null, formData: FormData) {
  const nome = formData.get('nome') as string
  const email = formData.get('email') as string
  const senha = formData.get('senha') as string
  const confirmarSenha = formData.get('confirmarSenha') as string
  return await registrar(nome, email, senha, confirmarSenha)
}

export default function RegistroPage() {
  const [estado, formAction, pending] = useActionState(registrarAction, null)

  return (
    <div className="max-w-sm">
      <h1 className="text-2xl font-semibold mb-6">Criar conta</h1>

      <form action={formAction} className="flex flex-col gap-4">
        {estado?.error && (
          <p className="text-red-400 text-sm bg-red-950/40 border border-red-900 rounded-lg px-4 py-2">
            {estado.error}
          </p>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-400">Nome</label>
          <input
            name="nome"
            placeholder="Seu nome"
            maxLength={50}
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-400">Email</label>
          <input
            name="email"
            type="email"
            placeholder="seu@email.com"
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
          />
        </div>

        <CampoSenha name="senha" label="Senha" minLength={8} />

        <CampoSenha name="confirmarSenha" label="Confirmar senha" minLength={8} placeholder="Repita a senha" />

        <button
          type="submit"
          disabled={pending}
          className="bg-white text-zinc-950 font-medium rounded-lg px-4 py-2 hover:bg-zinc-200 transition-colors w-fit disabled:opacity-50"
        >
          {pending ? 'Criando...' : 'Criar conta'}
        </button>

        <p className="text-sm text-zinc-500">
          Já tem conta?{' '}
          <Link href="/usuarios/login" className="text-white hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </div>
  )
}
