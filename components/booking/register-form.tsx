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
    <div className="rounded-2xl bg-card p-8 shadow-[0_2px_8px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)]">
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-accent/10">
          <svg className="size-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
          </svg>
        </div>
        <h2 className="text-2xl font-serif text-primary text-balance">{t('booking.register.title')}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="register-name" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('booking.register.name')}
          </label>
          <Input
            id="register-name"
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); clearError('name') }}
            placeholder="John Doe"
            aria-label={t('booking.register.name')}
            className="h-11 rounded-xl bg-muted/40 border-transparent focus:bg-background focus:border-accent/40 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="register-email" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('booking.register.email')}
          </label>
          <Input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearError('email') }}
            placeholder="john@example.com"
            aria-label={t('booking.register.email')}
            className="h-11 rounded-xl bg-muted/40 border-transparent focus:bg-background focus:border-accent/40 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="register-password" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('booking.register.password')}
          </label>
          <Input
            id="register-password"
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearError('password') }}
            placeholder="******"
            aria-label={t('booking.register.password')}
            className="h-11 rounded-xl bg-muted/40 border-transparent focus:bg-background focus:border-accent/40 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="register-confirm-password" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('booking.register.confirmPassword')}
          </label>
          <Input
            id="register-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); clearError('confirmPassword') }}
            placeholder="******"
            aria-label={t('booking.register.confirmPassword')}
            className="h-11 rounded-xl bg-muted/40 border-transparent focus:bg-background focus:border-accent/40 transition-colors"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-destructive/5 px-4 py-3 text-sm text-destructive border border-destructive/10" role="alert">
            <svg className="mt-0.5 size-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <Button type="submit" className="w-full h-11 rounded-xl bg-secondary hover:bg-secondary/90 font-semibold active:scale-[0.96] transition-transform">
          {t('booking.register.submit')}
        </Button>
      </form>
    </div>
  )
}
