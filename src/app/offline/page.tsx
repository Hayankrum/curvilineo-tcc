'use client'

export default function OfflinePage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      padding: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#09090b',
      color: '#fafafa',
    }}>
      <div style={{ fontSize: '48px', marginBottom: '24px' }}>📡</div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#fafafa' }}>
        Você está offline
      </h1>
      <p style={{ marginBottom: '24px', maxWidth: '400px', color: '#a1a1aa', lineHeight: '1.5' }}>
        Esta página ainda não foi salva para uso offline. Navegue para páginas já visitadas enquanto sua conexão é restaurada.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: '12px 24px',
          borderRadius: '8px',
          border: '1px solid #3f3f46',
          backgroundColor: '#27272a',
          color: '#fafafa',
          cursor: 'pointer',
          fontSize: '14px',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3f3f46'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#27272a'}
      >
        Tentar Novamente
      </button>
    </div>
  )
}
