'use client'

import dynamic from 'next/dynamic'

const TestesPushContent = dynamic(() => import('./TestesPushContent'), { ssr: false })

export default function TestesPushPage() {
  return <TestesPushContent />
}
