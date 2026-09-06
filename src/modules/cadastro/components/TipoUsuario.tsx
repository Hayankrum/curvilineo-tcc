'use client'

interface TipoUsuarioProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

const TIPOS_USUARIO = [
  { valor: 'discente', label: 'Discente', descricao: 'Aluno(a) do curso' },
  { valor: 'docente', label: 'Docente', descricao: 'Professor(a) ou instrutor(a)' }
]

export default function TipoUsuario({ value, onChange, disabled = false }: TipoUsuarioProps) {
  return (
    <div>
      <label 
        style={{ 
          display: 'block', 
          marginBottom: '0.75rem',
          color: 'var(--text-primary)',
          fontWeight: 500
        }}
      >
        Tipo de Usuário
      </label>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '0.75rem'
      }}>
        {TIPOS_USUARIO.map((tipo) => (
          <label
            key={tipo.valor}
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '1rem',
              borderRadius: '8px',
              border: `2px solid ${value === tipo.valor ? 'var(--btn-primary-bg)' : 'var(--input-border)'}`,
              backgroundColor: value === tipo.valor ? 'var(--btn-primary-bg-alpha)' : 'var(--input-bg)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.6 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            <input
              type="radio"
              name="tipoUsuario"
              value={tipo.valor}
              checked={value === tipo.valor}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              style={{ display: 'none' }}
            />
            <span style={{ 
              fontWeight: 600, 
              color: 'var(--text-primary)',
              marginBottom: '0.25rem'
            }}>
              {tipo.label}
            </span>
            <span style={{ 
              fontSize: '0.8rem', 
              color: 'var(--text-secondary)' 
            }}>
              {tipo.descricao}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
