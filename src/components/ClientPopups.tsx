'use client'

import { ReactNode } from 'react'
import InstallPWMPopup from '@/components/InstallPWMPopup'
import NotificationPermissionPopup from '@/components/NotificationPermissionPopup'

export default function ClientPopups({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <InstallPWMPopup />
      <NotificationPermissionPopup />
    </>
  )
}
