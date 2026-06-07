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
    <div className="max-w-md space-y-4">
      {showSuccess && (
        <div className="text-green-600 text-sm p-2 bg-green-50 rounded">
          {t('account.saveSuccess')}
        </div>
      )}
      
      <div className="space-y-2">
        <label className="text-sm font-medium">{t('account.name')}</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('account.name')}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">{t('account.email')}</label>
        <Input
          value={user.email}
          readOnly
          disabled
          className="bg-muted"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">{t('account.phone')}</label>
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t('account.phone')}
        />
      </div>

      <Button onClick={handleSave}>
        {t('account.save')}
      </Button>
    </div>
  )
}