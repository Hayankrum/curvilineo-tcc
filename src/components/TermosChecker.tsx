'use client'

import { useState, useEffect } from 'react'
import TermosModal from './TermosModal'

interface TermosCheckerProps {
  children: React.ReactNode
  usuario: {
    id: number
    aceitouTermos?: boolean
  } | null
}

export default function TermosChecker({ children, usuario }: TermosCheckerProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const precisaAceitar = mounted && usuario && !usuario.aceitouTermos

  return (
    <>
      <TermosModal isOpen={!!precisaAceitar} />
      {precisaAceitar ? null : <>{children}</>}
    </>
  )
}
