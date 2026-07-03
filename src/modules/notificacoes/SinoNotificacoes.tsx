'use client'

import { usePushSubscription } from '@/lib/usePushSubscription'

export default function SinoNotificacoes() {
  const { isSubscribed, isSupported, isLoading, subscribe, unsubscribe } = usePushSubscription()

  if (!isSupported || isLoading) return null

  const handleClick = async () => {
    if (isSubscribed) {
      await unsubscribe()
    } else {
      const result = await subscribe()
      if (!result.success) {
        alert(result.error)
      }
    }
  }

  return (
    <button
      onClick={handleClick}
      className="relative text-zinc-400 hover:text-white transition-colors"
      title={isSubscribed ? 'Desativar notificações' : 'Ativar notificações'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
      {isSubscribed && (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full" />
      )}
    </button>
  )
}
