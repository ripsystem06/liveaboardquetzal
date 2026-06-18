'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/language-context'
import { useUser } from '@/contexts/user-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { BookingAction } from './booking-page-client'

interface RegisterFormProps {
  dispatch: React.Dispatch<BookingAction>
}

export function RegisterForm({ dispatch }: RegisterFormProps) {
  const { t } = useLanguage()
  const { register } = useUser()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const isEmailValid = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name || !email || !password || !confirmPassword) {
      setError(t('booking.register.invalid'))
      return
    }

    if (!isEmailValid(email)) {
      setError(t('booking.login.invalid'))
      return
    }

    if (password !== confirmPassword) {
      setError(t('booking.register.passwordMismatch'))
      return
    }

    await register(name, email, password)
    dispatch({ type: 'LOGIN_COMPLETED' })
  }

  const clearError = (field: string) => {
    if (error === t('booking.register.invalid') || error === t('booking.login.invalid') || error === t('booking.register.passwordMismatch')) {
      setError('')
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-serif text-primary mb-6">{t('booking.register.title')}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="register-name" className="text-sm font-medium text-primary">
            {t('booking.register.name')}
          </label>
          <Input
            id="register-name"
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); clearError('name') }}
            placeholder="John Doe"
            aria-label={t('booking.register.name')}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="register-email" className="text-sm font-medium text-primary">
            {t('booking.register.email')}
          </label>
          <Input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearError('email') }}
            placeholder="john@example.com"
            aria-label={t('booking.register.email')}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="register-password" className="text-sm font-medium text-primary">
            {t('booking.register.password')}
          </label>
          <Input
            id="register-password"
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearError('password') }}
            placeholder="******"
            aria-label={t('booking.register.password')}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="register-confirm-password" className="text-sm font-medium text-primary">
            {t('booking.register.confirmPassword')}
          </label>
          <Input
            id="register-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); clearError('confirmPassword') }}
            placeholder="******"
            aria-label={t('booking.register.confirmPassword')}
          />
        </div>

        {error && (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90">
          {t('booking.register.submit')}
        </Button>
      </form>
    </div>
  )
}
