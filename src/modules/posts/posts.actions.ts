'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getUsuarioLogado } from '@/modules/usuarios/usuarios.actions'

async function obterPostDoUsuario(id: number) {
  const usuario = await getUsuarioLogado()
  if (!usuario) return { error: 'Você precisa estar logado' as const, post: null }

  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) return { error: 'Post não encontrado' as const, post: null }
  if (post.autorId !== usuario.id) return { error: 'Você não pode acessar um post que não é seu' as const, post: null }

  return { post, usuario }
}

export async function criarPost(titulo: string, conteudo: string) {
  const usuario = await getUsuarioLogado()
  if (!usuario) return { error: 'Você precisa estar logado para criar um post' }

  await prisma.post.create({ data: { titulo, conteudo, autorId: usuario.id } })
  revalidatePath('/posts')
  redirect('/posts')
}

export async function deletarPost(id: number) {
  const { error } = await obterPostDoUsuario(id)
  if (error) return { error }

  await prisma.post.delete({ where: { id } })
  revalidatePath('/posts')
}

export async function editarPost(id: number, titulo: string, conteudo: string) {
  const { error } = await obterPostDoUsuario(id)
  if (error) return { error }

  await prisma.post.update({ where: { id }, data: { titulo, conteudo } })
  redirect(`/posts/${id}`)
}
