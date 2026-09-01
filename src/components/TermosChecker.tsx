'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

interface TermosCheckerProps {
  children: React.ReactNode
  usuario: {
    id: number
    aceitouTermos?: boolean
  } | null
}

const PUBLIC_ROUTES = ['/usuarios/login', '/usuarios/registro', '/termos', '/usuarios/logout']

export default function TermosChecker({ children, usuario }: TermosCheckerProps) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (usuario && !usuario.aceitouTermos && !PUBLIC_ROUTES.includes(pathname)) {
      router.push('/termos')
    }
  }, [usuario, pathname, router])

  if (usuario && !usuario.aceitouTermos && !PUBLIC_ROUTES.includes(pathname)) {
    return null
  }

  return <>{children}</>
}
