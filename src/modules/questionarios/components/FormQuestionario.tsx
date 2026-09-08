'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { criarQuestionario, editarQuestionario } from '../questionarios.actions'
import ImportarJson from './ImportarJson'
import PreviewQuestionario from './PreviewQuestionario'
import CondicoesPergunta from './CondicoesPergunta'

interface OpcaoData {
  texto: string
  ordem: number
  correta: boolean
}

interface CondicaoData {
  perguntaOrigemId: number
  tipoCondicao: 'igual' | 'diferente' | 'contem' | 'nao_contem'
  valor: string
}

interface PerguntaData {
  texto: string
  tipo: string
  obrigatoria: boolean
  ordem: number
  opcoes: OpcaoData[]
  configEscala?: { min: number; max: number; passo: number } | null
  condicoes?: CondicaoData[]
}

interface QuestionarioExistente {
  id: number
  titulo: string
  descricao: string | null
  encerraEm?: Date | string | null
  corTema?: string
  usuariosEsperados?: number | null
  anonimo?: boolean
  perguntas: {
    id: number
    texto: string
    tipo: string
    obrigatoria: boolean
    ordem: number
    opcoes: { id: number; texto: string; ordem: number; correta: boolean }[]
    configEscala: { min: number; max: number; passo: number } | null
  }[]
}

interface Props {
  questionario?: QuestionarioExistente
}

const TIPOS = [
  { valor: 'texto_curto', label: 'Texto Curto' },
  { valor: 'texto_longo', label: 'Texto Longo' },
  { valor: 'escolha_unica', label: 'Escolha Única' },
  { valor: 'multipla_escolha', label: 'Múltipla Escolha' },
  { valor: 'escala', label: 'Escala' },
]

interface SortablePerguntaProps {
  idx: number
  pergunta: PerguntaData
  perguntas: PerguntaData[]
  onUpdate: (index: number, campo: keyof PerguntaData, valor: unknown) => void
  onRemove: (index: number) => void
  onAddOption: (indexPergunta: number) => void
  onRemoveOption: (indexPergunta: number, indexOpcao: number) => void
  onUpdateOption: (indexPergunta: number, indexOpcao: number, texto: string) => void
  onToggleCorreta: (indexPergunta: number, indexOpcao: number) => void
  total: number
}

