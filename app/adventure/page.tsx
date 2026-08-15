'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUser } from '@/contexts/user-context'

export default function AdventurePage() {
  const router = useRouter()
  const { requestOtp, verifyOtp } = useUser()
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await requestOtp(email)
      setStep('code')
    } catch {
      setError('Could not send the code')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const ok = await verifyOtp(email, otp)
      if (ok.kind === 'success') {
        router.push('/admin')
      } else {
        setError('Invalid or expired code')
      }
    } catch {
      setError('Invalid or expired code')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setStep('email')
    setError('')
  }

  return (
    <main className="min-h-screen bg-primary flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-accent/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/3 rounded-full blur-3xl" />

      <div className="relative w-full max-w-sm z-10">
        <div className="rounded-2xl bg-card p-8 shadow-[0_2px_8px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)]">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl text-primary mb-2">Quetzal</h1>
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Adventure Awaits
            </p>
          </div>

          {step === 'email' ? (
            <form onSubmit={handleRequestCode} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="adventure-email"
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Email
                </label>
                <Input
                  id="adventure-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@quetzal.com"
                  className="h-11 rounded-xl bg-muted/40 border-transparent focus:bg-background focus:border-accent/40 transition-colors"
                  required
                />
              </div>

              {error && (
                <div
                  className="flex items-start gap-2 rounded-xl bg-destructive/5 px-4 py-3 text-sm text-destructive border border-destructive/10"
                  role="alert"
                >
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-secondary hover:bg-secondary/90 font-semibold active:scale-[0.96] transition-transform"
              >
                {loading ? 'Sending...' : 'Send Code'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="adventure-otp"
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Code
                </label>
                <Input
                  id="adventure-otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="h-11 rounded-xl bg-muted/40 border-transparent focus:bg-background focus:border-accent/40 transition-colors"
                  required
                />
              </div>

              {error && (
                <div
                  className="flex items-start gap-2 rounded-xl bg-destructive/5 px-4 py-3 text-sm text-destructive border border-destructive/10"
                  role="alert"
                >
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-secondary hover:bg-secondary/90 font-semibold active:scale-[0.96] transition-transform"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </Button>

              <button
                type="button"
                onClick={handleBack}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Change email
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
