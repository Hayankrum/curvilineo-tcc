import EditarResponderPage from '@/modules/questionarios/pages/EditarResponderPage'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  return { title: `Editar Resposta - Questionário #${id}` }
}

export default async function Page({ params }: Props) {
  const { id } = await params
  return <EditarResponderPage questionarioId={Number(id)} />
}
