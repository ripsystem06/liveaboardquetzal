'use client'

import { useLanguage } from '@/contexts/language-context'
import { User, Users, Ship, Compass, LogIn, UserPlus, CreditCard } from 'lucide-react'

const reservationTypes = [
  {
    icon: User,
    titleKey: 'booking.info.individual',
    descKey: 'booking.info.individualDesc',
  },
  {
    icon: Users,
    titleKey: 'booking.info.half',
    descKey: 'booking.info.halfDesc',
  },
  {
    icon: Ship,
    titleKey: 'booking.info.full',
    descKey: 'booking.info.fullDesc',
  },
]

const howItWorks = [
  {
    icon: LogIn,
    titleKey: 'booking.info.signin',
    descKey: 'booking.info.signinDesc',
  },
  {
    icon: Compass,
    titleKey: 'booking.info.choose',
    descKey: 'booking.info.chooseDesc',
  },
  {
    icon: UserPlus,
    titleKey: 'booking.info.guests',
    descKey: 'booking.info.guestsDesc',
  },
  {
    icon: CreditCard,
    titleKey: 'booking.info.confirm',
    descKey: 'booking.info.confirmDesc',
  },
]

export function ReservationInfoCards() {
  const { t } = useLanguage()

  return (
    <div className="space-y-12">
      {/* Reservation Types */}
      <div>
        <h2 className="font-serif text-2xl font-normal text-foreground mb-6">
          {t('booking.info.types')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reservationTypes.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.titleKey}
                className="bg-card rounded-lg border border-border p-6 hover:border-accent/30 transition-colors"
              >
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-serif text-lg font-normal text-foreground mb-2">
                  {t(item.titleKey)}
                </h3>
                <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                  {t(item.descKey)}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* How It Works */}
      <div>
        <h2 className="font-serif text-2xl font-normal text-foreground mb-6">
          {t('booking.info.how')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {howItWorks.map((item, index) => {
            const Icon = item.icon
            return (
              <div
                key={item.titleKey}
                className="bg-card rounded-lg border border-border p-6 hover:border-accent/30 transition-colors"
              >
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-serif text-lg font-normal text-foreground mb-2">
                  {t(item.titleKey)}
                </h3>
                <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                  {t(item.descKey)}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}