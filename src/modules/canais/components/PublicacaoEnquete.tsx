import Enquete from './Enquete'

interface OpcaoEnquete {
  id: number
  texto: string
  ordem: number
  votos?: { id: number }[]
  _count?: { votos: number }
}

interface EnqueteData {
  id: number
  permiteMultiplaEscolha: boolean
  opcoes: OpcaoEnquete[]
  votos: unknown[]
}

interface PublicacaoEnqueteProps {
  titulo?: string | null
  enquete: EnqueteData
  publicacaoId: number
}

export default function PublicacaoEnquete({ titulo, enquete, publicacaoId }: PublicacaoEnqueteProps) {
  return (
    <div className="space-y-3">
      {titulo && (
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {titulo}
        </h3>
      )}
      <Enquete
        enqueteId={enquete.id}
        permiteMultiplaEscolha={enquete.permiteMultiplaEscolha}
        opcoes={enquete.opcoes}
        publicacaoId={publicacaoId}
      />
    </div>
  )
}
