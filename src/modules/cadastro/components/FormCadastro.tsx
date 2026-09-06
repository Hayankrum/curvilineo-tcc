'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import SelecaoCurso from './SelecaoCurso'
import TipoUsuario from './TipoUsuario'
import { inscreverUsuario } from '../cadastro.actions'

interface FormCadastroProps {
  usuarioLogado?: boolean
}

export default function FormCadastro({ usuarioLogado = false }: FormCadastroProps) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [turmaId, setTurmaId] = useState<number | null>(null)
  const [tipoUsuario, setTipoUsuario] = useState('discente')

  async function inscreverAction(
    _prev: { error?: string; success?: string } | null,
    _formData: FormData
  ) {
    if (!turmaId) {
      return { error: 'Selecione uma turma' }
    }
    return await inscreverUsuario(turmaId, tipoUsuario)
  }

  const [estado, formAction, pending] = useActionState(inscreverAction, null)

  const handleCheckboxChange = (checked: boolean) => {
    if (!usuarioLogado) return
    setMostrarFormulario(checked)
    if (!checked) {
      setTurmaId(null)
      setTipoUsuario('discente')
    }
  }

  if (!usuarioLogado) {
    return (
      <div style={{
        padding: '2rem',
        backgroundColor: 'var(--card-bg)',
        borderRadius: '12px',
        border: '1px solid var(--input-border)',
        textAlign: 'center'
      }}>
        <p style={{ 
          margin: '0 0 1rem 0',
          color: 'var(--text-secondary)'
        }}>
          Faça login para se inscrever em um curso.
        </p>
        <a
          href="/usuarios/login"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            backgroundColor: 'var(--btn-primary-bg)',
            color: 'var(--btn-primary-text)',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 500
          }}
        >
          Entrar
        </a>
      </div>
    )
  }

  return (
    <div style={{
      backgroundColor: 'var(--card-bg)',
      borderRadius: '12px',
      border: '1px solid var(--input-border)',
      overflow: 'hidden'
    }}>
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '1.5rem',
          cursor: 'pointer',
          borderBottom: mostrarFormulario ? '1px solid var(--input-border)' : 'none',
          transition: 'background-color 0.2s ease'
        }}
      >
        <input
          type="checkbox"
          checked={mostrarFormulario}
          onChange={(e) => handleCheckboxChange(e.target.checked)}
          style={{
            width: '20px',
            height: '20px',
            cursor: 'pointer',
            accentColor: 'var(--btn-primary-bg)'
          }}
        />
        <div>
          <span style={{ 
            fontWeight: 600, 
            color: 'var(--text-primary)',
            fontSize: '1.1rem'
          }}>
            Desejo me inscrever em um curso
          </span>
          <p style={{ 
            margin: '0.25rem 0 0 0',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem'
          }}>
            Selecione o curso, turma e tipo de participação
          </p>
        </div>
      </label>

      {mostrarFormulario && (
        <form action={formAction} style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <SelecaoCurso
              onSelect={setTurmaId}
              selectedTurmaId={turmaId}
            />

            <TipoUsuario
              value={tipoUsuario}
              onChange={setTipoUsuario}
            />

            {estado?.error && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                borderRadius: '8px',
                fontSize: '0.9rem'
              }}>
                {estado.error}
              </div>
            )}

            {estado?.success && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#d1fae5',
                color: '#059669',
                borderRadius: '8px',
                fontSize: '0.9rem'
              }}>
                {estado.success}
              </div>
            )}

            <button
              type="submit"
              disabled={pending || !turmaId}
              style={{
                padding: '1rem 2rem',
                backgroundColor: pending || !turmaId ? 'var(--btn-disabled-bg)' : 'var(--btn-primary-bg)',
                color: pending || !turmaId ? 'var(--btn-disabled-text)' : 'var(--btn-primary-text)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: pending || !turmaId ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {pending ? 'Inscrevendo...' : 'Confirmar Inscrição'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
