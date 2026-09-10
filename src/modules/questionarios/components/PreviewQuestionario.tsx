'use client'

interface Opcao {
  id?: number
  texto: string
  ordem: number
}

interface Pergunta {
  id?: number
  texto: string
  tipo: string
  obrigatoria: boolean
  ordem: number
  opcoes: Opcao[]
  configEscala?: { min: number; max: number; passo: number } | null
}

interface QuestionarioPreview {
  titulo: string
  descricao: string | null
  perguntas: Pergunta[]
}

interface Props {
  questionario: QuestionarioPreview
  onFechar?: () => void
}

export default function PreviewQuestionario({ questionario, onFechar }: Props) {
  function renderPergunta(pergunta: Pergunta, idx: number) {
    const id = pergunta.id || idx

    switch (pergunta.tipo) {
      case 'texto_curto':
        return (
          <input
            type="text"
            placeholder="Sua resposta (preview)"
            disabled
            className="w-full rounded-lg px-4 py-2 text-sm"
            style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-tertiary)' }}
          />
        )

      case 'texto_longo':
        return (
          <textarea
            placeholder="Sua resposta (preview)"
            disabled
            rows={3}
            className="w-full rounded-lg px-4 py-2 text-sm resize-none"
            style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-tertiary)' }}
          />
        )

      case 'escolha_unica':
        return (
          <div className="flex flex-col gap-2">
            {pergunta.opcoes.map((opcao, oIdx) => (
              <label
                key={oIdx}
                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--text-primary)',
                }}
              >
                <input
                  type="radio"
                  name={`preview_${id}`}
                  disabled
                  className="accent-current"
                />
                <span className="text-sm">{opcao.texto || `Opção ${oIdx + 1}`}</span>
              </label>
            ))}
          </div>
        )

      case 'multipla_escolha':
        return (
          <div className="flex flex-col gap-2">
            {pergunta.opcoes.map((opcao, oIdx) => (
              <label
                key={oIdx}
                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--text-primary)',
                }}
              >
                <input
                  type="checkbox"
                  disabled
                  className="accent-current"
                />
                <span className="text-sm">{opcao.texto || `Opção ${oIdx + 1}`}</span>
              </label>
            ))}
          </div>
        )

      case 'escala': {
        const config = pergunta.configEscala || { min: 1, max: 5, passo: 1 }
        return (
          <div className="flex flex-col gap-2">
            <input
              type="range"
              min={config.min}
              max={config.max}
              step={config.passo}
              value={config.min}
              disabled
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{ backgroundColor: 'var(--input-bg)' }}
            />
            <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-tertiary)' }}>
              <span>{config.min}</span>
              <span>{config.max}</span>
            </div>
          </div>
        )
      }

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl p-6"
        style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--card-border)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Preview: {questionario.titulo}
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
              Modo visualização - como o respondente verá
            </p>
          </div>
          {onFechar && (
            <button
              onClick={onFechar}
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {questionario.descricao && (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {questionario.descricao}
            </p>
          )}

          {questionario.perguntas.map((pergunta, idx) => (
            <div
              key={idx}
              className="rounded-lg p-4 flex flex-col gap-3"
              style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
            >
              <div className="flex items-start gap-2">
                <p className="text-sm font-medium flex-1" style={{ color: 'var(--text-primary)' }}>
                  {pergunta.texto || `Pergunta ${idx + 1}`}
                  {pergunta.obrigatoria && (
                    <span className="ml-1" style={{ color: '#f87171' }}>*</span>
                  )}
                </p>
                <span
                  className="text-xs px-2 py-0.5 rounded"
                  style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}
                >
                  {pergunta.tipo === 'escolha_unica' && 'Escolha Única'}
                  {pergunta.tipo === 'multipla_escolha' && 'Múltipla Escolha'}
                  {pergunta.tipo === 'texto_curto' && 'Texto Curto'}
                  {pergunta.tipo === 'texto_longo' && 'Texto Longo'}
                  {pergunta.tipo === 'escala' && 'Escala'}
                </span>
              </div>
              {renderPergunta(pergunta, idx)}
            </div>
          ))}

          {questionario.perguntas.length === 0 && (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text-tertiary)' }}>
              Nenhuma pergunta adicionada ainda.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4" style={{ borderTop: '1px solid var(--card-border)' }}>
          <button
            type="button"
            onClick={onFechar}
            className="font-medium rounded-lg px-4 py-2 transition-colors"
            style={{ backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)' }}
          >
            Fechar preview
          </button>
        </div>
      </div>
    </div>
  )
}
