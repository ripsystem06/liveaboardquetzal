'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useLanguage } from '@/contexts/language-context'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { ReservationDetailModal } from '@/components/admin/reservation-detail-modal'
import { cn } from '@/lib/utils'
import { Loader2, Eye, CheckCircle, XCircle, PauseCircle, RefreshCw, ChevronRight, Users, DollarSign } from 'lucide-react'

interface Reservation {
  id: string
  userId: string
  cruiseId: string
  cruiseName: string
  departureDate: string
  route: string
  tier: string
  tierPrice: number
  guestCount: number
  freeSpaces: number
  paidSpaces: number
  totalAmount: number
  paymentMethod: string
  status: string
  notes: string | null
  createdAt: string
}

type StatusFilter = 'all' | 'pending_approval' | 'confirmed' | 'cancelled'

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function parseDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-')
  return { day: parseInt(day, 10), monthIndex: parseInt(month, 10) - 1, year, dayStr: day }
}

const STATUS_STYLE: Record<string, { bg: string; text: string; border: string; label: string }> = {
  pending_approval: { bg: 'bg-yellow-500/10', text: 'text-yellow-600', border: 'border-yellow-500/30', label: 'pending' },
  confirmed: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/30', label: 'confirmed' },
  cancelled: { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border', label: 'cancelled' },
}

function getRouteImage(route: string): string {
  const lower = route.toLowerCase()
  if (lower.includes('socorro') || lower.includes('revillagigedo')) return '/images/panoramicas/Isla Socorro.webp'
  if (lower.includes('cortez') || lower.includes('cortés')) return '/images/panoramicas/burritos galapagos 1.webp'
  if (lower.includes('magdalena') || lower.includes('magbay')) return '/images/panoramicas/loreto-magdalena-bay.webp'
  return '/images/panoramicas/Isla Socorro.webp'
}

export function AdminReservations() {
  const { t, language } = useLanguage()
  const months = language === 'es' ? MONTHS_ES : MONTHS_EN
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [cruiseFilter, setCruiseFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('')
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchReservations = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (cruiseFilter !== 'all') params.set('cruiseId', cruiseFilter)
    if (dateFilter) params.set('date', dateFilter)

    try {
      const res = await fetch(`/api/admin/reservations?${params.toString()}`, { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to load reservations')
      const data = await res.json()
      setReservations(data.reservations || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, cruiseFilter, dateFilter])

  useEffect(() => {
    fetchReservations()
  }, [fetchReservations])

  const handleAction = async (id: string, newStatus: string) => {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Action failed')
      }
      await fetchReservations()
      if (selectedReservation?.id === id) {
        setSelectedReservation(null)
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setActionLoading(null)
    }
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-lg font-semibold">{t('admin.reservations.title')}</h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Select value={statusFilter} onValueChange={(v: StatusFilter) => setStatusFilter(v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t('admin.reservations.filterStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin.common.all')}</SelectItem>
              <SelectItem value="pending_approval">{t('reservation.status.pending')}</SelectItem>
              <SelectItem value="confirmed">{t('reservation.status.confirmed')}</SelectItem>
              <SelectItem value="cancelled">{t('reservation.status.cancelled')}</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-36"
          />

          <Button variant="outline" size="sm" onClick={fetchReservations}>
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
      ) : reservations.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {t('admin.reservations.empty')}
        </div>
      ) : (
        <div className="space-y-3">
          {reservations.map((res) => {
            const { day, monthIndex, year, dayStr } = parseDate(res.departureDate)
            const monthName = months[monthIndex]
            const statusStyle = STATUS_STYLE[res.status] || STATUS_STYLE.pending_approval
            const statusLabel = t(`reservation.status.${STATUS_STYLE[res.status]?.label || 'pending'}`) || res.status

            return (
              <div
                key={res.id}
                className={cn(
                  'group w-full rounded-2xl bg-card px-6 py-5 transition-all duration-300',
                  'shadow-[0_4px_16px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.06)]',
                  'hover:shadow-[0_8px_24px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.08)] hover:-translate-y-0.5',
                )}
              >
                {/* Month / Year Header */}
                <div className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  {monthName} {year}
                </div>

                <div className="flex gap-5">
                  {/* Destination thumbnail */}
                  <div className="hidden sm:block relative w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                    <Image
                      src={getRouteImage(res.route)}
                      alt={res.route}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  </div>

                <div className="flex-1 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  {/* Left: Date + Cruise Info */}
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    {/* Big Departure Date */}
                    <div className="flex flex-col items-start">
                      <div className="flex items-start gap-1.5">
                        <span className="text-5xl font-bold leading-none text-primary tabular-nums">
                          {dayStr}
                        </span>
                        <div className="mt-1.5 flex flex-col leading-none">
                          <span className="text-sm font-bold uppercase text-primary">{monthName}</span>
                          <span className="text-xs text-muted-foreground">{year}</span>
                        </div>
                      </div>
                    </div>

                    {/* Cruise Name + Details */}
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-xl font-serif font-bold text-primary sm:text-2xl text-balance">
                        {res.cruiseName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="font-mono text-[10px] uppercase tracking-wide bg-muted/50 px-2 py-0.5 rounded-full">
                          #{res.id.slice(-8)}
                        </span>
                        <span className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border',
                          statusStyle.bg, statusStyle.text, statusStyle.border
                        )}>
                          {statusLabel}
                        </span>
                        <span className="capitalize">{res.tier}</span>
                      </div>

                      <button
                        onClick={() => setSelectedReservation(res)}
                        className="mt-0.5 flex w-fit items-center gap-1 text-sm font-semibold text-accent transition hover:text-accent/80"
                      >
                        {t('admin.common.view')} {t('admin.reservationDetail.title')}
                        <ChevronRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                      </button>
                    </div>
                  </div>

                  {/* Right: Stats + Actions */}
                  <div className="flex flex-col items-end gap-3">
                    {/* Quick stats */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Users size={14} />
                        <span className="font-semibold text-foreground">{res.guestCount}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <DollarSign size={14} />
                        <span className="font-semibold text-foreground">{formatPrice(res.totalAmount)}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedReservation(res)}
                        className="rounded-full"
                      >
                        <Eye className="size-3.5 mr-1" />
                        {t('admin.common.view')}
                      </Button>
                      {res.status === 'pending_approval' && (
                        <Button
                          size="sm"
                          onClick={() => handleAction(res.id, 'confirmed')}
                          disabled={actionLoading === res.id}
                          className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          {actionLoading === res.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <CheckCircle className="size-3.5 mr-1" />
                          )}
                          {t('admin.reservations.approve')}
                        </Button>
                      )}
                      {res.status !== 'cancelled' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(res.id, 'cancelled')}
                          disabled={actionLoading === res.id}
                          className="rounded-full text-destructive border-destructive/30 hover:bg-destructive/10"
                        >
                          <XCircle className="size-3.5 mr-1" />
                          {t('admin.reservations.cancel')}
                        </Button>
                      )}
                      {res.status === 'confirmed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(res.id, 'pending_approval')}
                          disabled={actionLoading === res.id}
                          className="rounded-full"
                        >
                          <PauseCircle className="size-3.5 mr-1" />
                          {t('admin.reservations.suspend')}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selectedReservation && (
        <ReservationDetailModal
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
          onRefresh={fetchReservations}
        />
      )}
    </div>
  )
}
