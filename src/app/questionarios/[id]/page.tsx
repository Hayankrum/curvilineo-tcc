import QuestionarioDetailPage from '@/modules/questionarios/pages/QuestionarioDetailPage'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  return { title: `Questionário #${id}` }
}

export default async function Page({ params }: Props) {
  const { id } = await params
  return <QuestionarioDetailPage questionarioId={Number(id)} />
}
