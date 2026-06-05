'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/language-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface LoginFormProps {
  onSuccess: () => void
}

const VALID_EMAIL = 'user123'
const VALID_PASSWORD = '123456'

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError(t('booking.login.invalid'))
      return
    }

    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      onSuccess()
    } else {
      setError(t('booking.login.error'))
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (error === t('booking.login.invalid')) {
      setError('')
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-serif text-primary mb-6">{t('booking.login.title')}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="login-email" className="text-sm font-medium text-primary">
            {t('booking.login.email')}
          </label>
          <Input
            id="login-email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="user123"
            aria-label={t('booking.login.email')}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="login-password" className="text-sm font-medium text-primary">
            {t('booking.login.password')}
          </label>
          <Input
            id="login-password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="******"
            aria-label={t('booking.login.password')}
          />
        </div>

        {error && (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90">
          {t('booking.login.submit')}
        </Button>
      </form>
    </div>
  )
}