'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { criarPublicacao } from '../actions/publicacao.actions'

interface FormPublicacaoProps {
  canalId: number
  canalNome: string
}

type TipoPublicacao = 'texto' | 'evento' | 'enquete'

export default function FormPublicacao({ canalId, canalNome }: FormPublicacaoProps) {
  const router = useRouter()
  const [tipo, setTipo] = useState<TipoPublicacao>('texto')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [titulo, setTitulo] = useState('')
  const [conteudo, setConteudo] = useState('')

  const [dataEvento, setDataEvento] = useState('')
  const [horaInicio, setHoraInicio] = useState('')
  const [horaFim, setHoraFim] = useState('')
  const [localEvento, setLocalEvento] = useState('')
  const [linkEvento, setLinkEvento] = useState('')

  const [pergunta, setPergunta] = useState('')
  const [opcoes, setOpcoes] = useState(['', ''])
  const [permiteMultipla, setPermiteMultipla] = useState(false)

  function adicionarOpcao() {
    if (opcoes.length < 10) {
      setOpcoes([...opcoes, ''])
    }
  }

  function removerOpcao(index: number) {
    if (opcoes.length > 2) {
      setOpcoes(opcoes.filter((_, i) => i !== index))
    }
  }

  function atualizarOpcao(index: number, valor: string) {
    const novas = [...opcoes]
    novas[index] = valor
    setOpcoes(novas)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)

    let dados: Record<string, unknown> = {}

    if (tipo === 'texto') {
      dados = { titulo: titulo || undefined, conteudo }
    } else if (tipo === 'evento') {
      dados = {
        titulo,
        conteudo: conteudo || undefined,
        dataEvento,
        horaInicio,
        horaFim: horaFim || undefined,
        localEvento: localEvento || undefined,
        linkEvento: linkEvento || undefined,
      }
    } else if (tipo === 'enquete') {
      dados = {
        pergunta,
        opcoes: opcoes.filter(o => o.trim()),
        permiteMultiplaEscolha: permiteMultipla,
      }
    }

    try {
      const result = await criarPublicacao(canalId, tipo, dados as Parameters<typeof criarPublicacao>[2])
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setTitulo('')
        setConteudo('')
        setDataEvento('')
        setHoraInicio('')
        setHoraFim('')
        setLocalEvento('')
        setLinkEvento('')
        setPergunta('')
        setOpcoes(['', ''])
        setPermiteMultipla(false)
        router.refresh()
      }
    } catch {
      setError('Erro ao criar publicação')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="card" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
      <div className="mb-4">
        <h2 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          Nova publicação
        </h2>
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          Canal: {canalNome}
        </p>
      </div>

      <div className="flex gap-1 mb-4 p-1 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        {(['texto', 'evento', 'enquete'] as TipoPublicacao[]).map(t => {
          const labels: Record<TipoPublicacao, string> = {
            texto: 'Texto',
            evento: 'Evento',
            enquete: 'Enquete',
          }
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTipo(t)}
              className="flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
              style={{
                backgroundColor: tipo === t ? 'var(--btn-primary-bg)' : 'transparent',
                color: tipo === t ? 'var(--btn-primary-text)' : 'var(--text-secondary)',
              }}
            >
              {labels[t]}
            </button>
          )
        })}
      </div>

      {error && (
        <div className="error-message mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {tipo === 'texto' && (
          <>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Título (opcional)
              </label>
              <input
                type="text"
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                className="input w-full"
                placeholder="Título da publicação"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Conteúdo *
              </label>
              <textarea
                value={conteudo}
                onChange={e => setConteudo(e.target.value)}
                className="input w-full"
                rows={5}
                placeholder="Escreva o conteúdo da publicação..."
                required
              />
            </div>
          </>
        )}

        {tipo === 'evento' && (
          <>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Título do evento *
              </label>
              <input
                type="text"
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                className="input w-full"
                placeholder="Ex: Semana Acadêmica"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Descrição
              </label>
              <textarea
                value={conteudo}
                onChange={e => setConteudo(e.target.value)}
                className="input w-full"
                rows={3}
                placeholder="Descrição do evento..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Data *
                </label>
                <input
                  type="date"
                  value={dataEvento}
                  onChange={e => setDataEvento(e.target.value)}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Horário início *
                </label>
                <input
                  type="time"
                  value={horaInicio}
                  onChange={e => setHoraInicio(e.target.value)}
                  className="input w-full"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Horário fim
                </label>
                <input
                  type="time"
                  value={horaFim}
                  onChange={e => setHoraFim(e.target.value)}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Local
                </label>
                <input
                  type="text"
                  value={localEvento}
                  onChange={e => setLocalEvento(e.target.value)}
                  className="input w-full"
                  placeholder="Ex: Auditório"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Link externo
              </label>
              <input
                type="url"
                value={linkEvento}
                onChange={e => setLinkEvento(e.target.value)}
                className="input w-full"
                placeholder="https://..."
              />
            </div>
          </>
        )}

        {tipo === 'enquete' && (
          <>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Pergunta *
              </label>
              <input
                type="text"
                value={pergunta}
                onChange={e => setPergunta(e.target.value)}
                className="input w-full"
                placeholder="Ex: Qual tema você gostaria?"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                Opções *
              </label>
              {opcoes.map((opcao, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={opcao}
                    onChange={e => atualizarOpcao(idx, e.target.value)}
                    className="input flex-1"
                    placeholder={`Opção ${idx + 1}`}
                    required
                  />
                  {opcoes.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removerOpcao(idx)}
                      className="btn-secondary rounded-lg px-2"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      \u2715
                    </button>
                  )}
                </div>
              ))}
              {opcoes.length < 10 && (
                <button
                  type="button"
                  onClick={adicionarOpcao}
                  className="btn-secondary rounded-lg px-3 py-1.5 text-xs"
                >
                  + Adicionar opção
                </button>
              )}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={permiteMultipla}
                onChange={e => setPermiteMultipla(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Permitir múltipla escolha
              </span>
            </label>
          </>
        )}

        <button
          type="submit"
          disabled={pending}
          className="btn-primary w-full rounded-lg py-2 text-xs font-medium disabled:opacity-40"
        >
          {pending ? 'Publicando...' : 'Publicar'}
        </button>
      </form>
    </div>
  )
}
