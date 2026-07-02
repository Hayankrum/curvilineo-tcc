import { redirect } from 'next/navigation'
import { criarPost, editarPost } from './posts.actions'

interface Post {
  id: number
  titulo: string
  conteudo: string
}

interface Props {
  post?: Post
  error?: string
}

export default function PostFormPage({ post, error }: Props) {
  const isEditing = !!post

  async function handleAction(formData: FormData) {
    'use server'
    const titulo = formData.get('titulo') as string
    const conteudo = formData.get('conteudo') as string
    const id = formData.get('id') as string

    if (id) {
      const result = await editarPost(Number(id), titulo, conteudo)
      if (result?.error) redirect(`/posts/${id}/editar?error=${encodeURIComponent(result.error)}`)
    } else {
      const result = await criarPost(titulo, conteudo)
      if (result?.error) redirect('/posts/novo?error=' + encodeURIComponent(result.error))
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-6">
        {isEditing ? 'Editar post' : 'Novo post'}
      </h1>

      <form action={handleAction} className="flex flex-col gap-4">
        {isEditing && <input type="hidden" name="id" value={post.id} />}

        {error && (
          <p className="text-red-400 text-sm bg-red-950/40 border border-red-900 rounded-lg px-4 py-2">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-400">Título</label>
          <input
            name="titulo"
            placeholder="Digite o título"
            defaultValue={post?.titulo ?? ''}
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-400">Conteúdo</label>
          <textarea
            name="conteudo"
            placeholder="Digite o conteúdo"
            defaultValue={post?.conteudo ?? ''}
            rows={5}
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 resize-none"
          />
        </div>

        <button
          type="submit"
          className="bg-white text-zinc-950 font-medium rounded-lg px-4 py-2 hover:bg-zinc-200 transition-colors w-fit"
        >
          {isEditing ? 'Salvar' : 'Criar post'}
        </button>
      </form>
    </div>
  )
}
