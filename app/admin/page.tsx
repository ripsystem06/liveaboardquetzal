'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/user-context'
import { AdminLayout } from '@/components/admin/admin-layout'

export default function AdminPage() {
  const { isAuthenticated, isAdmin } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/booking')
    } else if (isAuthenticated && !isAdmin) {
      router.replace('/')
    }
  }, [isAuthenticated, isAdmin, router])

  if (!isAuthenticated || !isAdmin) {
    return null
  }

  return <AdminLayout />
}
