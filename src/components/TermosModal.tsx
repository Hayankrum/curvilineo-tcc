'use client'

import { useActionState } from 'react'
import { aceitarTermos } from '@/modules/usuarios/usuarios.actions'

interface TermosModalProps {
  isOpen: boolean
  onClose?: () => void
  readonly?: boolean
}

async function aceitarTermosAction() {
  return await aceitarTermos()
}

export default function TermosModal({ isOpen, onClose, readonly = false }: TermosModalProps) {
  const [estado, formAction, pending] = useActionState(aceitarTermosAction, null)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="relative w-full max-w-2xl max-h-[85vh] mx-4 rounded-xl shadow-2xl overflow-hidden flex flex-col"
        style={{ backgroundColor: 'var(--card-bg)' }}
      >
        <div className="px-6 pt-6 pb-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Termos de Uso e Compromisso
          </h1>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg transition-colors hover:bg-[var(--btn-secondary-bg)]"
              style={{ color: 'var(--text-secondary)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 prose prose-sm max-w-none" style={{ color: 'var(--text-secondary)' }}>
          <h2 className="text-lg font-semibold mt-4 mb-2" style={{ color: 'var(--text-primary)' }}>1. Aceitação dos Termos</h2>
          <p className="mb-4">
            Ao acessar e utilizar esta plataforma, você concorda em cumprir e estar vinculado a estes Termos de Uso.
            Se não concordar com algum dos termos, não utilize a plataforma.
          </p>

          <h2 className="text-lg font-semibold mt-4 mb-2" style={{ color: 'var(--text-primary)' }}>2. Uso da Plataforma</h2>
          <p className="mb-4">
            Você concorda em utilizar a plataforma de forma ética e em conformidade com todas as leis e regulamentações aplicáveis.
            É proibido utilizar a plataforma para atividades ilegais, fraudulentas ou que violem direitos de terceiros.
          </p>

          <h2 className="text-lg font-semibold mt-4 mb-2" style={{ color: 'var(--text-primary)' }}>3. Conteúdo do Usuário</h2>
          <p className="mb-4">
            Você é responsável por todo o conteúdo que publica na plataforma. Ao publicar conteúdo, você declara que possui
            os direitos necessários e que o conteúdo não viola direitos de terceiros.
          </p>

          <h2 className="text-lg font-semibold mt-4 mb-2" style={{ color: 'var(--text-primary)' }}>4. Privacidade</h2>
          <p className="mb-4">
            Respeitamos sua privacidade. Seus dados pessoais serão tratados de acordo com nossa política de privacidade.
            Não compartilhamos suas informações com terceiros sem seu consentimento.
          </p>

          <h2 className="text-lg font-semibold mt-4 mb-2" style={{ color: 'var(--text-primary)' }}>5. Responsabilidades</h2>
          <p className="mb-4">
            A plataforma é fornecida &quot;como está&quot;, sem garantias de qualquer tipo. Não nos responsabilizamos por danos
            diretos ou indiretos decorrentes do uso da plataforma.
          </p>

          <h2 className="text-lg font-semibold mt-4 mb-2" style={{ color: 'var(--text-primary)' }}>6. Modificações</h2>
          <p className="mb-4">
            Reservamos o direito de modificar estes termos a qualquer momento. As modificações entram em vigor
            imediatamente após a publicação na plataforma.
          </p>

          <h2 className="text-lg font-semibold mt-4 mb-2" style={{ color: 'var(--text-primary)' }}>7. Compromisso</h2>
          <p className="mb-4">
            Ao aceitar estes termos, você se compromete a:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Manter sua conta e senha seguras</li>
            <li>Não compartilhar sua conta com terceiros</li>
            <li>Reportar qualquer uso não autorizado de sua conta</li>
            <li>Respeitar os direitos de outros usuários</li>
            <li>Utilizar a plataforma de forma responsável</li>
          </ul>
        </div>

        <div className="px-6 py-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
          {readonly ? (
            <button
              type="button"
              onClick={onClose}
              className="w-full font-medium rounded-lg px-6 py-3 transition-colors"
              style={{ backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--text-primary)' }}
            >
              Fechar
            </button>
          ) : (
            <>
              {estado?.success && (
                <div className="alert-success mb-3" role="status">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="m9 12 2 2 4-4"/>
                  </svg>
                  Termos aceitos com sucesso!
                </div>
              )}

              {estado?.error && (
                <div className="alert-error mb-3" role="alert">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {estado.error}
                </div>
              )}

              <form action={formAction}>
                <button
                  type="submit"
                  disabled={pending}
                  className="w-full font-medium rounded-lg px-6 py-3 transition-colors disabled:opacity-50"
                  style={{ backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }}
                >
                  {pending ? 'Aceitando...' : 'Aceitar Termos e Compromisso'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
