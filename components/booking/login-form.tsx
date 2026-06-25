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
      // Set session cookie for API authentication
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: email }),
      })
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
    <div className="rounded-2xl bg-card p-8 shadow-[0_2px_8px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)]">
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-accent/10">
          <svg className="size-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        </div>
        <h2 className="text-2xl font-serif text-primary text-balance">{t('booking.login.title')}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="login-email" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('booking.login.email')}
          </label>
          <Input
            id="login-email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="demo@quetzal.com"
            aria-label={t('booking.login.email')}
            className="h-11 rounded-xl bg-muted/40 border-transparent focus:bg-background focus:border-accent/40 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="login-password" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('booking.login.password')}
          </label>
          <Input
            id="login-password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="******"
            aria-label={t('booking.login.password')}
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
          {t('booking.login.submit')}
        </Button>
      </form>
    </div>
  )
}