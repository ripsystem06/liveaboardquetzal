'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/language-context'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2, Save } from 'lucide-react'

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

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending_approval: 'outline',
  confirmed: 'default',
  cancelled: 'secondary',
}

interface Props {
  reservation: Reservation
  onClose: () => void
  onRefresh: () => void
}

export function ReservationDetailModal({ reservation, onClose, onRefresh }: Props) {
  const { t } = useLanguage()
  const [notes, setNotes] = useState(reservation.notes || '')
  const [saving, setSaving] = useState(false)

  const handleSaveNotes = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/reservations/${reservation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notes }),
      })
      if (!res.ok) throw new Error('Failed to save notes')
      onRefresh()
      onClose()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const statusVariant = STATUS_VARIANT[reservation.status] || 'outline'

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('admin.reservationDetail.title')}</DialogTitle>
          <DialogDescription>{t('admin.reservationDetail.subtitle')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Status Banner */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t('admin.reservations.status')}:</span>
            <Badge variant={statusVariant}>{t(`reservation.status.${reservation.status}`) || reservation.status}</Badge>
          </div>

          {/* Reservation Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">{t('admin.reservationDetail.id')}</p>
              <p className="font-mono text-xs break-all">{reservation.id}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t('admin.reservationDetail.userId')}</p>
              <p className="font-mono text-xs">{reservation.userId}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t('admin.reservationDetail.cruise')}</p>
              <p className="font-medium">{reservation.cruiseName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t('admin.reservationDetail.departureDate')}</p>
              <p>{reservation.departureDate}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t('admin.reservationDetail.route')}</p>
              <p>{reservation.route}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t('admin.reservationDetail.tier')}</p>
              <p className="capitalize">{reservation.tier}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t('admin.reservationDetail.tierPrice')}</p>
              <p>${reservation.tierPrice.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t('admin.reservationDetail.guestCount')}</p>
              <p>{reservation.guestCount}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t('admin.reservationDetail.totalAmount')}</p>
              <p className="font-semibold">${reservation.totalAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t('admin.reservationDetail.paymentMethod')}</p>
              <p className="capitalize">{reservation.paymentMethod.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t('admin.reservationDetail.createdAt')}</p>
              <p>{new Date(reservation.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t('admin.reservationDetail.cruiseId')}</p>
              <p className="font-mono text-xs">{reservation.cruiseId}</p>
            </div>
          </div>

          {/* Notes Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('admin.reservationDetail.notes')}</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('admin.reservationDetail.notesPlaceholder')}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">{t('admin.reservationDetail.notesHelp')}</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>
              {t('admin.common.cancel')}
            </Button>
            <Button onClick={handleSaveNotes} disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {t('admin.common.save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
