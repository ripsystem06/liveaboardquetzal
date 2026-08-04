'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/user-context'
import { useSession } from 'next-auth/react'
import { AdminLayout } from '@/components/admin/admin-layout'

export default function AdminPage() {
  const { isAuthenticated, sessionReady } = useUser()
  const { data: session, status } = useSession()
  const router = useRouter()

  const isAdmin = session?.user ? !!(session.user as { isAdmin?: boolean }).isAdmin : false
  const authReady = sessionReady && status !== 'loading'

  useEffect(() => {
    if (!authReady) return
    if (!isAuthenticated || status === 'unauthenticated') {
      router.replace('/booking')
    } else if (isAuthenticated && !isAdmin && status === 'authenticated') {
      router.replace('/')
    }
  }, [isAuthenticated, isAdmin, authReady, status, router])

  if (!authReady || !isAuthenticated || !isAdmin) {
    return null
  }

  return <AdminLayout />
}
