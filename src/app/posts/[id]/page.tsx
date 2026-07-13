import PostDetailPage from '@/modules/posts/pages/PostDetailPage'

interface Props {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: Props) {
  const { id } = await params
  return <PostDetailPage id={Number(id)} />
}