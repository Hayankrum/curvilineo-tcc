'use client'

interface Props {
  cor: string | null
  compacto?: boolean
  className?: string
}

export default function BannerQuestionario({ cor, compacto = false, className = '' }: Props) {
  const corBase = cor || 'var(--accent)'

  return (
    <div
      className={`w-full overflow-hidden rounded-lg ${compacto ? 'h-16' : 'h-24'} ${className}`}
      style={{ backgroundColor: corBase }}
    />
  )
}