'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/contexts/language-context'
import { Table, TableHead, TableRow, TableCell, TableHeader, TableBody } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ReservationDetailModal } from '@/components/admin/reservation-detail-modal'
import { Loader2, Eye, CheckCircle, XCircle, PauseCircle, RefreshCw } from 'lucide-react'

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

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending_approval: 'outline',
  confirmed: 'default',
  cancelled: 'secondary',
}

export function AdminReservations() {
  const { t } = useLanguage()
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

  const getStatusBadge = (status: string) => {
    const variant = STATUS_VARIANT[status] || 'outline'
    const label = t(`reservation.status.${status}`) || status
    return <Badge variant={variant}>{label}</Badge>
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
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.reservations.id')}</TableHead>
                <TableHead>{t('admin.reservations.cruise')}</TableHead>
                <TableHead>{t('admin.reservations.date')}</TableHead>
                <TableHead>{t('admin.reservations.tier')}</TableHead>
                <TableHead className="text-right">{t('admin.reservations.guests')}</TableHead>
                <TableHead className="text-right">{t('admin.reservations.total')}</TableHead>
                <TableHead>{t('admin.reservations.status')}</TableHead>
                <TableHead>{t('admin.common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((res) => (
                <TableRow key={res.id}>
                  <TableCell className="font-mono text-xs">{res.id.slice(-8)}</TableCell>
                  <TableCell className="font-medium">{res.cruiseName}</TableCell>
                  <TableCell>{res.departureDate}</TableCell>
                  <TableCell className="capitalize">{res.tier}</TableCell>
                  <TableCell className="text-right">{res.guestCount}</TableCell>
                  <TableCell className="text-right font-semibold">${res.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(res.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setSelectedReservation(res)}
                        title={t('admin.common.view')}
                      >
                        <Eye className="size-4" />
                      </Button>
                      {res.status === 'pending_approval' && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleAction(res.id, 'confirmed')}
                          disabled={actionLoading === res.id}
                          title={t('admin.reservations.approve')}
                        >
                          {actionLoading === res.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <CheckCircle className="size-4 text-green-600" />
                          )}
                        </Button>
                      )}
                      {res.status !== 'cancelled' && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleAction(res.id, 'cancelled')}
                          disabled={actionLoading === res.id}
                          title={t('admin.reservations.cancel')}
                        >
                          <XCircle className="size-4 text-destructive" />
                        </Button>
                      )}
                      {res.status === 'confirmed' && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleAction(res.id, 'pending_approval')}
                          disabled={actionLoading === res.id}
                          title={t('admin.reservations.suspend')}
                        >
                          <PauseCircle className="size-4 text-yellow-600" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
