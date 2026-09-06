import QuestionarioFormPage from '@/modules/questionarios/pages/QuestionarioFormPage'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  return { title: `Editar Questionário #${id}` }
}

export default async function Page({ params }: Props) {
  const { id } = await params
  return <QuestionarioFormPage questionarioId={Number(id)} />
}
