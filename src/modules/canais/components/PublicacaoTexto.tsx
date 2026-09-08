interface PublicacaoTextoProps {
  titulo?: string | null
  conteudo?: string | null
}

export default function PublicacaoTexto({ titulo, conteudo }: PublicacaoTextoProps) {
  return (
    <div className="space-y-3">
      {titulo && (
        <h3
          className="text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          {titulo}
        </h3>
      )}
      {conteudo && (
        <div
          className="text-xs leading-relaxed whitespace-pre-wrap"
          style={{ color: 'var(--text-secondary)' }}
        >
          {conteudo}
        </div>
      )}
    </div>
  )
}
