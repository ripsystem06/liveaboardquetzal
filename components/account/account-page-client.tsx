'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/user-context'
import { useLanguage } from '@/contexts/language-context'
import { ProfileForm } from '@/components/account/profile-form'
import { ReservationHistory } from '@/components/account/reservation-history'
import { User, CalendarDays } from 'lucide-react'

type AccountTab = 'profile' | 'reservations'

export function AccountPageClient() {
  const { user, isAuthenticated } = useUser()
  const { t } = useLanguage()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<AccountTab>('profile')

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/booking')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || !user) {
    return null
  }

  const navItems: { id: AccountTab; icon: typeof User; label: string }[] = [
    { id: 'profile', icon: User, label: t('account.profile') },
    { id: 'reservations', icon: CalendarDays, label: t('account.reservations') },
  ]

  return (
    <div className="container mx-auto py-8 px-4 lg:px-8">
      {/* Welcome Header */}
      <div className="mb-10">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">
          {t('account.title')}
        </p>
        <h1 className="font-serif text-3xl md:text-4xl font-normal text-foreground text-balance">
          {t('account.welcome').replace('{name}', user.name)}
        </h1>
      </div>

      {/* Sidebar + Content Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-60 shrink-0">
          <nav className="rounded-2xl bg-card p-3 shadow-[0_2px_8px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)] space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-accent text-accent-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="size-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <div className="rounded-2xl bg-card p-8 shadow-[0_2px_8px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)]">
            {activeTab === 'profile' && <ProfileForm user={user} />}
            {activeTab === 'reservations' && <ReservationHistory />}
          </div>
        </main>
      </div>
    </div>
  )
}