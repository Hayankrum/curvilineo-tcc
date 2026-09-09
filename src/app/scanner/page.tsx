import QRCodeScanner from '@/components/QRCodeScanner'

export const metadata = {
  title: 'Scanner QR Code - Ellora',
  description: 'Escaneie QR codes para acessar questionários rapidamente',
}

export default function ScannerPage() {
  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Scanner QR Code
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Escaneie o QR code do questionário para acessá-lo rapidamente
        </p>
      </div>

      <QRCodeScanner />

      <div className="text-center mt-4">
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          Dica: Se o Ellora estiver instalado como PWA, os links abrirão diretamente no app
        </p>
      </div>
    </div>
  )
}
