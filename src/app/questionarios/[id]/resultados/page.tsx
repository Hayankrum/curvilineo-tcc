import ResultadosPage from '@/modules/questionarios/pages/ResultadosPage'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  return { title: `Resultados Questionário #${id}` }
}

export default async function Page({ params }: Props) {
  const { id } = await params
  return <ResultadosPage questionarioId={Number(id)} />
}
