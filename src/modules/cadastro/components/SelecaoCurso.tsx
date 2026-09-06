'use client'

import { useState, useEffect } from 'react'
import { listarCursos, type CursosDisponiveis } from '../cadastro.actions'

interface SelecaoCursoProps {
  onSelect: (turmaId: number | null) => void
  selectedTurmaId: number | null
}

export default function SelecaoCurso({ onSelect, selectedTurmaId }: SelecaoCursoProps) {
  const [cursos, setCursos] = useState<CursosDisponiveis[]>([])
  const [cursoSelecionado, setCursoSelecionado] = useState<number | null>(null)
  const [turmaSelecionada, setTurmaSelecionada] = useState<number | null>(selectedTurmaId)
  const [anoSelecionado, setAnoSelecionado] = useState<number | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregarCursos() {
      try {
        const dados = await listarCursos()
        setCursos(dados)
      } catch (error) {
        console.error('Erro ao carregar cursos:', error)
      } finally {
        setCarregando(false)
      }
    }
    carregarCursos()
  }, [])

  useEffect(() => {
    if (selectedTurmaId) {
      const curso = cursos.find(c => 
        c.turmas.some(t => t.id === selectedTurmaId)
      )
      if (curso) {
        setCursoSelecionado(curso.id)
        setTurmaSelecionada(selectedTurmaId)
        const turma = curso.turmas.find(t => t.id === selectedTurmaId)
        if (turma) {
          setAnoSelecionado(new Date(turma.dataInicio).getFullYear())
        }
      }
    }
  }, [selectedTurmaId, cursos])

  const cursoAtual = cursos.find(c => c.id === cursoSelecionado)
  const anosDisponiveis = cursoAtual?.anosDisponiveis || []
  const turmasFiltradas = cursoAtual?.turmas.filter(turma => {
    if (!anoSelecionado) return true
    const anoTurma = new Date(turma.dataInicio).getFullYear()
    return anoTurma === anoSelecionado
  }) || []

  const formatarData = (data: Date) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const handleCursoChange = (cursoId: string) => {
    const id = cursoId ? parseInt(cursoId) : null
    setCursoSelecionado(id)
    setTurmaSelecionada(null)
    setAnoSelecionado(null)
    onSelect(null)
  }

  const handleAnoChange = (ano: string) => {
    const valor = ano ? parseInt(ano) : null
    setAnoSelecionado(valor)
    setTurmaSelecionada(null)
    onSelect(null)
  }

  const handleTurmaChange = (turmaId: string) => {
    const id = turmaId ? parseInt(turmaId) : null
    setTurmaSelecionada(id)
    onSelect(id)
  }

  if (carregando) {
    return (
      <div style={{ 
        padding: '1rem',
        color: 'var(--text-secondary)',
        textAlign: 'center'
      }}>
        Carregando cursos disponíveis...
      </div>
    )
  }

  if (cursos.length === 0) {
    return (
      <div style={{ 
        padding: '1rem',
        color: 'var(--text-secondary)',
        textAlign: 'center',
        backgroundColor: 'var(--input-bg)',
        borderRadius: '8px'
      }}>
        Nenhum curso disponível no momento.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label 
          htmlFor="curso" 
          style={{ 
            display: 'block', 
            marginBottom: '0.5rem',
            color: 'var(--text-primary)',
            fontWeight: 500
          }}
        >
          Selecione o Curso
        </label>
        <select
          id="curso"
          value={cursoSelecionado || ''}
          onChange={(e) => handleCursoChange(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid var(--input-border)',
            backgroundColor: 'var(--input-bg)',
            color: 'var(--text-primary)',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          <option value="">Selecione um curso...</option>
          {cursos.map((curso) => (
            <option key={curso.id} value={curso.id}>
              {curso.nome}
            </option>
          ))}
        </select>
      </div>

      {cursoSelecionado && anosDisponiveis.length > 0 && (
        <div>
          <label 
            htmlFor="ano" 
            style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              color: 'var(--text-primary)',
              fontWeight: 500
            }}
          >
            Selecione o Ano
          </label>
          <select
            id="ano"
            value={anoSelecionado || ''}
            onChange={(e) => handleAnoChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--input-border)',
              backgroundColor: 'var(--input-bg)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            <option value="">Todos os anos</option>
            {anosDisponiveis.map((ano) => (
              <option key={ano} value={ano}>
                {ano}
              </option>
            ))}
          </select>
        </div>
      )}

      {cursoSelecionado && (
        <div>
          <label 
            htmlFor="turma" 
            style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              color: 'var(--text-primary)',
              fontWeight: 500
            }}
          >
            Selecione a Turma
          </label>
          <select
            id="turma"
            value={turmaSelecionada || ''}
            onChange={(e) => handleTurmaChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--input-border)',
              backgroundColor: 'var(--input-bg)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            <option value="">Selecione uma turma...</option>
            {turmasFiltradas.map((turma) => (
              <option key={turma.id} value={turma.id}>
                {turma.nome} ({formatarData(turma.dataInicio)} - {formatarData(turma.dataFim)})
              </option>
            ))}
          </select>
        </div>
      )}

      {turmaSelecionada && cursoAtual && (
        <div style={{
          padding: '1rem',
          backgroundColor: 'var(--card-bg)',
          borderRadius: '8px',
          border: '1px solid var(--input-border)'
        }}>
          <h4 style={{ 
            margin: '0 0 0.5rem 0',
            color: 'var(--text-primary)'
          }}>
            {cursoAtual.nome}
          </h4>
          {cursoAtual.descricao && (
            <p style={{ 
              margin: '0 0 0.5rem 0',
              color: 'var(--text-secondary)',
              fontSize: '0.9rem'
            }}>
              {cursoAtual.descricao}
            </p>
          )}
          <p style={{ 
            margin: 0,
            color: 'var(--text-secondary)',
            fontSize: '0.85rem'
          }}>
            Turma: {turmasFiltradas.find(t => t.id === turmaSelecionada)?.nome}
          </p>
        </div>
      )}
    </div>
  )
}