function SortablePergunta({
  idx,
  pergunta,
  perguntas,
  onUpdate,
  onRemove,
  onAddOption,
  onRemoveOption,
  onUpdateOption,
  onToggleCorreta,
  total,
}: SortablePerguntaProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: idx })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg p-4 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cursor-grab active:cursor-grabbing p-1 touch-none"
            {...attributes}
            {...listeners}
            style={{ color: 'var(--text-tertiary)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="6" r="1" />
              <circle cx="15" cy="6" r="1" />
              <circle cx="9" cy="12" r="1" />
              <circle cx="15" cy="12" r="1" />
              <circle cx="9" cy="18" r="1" />
              <circle cx="15" cy="18" r="1" />
            </svg>
          </button>
          <span className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>
            Pergunta {idx + 1}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onRemove(idx)}
          className="text-xs px-2 py-1 rounded"
          style={{ color: '#f87171' }}
        >
          Remover
        </button>
      </div>

      <input
        type="text"
        value={pergunta.texto}
        onChange={(e) => onUpdate(idx, 'texto', e.target.value)}
        placeholder="Texto da pergunta"
        className="rounded-lg px-4 py-2 text-sm focus:outline-none transition-colors"
        style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
      />

      <div className="flex items-center gap-4">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Tipo</label>
          <select
            value={pergunta.tipo}
            onChange={(e) => onUpdate(idx, 'tipo', e.target.value)}
            className="rounded-lg px-3 py-2 text-sm focus:outline-none"
            style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
          >
            {TIPOS.map((t) => (
              <option key={t.valor} value={t.valor}>{t.label}</option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm mt-5" style={{ color: 'var(--text-secondary)' }}>
          <input
            type="checkbox"
            checked={pergunta.obrigatoria}
            onChange={(e) => onUpdate(idx, 'obrigatoria', e.target.checked)}
            className="rounded"
          />
          Obrigatória
        </label>
      </div>

      {(pergunta.tipo === 'escolha_unica' || pergunta.tipo === 'multipla_escolha') && (
        <div className="flex flex-col gap-2 mt-2">
          <label className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Opções</label>
          {pergunta.opcoes.map((opcao, oIdx) => (
            <div key={oIdx} className="flex items-center gap-2">
              <span className="text-xs w-5" style={{ color: 'var(--text-tertiary)' }}>{oIdx + 1}.</span>
              <input
                type="text"
                value={opcao.texto}
                onChange={(e) => onUpdateOption(idx, oIdx, e.target.value)}
                placeholder={`Opção ${oIdx + 1}`}
                className="flex-1 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
                style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
              />
              <label className="flex items-center gap-1 text-xs whitespace-nowrap" style={{ color: opcao.correta ? '#22c55e' : 'var(--text-tertiary)' }}>
                <input
                  type="checkbox"
                  checked={opcao.correta}
                  onChange={() => onToggleCorreta(idx, oIdx)}
                  className="accent-green-600"
                />
                Correta
              </label>
              {pergunta.opcoes.length > 2 && (
                <button
                  type="button"
                  onClick={() => onRemoveOption(idx, oIdx)}
                  className="text-xs px-2 py-1"
                  style={{ color: '#f87171' }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {pergunta.opcoes.length < 10 && (
            <button
              type="button"
              onClick={() => onAddOption(idx)}
              className="text-xs font-medium self-start mt-1"
              style={{ color: 'var(--text-secondary)' }}
            >
              + Adicionar opção
            </button>
          )}
        </div>
      )}

      {pergunta.tipo === 'escala' && pergunta.configEscala && (
        <div className="flex items-center gap-4 mt-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Mínimo</label>
            <input
              type="number"
              value={pergunta.configEscala.min}
              onChange={(e) =>
                onUpdate(idx, 'configEscala', {
                  ...pergunta.configEscala!,
                  min: Number(e.target.value),
                })
              }
              className="w-20 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
              style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Máximo</label>
            <input
              type="number"
              value={pergunta.configEscala.max}
              onChange={(e) =>
                onUpdate(idx, 'configEscala', {
                  ...pergunta.configEscala!,
                  max: Number(e.target.value),
                })
              }
              className="w-20 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
              style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Passo</label>
            <input
              type="number"
              value={pergunta.configEscala.passo}
              onChange={(e) =>
                onUpdate(idx, 'configEscala', {
                  ...pergunta.configEscala!,
                  passo: Number(e.target.value),
                })
              }
              className="w-20 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
              style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
            />
          </div>
        </div>
      )}

      <CondicoesPergunta
        perguntas={perguntas}
        perguntaAtual={idx}
        condicoes={pergunta.condicoes || []}
        onChange={(condicoes) => onUpdate(idx, 'condicoes', condicoes)}
      />
    </div>
  )
}

export default function FormQuestionario({ questionario }: Props) {
  const router = useRouter()
  const [titulo, setTitulo] = useState(questionario?.titulo || '')
  const [descricao, setDescricao] = useState(questionario?.descricao || '')
  const [perguntas, setPerguntas] = useState<PerguntaData[]>(
    questionario?.perguntas.map((p) => ({
      texto: p.texto,
      tipo: p.tipo,
      obrigatoria: p.obrigatoria,
      ordem: p.ordem,
      opcoes: p.opcoes.map((o, i) => ({ texto: o.texto, ordem: o.ordem ?? i + 1, correta: o.correta ?? false })),
      configEscala: p.configEscala || null,
    })) || []
  )
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [mostrarPreview, setMostrarPreview] = useState(false)
  const [encerraEm, setEncerraEm] = useState<string>(
    questionario?.encerraEm ? new Date(questionario.encerraEm).toISOString().slice(0, 16) : ''
  )
  const [corTema, setCorTema] = useState(questionario?.corTema || '#6366f1')
  const [usuariosEsperados, setUsuariosEsperados] = useState<string>(questionario?.usuariosEsperados?.toString() || '')
  const [anonimo, setAnonimo] = useState(questionario?.anonimo ?? false)

  const isEdicao = !!questionario

  function adicionarPergunta() {
    setPerguntas([
      ...perguntas,
      {
        texto: '',
        tipo: 'texto_curto',
        obrigatoria: false,
        ordem: perguntas.length + 1,
        opcoes: [],
        configEscala: null,
      },
    ])
  }

  function removerPergunta(index: number) {
    const novas = perguntas.filter((_, i) => i !== index)
    novas.forEach((p, i) => (p.ordem = i + 1))
    setPerguntas(novas)
  }

  function atualizarPergunta(index: number, campo: keyof PerguntaData, valor: unknown) {
    const novas = [...perguntas]
    novas[index] = { ...novas[index], [campo]: valor }

    if (campo === 'tipo') {
      if (valor === 'escolha_unica' || valor === 'multipla_escolha') {
        if (novas[index].opcoes.length < 2) {
          novas[index].opcoes = [{ texto: '', ordem: 1, correta: false }, { texto: '', ordem: 2, correta: false }]
        }
      } else {
        novas[index].opcoes = []
      }
      if (valor === 'escala' && !novas[index].configEscala) {
        novas[index].configEscala = { min: 1, max: 5, passo: 1 }
      }
      if (valor !== 'escala') {
        novas[index].configEscala = null
      }
    }

    setPerguntas(novas)
  }

  function adicionarOpcao(indexPergunta: number) {
    const novas = [...perguntas]
    novas[indexPergunta].opcoes.push({ texto: '', ordem: novas[indexPergunta].opcoes.length + 1, correta: false })
    setPerguntas(novas)
  }

  function removerOpcao(indexPergunta: number, indexOpcao: number) {
    const novas = [...perguntas]
    novas[indexPergunta].opcoes = novas[indexPergunta].opcoes.filter((_, i) => i !== indexOpcao)
    setPerguntas(novas)
  }

  function atualizarOpcao(indexPergunta: number, indexOpcao: number, texto: string) {
    const novas = [...perguntas]
    novas[indexPergunta].opcoes[indexOpcao] = { ...novas[indexPergunta].opcoes[indexOpcao], texto, ordem: indexOpcao + 1 }
    setPerguntas(novas)
  }

  function toggleCorreta(indexPergunta: number, indexOpcao: number) {
    const novas = [...perguntas]
    const opcao = novas[indexPergunta].opcoes[indexOpcao]
    novas[indexPergunta].opcoes[indexOpcao] = { ...opcao, correta: !opcao.correta }
    setPerguntas(novas)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active.id !== over?.id) {
      setPerguntas((items) => {
        const oldIndex = active.id as number
        const newIndex = over!.id as number
        const novas = arrayMove(items, oldIndex, newIndex)
        novas.forEach((p, i) => (p.ordem = i + 1))
        return novas
      })
    }
  }

  function handleImportarJson(novasPerguntas: PerguntaData[], meta?: { titulo?: string; descricao?: string; encerraEm?: string; anonimo?: boolean; corTema?: string; usuariosEsperados?: number }) {
    setPerguntas((prev) => {
      const atualizadas = [...prev, ...novasPerguntas]
      atualizadas.forEach((p, i) => (p.ordem = i + 1))
      return atualizadas
    })
    if (meta?.titulo && !titulo) setTitulo(meta.titulo)
    if (meta?.descricao && !descricao) setDescricao(meta.descricao)
    if (meta?.encerraEm && !encerraEm) setEncerraEm(meta.encerraEm)
    if (meta?.anonimo !== undefined) setAnonimo(meta.anonimo)
    if (meta?.corTema) setCorTema(meta.corTema)
    if (meta?.usuariosEsperados && !usuariosEsperados) setUsuariosEsperados(meta.usuariosEsperados.toString())
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setSalvando(true)

    const encerraEmDate = encerraEm ? new Date(encerraEm) : null
    const usuariosEsperadosNum = usuariosEsperados ? parseInt(usuariosEsperados, 10) : null

    try {
      let resultado
      if (isEdicao) {
        resultado = await editarQuestionario(questionario.id, titulo, descricao, perguntas, encerraEmDate, anonimo, corTema, usuariosEsperadosNum)
      } else {
        resultado = await criarQuestionario(titulo, descricao, perguntas, encerraEmDate, anonimo, corTema, usuariosEsperadosNum)
      }

      if ('error' in resultado && resultado.error) {
        setErro(resultado.error as string)
        setSalvando(false)
      } else if ('questionario' in resultado && resultado.questionario) {
        router.push(`/questionarios/${(resultado.questionario as { id: number }).id}`)
      }
    } catch {
      setErro('Erro ao salvar questionário')
      setSalvando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {erro && (
        <p className="text-sm bg-red-950/40 border border-red-900 rounded-lg px-4 py-2" style={{ color: '#f87171' }}>
          {erro}
        </p>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          Título *
        </label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título do questionário"
          className="rounded-lg px-4 py-2 text-sm focus:outline-none transition-colors"
          style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          Descrição
        </label>
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Descrição do questionário (opcional)"
          rows={3}
          className="rounded-lg px-4 py-2 text-sm focus:outline-none transition-colors resize-none"
          style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          Prazo de encerramento (opcional)
        </label>
        <input
          type="datetime-local"
          value={encerraEm}
          onChange={(e) => setEncerraEm(e.target.value)}
          className="rounded-lg px-4 py-2 text-sm focus:outline-none transition-colors"
          style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
        />
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          Se definido, o questionário encerrará automaticamente nesta data.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          Número de respostas esperadas (opcional)
        </label>
        <input
          type="number"
          min="1"
          value={usuariosEsperados}
          onChange={(e) => setUsuariosEsperados(e.target.value)}
          placeholder="Ex: 50"
          className="rounded-lg px-4 py-2 text-sm focus:outline-none transition-colors"
          style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
        />
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          Ao atingir este número de respostas, você receberá uma notificação.
        </p>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <div
          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
          style={{ backgroundColor: anonimo ? 'var(--btn-primary-bg)' : 'var(--btn-secondary-bg)' }}
          onClick={() => setAnonimo(!anonimo)}
        >
          <span
            className="inline-block h-4 w-4 transform rounded-full transition-transform"
            style={{ backgroundColor: 'var(--btn-primary-text)', transform: anonimo ? 'translateX(22px)' : 'translateX(2px)' }}
          />
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Permitir respostas anônimas
          </p>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Quando ativo, qualquer pessoa pode responder sem estar logada.
          </p>
        </div>
      </label>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          Cor do tema (opcional)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={corTema}
            onChange={(e) => setCorTema(e.target.value)}
            className="w-10 h-10 rounded cursor-pointer"
          />
          <input
            type="text"
            value={corTema}
            onChange={(e) => setCorTema(e.target.value)}
            placeholder="#6366f1"
            className="flex-1 rounded-lg px-4 py-2 text-sm focus:outline-none transition-colors"
            style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
          />
        </div>
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          Cor utilizada nos botões e destaques do questionário.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Perguntas</h2>
          <div className="flex gap-2">
            <ImportarJson
              onImport={handleImportarJson}
              tituloAtual={titulo}
              descricaoAtual={descricao}
            />
            <button
              type="button"
              onClick={adicionarPergunta}
              className="text-sm font-medium rounded-lg px-3 py-1.5 transition-colors"
              style={{ backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)' }}
            >
              + Adicionar pergunta
            </button>
          </div>
        </div>

        {perguntas.length === 0 && (
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Nenhuma pergunta adicionada. Clique em &quot;Adicionar pergunta&quot; para começar.
          </p>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={perguntas.map((_, i) => i)} strategy={verticalListSortingStrategy}>
            {perguntas.map((pergunta, idx) => (
              <div
                key={idx}
                className="rounded-lg"
                style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
              >
                <SortablePergunta
                  idx={idx}
                  pergunta={pergunta}
                  perguntas={perguntas}
                  onUpdate={atualizarPergunta}
                  onRemove={removerPergunta}
                  onAddOption={adicionarOpcao}
                  onRemoveOption={removerOpcao}
                  onUpdateOption={atualizarOpcao}
                  onToggleCorreta={toggleCorreta}
                  total={perguntas.length}
                />
              </div>
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={salvando || perguntas.length === 0}
          className="font-medium rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
          style={{ backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }}
        >
          {salvando ? 'Salvando...' : isEdicao ? 'Salvar alterações' : 'Criar questionário'}
        </button>
        <button
          type="button"
          onClick={() => setMostrarPreview(true)}
          disabled={perguntas.length === 0}
          className="font-medium rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
          style={{ backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)' }}
        >
          Preview
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="font-medium rounded-lg px-4 py-2 transition-colors"
          style={{ backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)' }}
        >
          Cancelar
        </button>
      </div>

      {mostrarPreview && (
        <PreviewQuestionario
          questionario={{
            titulo: titulo || 'Sem título',
            descricao,
            perguntas: perguntas.map((p, i) => ({
              ...p,
              id: i,
              ordem: i + 1,
            })),
          }}
          onFechar={() => setMostrarPreview(false)}
        />
      )}
    </form>
  )
}
