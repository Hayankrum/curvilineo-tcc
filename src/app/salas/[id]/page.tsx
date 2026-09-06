import SalaDetailPage from '@/modules/salas/pages/SalaDetailPage'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return {
    title: `Sala #${id}`,
  }
}

export default function Page() {
  return <SalaDetailPage />
}
