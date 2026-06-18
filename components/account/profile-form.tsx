'use client'

import { useState } from 'react'
import { useUser } from '@/contexts/user-context'
import { useLanguage } from '@/contexts/language-context'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type User = { id: string; name: string; email: string; phone: string }

interface ProfileFormProps {
  user: User
}

export function ProfileForm({ user }: ProfileFormProps) {
  const { updateProfile } = useUser()
  const { t } = useLanguage()
  const [name, setName] = useState(user.name)
  const [phone, setPhone] = useState(user.phone)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSave = () => {
    updateProfile({ name, phone })
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div className="space-y-6">
      {showSuccess && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-100">
          <svg className="size-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          {t('account.saveSuccess')}
        </div>
      )}
      
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('account.name')}</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('account.name')}
          className="h-11 rounded-xl bg-muted/40 border-transparent focus:bg-background focus:border-accent/40 transition-colors"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('account.email')}</label>
        <Input
          value={user.email}
          readOnly
          disabled
          className="h-11 rounded-xl bg-muted/60 border-transparent text-muted-foreground cursor-not-allowed"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('account.phone')}</label>
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t('account.phone')}
          className="h-11 rounded-xl bg-muted/40 border-transparent focus:bg-background focus:border-accent/40 transition-colors"
        />
      </div>

      <Button onClick={handleSave} className="h-11 rounded-xl bg-secondary hover:bg-secondary/90 font-semibold active:scale-[0.96] transition-transform">
        {t('account.save')}
      </Button>
    </div>
  )
}