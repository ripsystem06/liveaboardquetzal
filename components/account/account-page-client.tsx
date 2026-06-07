'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/user-context'
import { useLanguage } from '@/contexts/language-context'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileForm } from '@/components/account/profile-form'
import { ReservationHistory } from '@/components/account/reservation-history'

export function AccountPageClient() {
  const { user, isAuthenticated } = useUser()
  const { t } = useLanguage()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/booking')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="profile">{t('account.profile')}</TabsTrigger>
          <TabsTrigger value="reservations">{t('account.reservations')}</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileForm user={user} />
        </TabsContent>
        <TabsContent value="reservations">
          <ReservationHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}