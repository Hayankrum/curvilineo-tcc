import ResponderPage from '@/modules/questionarios/pages/ResponderPage'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  return { title: `Responder Questionário #${id}` }
}

export default async function Page({ params }: Props) {
  const { id } = await params
  return <ResponderPage questionarioId={Number(id)} />
}
