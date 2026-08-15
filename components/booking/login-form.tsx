'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/language-context'
import { useUser } from '@/contexts/user-context'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { BookingAction } from './booking-page-client'

interface LoginFormProps {
  dispatch: React.Dispatch<BookingAction>
}

export function LoginForm({ dispatch }: LoginFormProps) {
  const { t } = useLanguage()
  const { requestOtp, verifyOtp, verifyTwoFactor } = useUser()
  const [step, setStep] = useState<'email' | 'code' | 'twoFactor'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [maskedEmail, setMaskedEmail] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfo('')

    if (!email) {
      setError(t('booking.login.invalid'))
      return
    }

    setLoading(true)
    try {
      await requestOtp(email)
      setInfo(t('booking.login.sent'))
      setStep('code')
    } catch {
      setError(t('booking.login.requestError'))
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!otp) {
      setError(t('booking.login.invalidCode'))
      return
    }

    setLoading(true)
    try {
      const outcome = await verifyOtp(email, otp, name || undefined)
      if (outcome.kind === 'success') {
        dispatch({ type: 'LOGIN_COMPLETED' })
      } else if (outcome.kind === 'twoFactorRequired') {
        setMaskedEmail(outcome.maskedEmail)
        setStep('twoFactor')
      } else {
        setError(t('booking.login.error'))
      }
    } catch {
      setError(t('booking.login.error'))
    } finally {
      setLoading(false)
    }
  }

  const handleTwoFactorVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!twoFactorCode) {
      setError(t('booking.login.invalidCode'))
      return
    }

    setLoading(true)
    try {
      const ok = await verifyTwoFactor(email, otp, twoFactorCode, name || undefined)
      if (ok) {
        dispatch({ type: 'LOGIN_COMPLETED' })
      } else {
        setError(t('booking.login.error'))
      }
    } catch {
      setError(t('booking.login.error'))
    } finally {
      setLoading(false)
    }
  }

  const handleBackToCode = () => {
    setStep('code')
    setError('')
    setTwoFactorCode('')
  }

  const handleBack = () => {
    setStep('email')
    setError('')
    setInfo('')
  }

  const handleResend = async () => {
    setError('')
    setInfo('')
    try {
      await requestOtp(email)
      setInfo(t('booking.login.sent'))
    } catch {
      setError(t('booking.login.requestError'))
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    try {
      await signIn('google', { callbackUrl: '/booking?step=2' })
    } catch {
      setGoogleLoading(false)
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (error === t('booking.login.invalid')) {
      setError('')
    }
  }

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value)
    if (error === t('booking.login.invalidCode')) {
      setError('')
    }
  }

  return (
    <div className="rounded-2xl bg-card p-8 shadow-[0_2px_8px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)]">
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-accent/10">
          <svg className="size-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        </div>
        <h2 className="text-2xl font-serif text-primary text-balance">{step === 'twoFactor' ? t('booking.login.twoFactorTitle') : t('booking.login.title')}</h2>
      </div>

      {/* Google Sign-In Button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
        className="w-full h-11 rounded-xl border-2 border-muted-foreground/20 hover:border-muted-foreground/40 font-semibold mb-6 gap-3 active:scale-[0.96] transition-transform"
        aria-label="Sign in with Google"
      >
        <svg className="size-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        {t('booking.login.google') || 'Sign in with Google'}
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-muted-foreground/20" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">{t('booking.login.orContinue') || 'or continue with'}</span>
        </div>
      </div>

      {step === 'email' ? (
        <form onSubmit={handleRequestCode} className="space-y-5">
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

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-destructive/5 px-4 py-3 text-sm text-destructive border border-destructive/10" role="alert">
              <svg className="mt-0.5 size-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-secondary hover:bg-secondary/90 font-semibold active:scale-[0.96] transition-transform">
            {t('booking.login.requestCode')}
          </Button>
        </form>
      ) : step === 'code' ? (
        <form onSubmit={handleVerify} className="space-y-5">
          {info && (
            <div className="flex items-start gap-2 rounded-xl bg-accent/10 px-4 py-3 text-sm text-accent border border-accent/20" role="status">
              <span>{info}</span>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="login-otp" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('booking.login.code')}
            </label>
            <Input
              id="login-otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={handleOtpChange}
              placeholder="123456"
              aria-label={t('booking.login.code')}
              className="h-11 rounded-xl bg-muted/40 border-transparent focus:bg-background focus:border-accent/40 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="login-name" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('booking.login.name')}
            </label>
            <Input
              id="login-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              aria-label={t('booking.login.name')}
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

          <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-secondary hover:bg-secondary/90 font-semibold active:scale-[0.96] transition-transform">
            {t('booking.login.verify')}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button type="button" onClick={handleBack} className="text-muted-foreground hover:text-foreground transition-colors">
              {t('booking.login.back')}
            </button>
            <button type="button" onClick={handleResend} className="text-accent hover:text-accent/80 font-semibold transition-colors">
              {t('booking.login.resend')}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleTwoFactorVerify} className="space-y-5">
          <div className="flex items-start gap-2 rounded-xl bg-accent/10 px-4 py-3 text-sm text-accent border border-accent/20" role="status">
            <div>
              <span>{t('booking.login.twoFactorInfo')}</span>
              {maskedEmail && (
                <div className="mt-1 font-semibold text-foreground">{maskedEmail}</div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="login-2fa" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('booking.login.twoFactorLabel')}
            </label>
            <Input
              id="login-2fa"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={twoFactorCode}
              onChange={(e) => {
                setTwoFactorCode(e.target.value)
                if (error === t('booking.login.invalidCode')) {
                  setError('')
                }
              }}
              placeholder="123456"
              aria-label={t('booking.login.twoFactorLabel')}
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

          <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-secondary hover:bg-secondary/90 font-semibold active:scale-[0.96] transition-transform">
            {t('booking.login.twoFactorVerify')}
          </Button>

          <button type="button" onClick={handleBackToCode} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
            {t('booking.login.back')}
          </button>
        </form>
      )}
    </div>
  )
}
