'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AdventurePage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (res.ok) {
        const data = await res.json()
        sessionStorage.setItem('quetzal_user', JSON.stringify(data.user))
        router.push('/admin')
      } else {
        const data = await res.json()
        setError(data.error || 'Invalid credentials')
      }
    } catch {
      setError('Invalid credentials')
    } finally {
      setLoading(false)
    }
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

          <form onSubmit={handleSubmit} className="space-y-5">
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

            <div className="space-y-2">
              <label
                htmlFor="adventure-password"
                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Password
              </label>
              <Input
                id="adventure-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="h-11 rounded-xl bg-muted/40 border-transparent focus:bg-background focus:border-accent/40 transition-colors"
                required
              />
            </div>

            {error && (
              <div
                className="flex items-start gap-2 rounded-xl bg-destructive/5 px-4 py-3 text-sm text-destructive border border-destructive/10"
                role="alert"
              >
                <svg
                  className="mt-0.5 size-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-secondary hover:bg-secondary/90 font-semibold active:scale-[0.96] transition-transform"
            >
              {loading ? 'Entering...' : 'Enter'}
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}
