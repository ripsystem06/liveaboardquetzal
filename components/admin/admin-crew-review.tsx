'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/contexts/language-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CrewReviewDetailModal } from '@/components/admin/crew-review-detail-modal'
import { cn } from '@/lib/utils'
import { Loader2, Eye, RefreshCw, Users } from 'lucide-react'

interface CrewRegistrationListItem {
  id: string
  reservationId: string
  status: string
  submittedAt: string | null
  reservation: {
    id: string
    cruiseName: string
    departureDate: string
    route: string
    guestCount: number
    user: { name: string | null; email: string | null }
  }
  guests: { guestIndex: number; fullName: string }[]
}

type StatusFilter = 'all' | 'submitted' | 'approved' | 'rejected'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  submitted: 'outline',
  approved: 'default',
  rejected: 'destructive',
  draft: 'secondary',
}

export function AdminCrewReview() {
  const { t } = useLanguage()
  const [registrations, setRegistrations] = useState<CrewRegistrationListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const fetchRegistrations = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('status', statusFilter)

    try {
      const res = await fetch(`/api/admin/crew-registration?${params.toString()}`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to load crew registrations')
      const data = await res.json()
      setRegistrations(data.registrations || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchRegistrations()
  }, [fetchRegistrations])

  const statusLabel = (status: string) => t(`admin.crewReview.status.${status}`) || status

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-lg font-semibold">{t('admin.crewReview.title')}</h2>

        <div className="flex flex-wrap gap-3">
          <Select value={statusFilter} onValueChange={(v: StatusFilter) => setStatusFilter(v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t('admin.crewReview.filterStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin.common.all')}</SelectItem>
              <SelectItem value="submitted">{t('admin.crewReview.status.submitted')}</SelectItem>
              <SelectItem value="approved">{t('admin.crewReview.status.approved')}</SelectItem>
              <SelectItem value="rejected">{t('admin.crewReview.status.rejected')}</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={fetchRegistrations}>
            <RefreshCw className="size-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-destructive">{error}</div>
      ) : registrations.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {t('admin.crewReview.empty')}
        </div>
      ) : (
        <div className="space-y-3">
          {registrations.map((reg) => (
            <div
              key={reg.id}
              className={cn(
                'group w-full rounded-2xl bg-card px-6 py-5 transition-all duration-300',
                'shadow-[0_4px_16px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.06)]',
                'hover:shadow-[0_8px_24px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.08)] hover:-translate-y-0.5',
              )}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-serif font-bold text-primary sm:text-2xl">
                      {reg.reservation.cruiseName}
                    </h3>
                    <Badge variant={STATUS_VARIANT[reg.status] || 'outline'}>
                      {statusLabel(reg.status)}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-mono text-[10px] uppercase tracking-wide bg-muted/50 px-2 py-0.5 rounded-full">
                      #{reg.id.slice(-8)}
                    </span>
                    <span>{reg.reservation.departureDate}</span>
                    <span className="capitalize">{reg.reservation.route}</span>
                    {reg.submittedAt && (
                      <span>
                        {t('admin.crewReview.submittedAt')}: {new Date(reg.submittedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Users size={13} />
                      {reg.reservation.guestCount} {t('admin.crewReview.guests')}
                    </span>
                    <span>
                      {t('admin.crewReview.lead')}:{' '}
                      <span className="text-foreground font-medium">
                        {reg.reservation.user.name || reg.reservation.user.email || '—'}
                      </span>
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedId(reg.id)}
                  className="rounded-full self-start lg:self-center"
                >
                  <Eye className="size-3.5 mr-1" />
                  {t('admin.crewReview.viewDetail')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedId && (
        <CrewReviewDetailModal
          registrationId={selectedId}
          onClose={() => setSelectedId(null)}
          onRefresh={fetchRegistrations}
        />
      )}
    </div>
  )
}
