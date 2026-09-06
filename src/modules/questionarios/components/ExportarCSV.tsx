'use client'

interface ResultadoItem {
  perguntaId: number
  texto: string
  tipo: string
  totalRespostas: number
  distribuicao?: {
    opcaoId: number
    texto: string
    count: number
    percentual: number
  }[]
  media?: number
  min?: number
  max?: number
  respostas?: string[]
}

interface Props {
  titulo: string
  resultados: ResultadoItem[]
  totalRespostas: number
}

export default function ExportarCSV({ titulo, resultados, totalRespostas }: Props) {
  function gerarCSV() {
    const linhas: string[] = []

    linhas.push(`"Questionário";"${titulo}"`)
    linhas.push(`"Total de Respostas";"${totalRespostas}"`)
    linhas.push('')

    for (const resultado of resultados) {
      linhas.push(`"Pergunta";"${resultado.texto}"`)
      linhas.push(`"Tipo";"${resultado.tipo}"`)
      linhas.push(`"Respostas";"${resultado.totalRespostas}"`)

      if (resultado.distribuicao) {
        linhas.push('"Opção";"Quantidade";"Percentual"')
        for (const opcao of resultado.distribuicao) {
          linhas.push(`"${opcao.texto}";"${opcao.count}";"${opcao.percentual}%"`)
        }
      }

      if (resultado.media !== undefined) {
        linhas.push(`"Média";"${resultado.media}"`)
        if (resultado.min !== undefined) linhas.push(`"Mínimo";"${resultado.min}"`)
        if (resultado.max !== undefined) linhas.push(`"Máximo";"${resultado.max}"`)
      }

      if (resultado.respostas) {
        linhas.push('"Respostas Textuais"')
        for (const resp of resultado.respostas) {
          linhas.push(`"${resp.replace(/"/g, '""')}"`)
        }
      }

      linhas.push('')
    }

    return linhas.join('\n')
  }

  function downloadCSV() {
    const csv = gerarCSV()
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `resultados-${titulo.replace(/[^a-zA-Z0-9]/g, '_')}-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={downloadCSV}
      className="font-medium rounded-lg px-4 py-2 transition-colors flex items-center gap-2"
      style={{ backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)' }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Exportar CSV
    </button>
  )
}
