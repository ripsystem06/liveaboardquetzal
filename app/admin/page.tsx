'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/user-context'
import { AdminLayout } from '@/components/admin/admin-layout'

export default function AdminPage() {
  const { isAuthenticated, isAdmin, sessionReady } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!sessionReady) return
    if (!isAuthenticated) {
      router.replace('/booking')
    } else if (isAuthenticated && !isAdmin) {
      router.replace('/')
    }
  }, [isAuthenticated, isAdmin, sessionReady, router])

  if (!sessionReady || !isAuthenticated || !isAdmin) {
    return null
  }

  return <AdminLayout />
}
