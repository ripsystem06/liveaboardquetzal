'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/language-context'
import { useUser } from '@/contexts/user-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { BookingAction } from './booking-page-client'

interface LoginFormProps {
  dispatch: React.Dispatch<BookingAction>
}

export function LoginForm({ dispatch }: LoginFormProps) {
  const { t } = useLanguage()
  const { login } = useUser()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError(t('booking.login.invalid'))
      return
    }

    const ok = await login(email, password)
    if (ok) {
      dispatch({ type: 'LOGIN_COMPLETED' })
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
            placeholder="demo@quetzal.com"
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