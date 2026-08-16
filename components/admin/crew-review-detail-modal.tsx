'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/contexts/language-context'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-react'

interface GuestDocument {
  id: string
  kind: string
  storagePath: string
  mimeType: string
  signedUrl: string | null
}

interface CrewGuest {
  id: string
  guestIndex: number
  fullName: string
  dateOfBirth: string
  nationality: string
  passportNumber: string
  contactPhone: string
  contactEmail: string | null
  certificationLevel: string
  logbookDives: number | null
  diveInsurancePolicyNo: string
  isNitroxCertified: boolean
  weightKg: number | null
  ballastKg: number | null
  photoEquipment: string | null
  bcdSize: string | null
  wetsuitSize: string | null
  finsSize: string | null
  maskSize: string | null
  bootiesSize: string | null
  medicalLimitations: string | null
  allergies: string | null
  bloodType: string | null
  dietaryRestrictions: string | null
  ec1Name: string
  ec1Relation: string
  ec1Phone: string
  ec2Name: string
  ec2Relation: string
  ec2Phone: string
  documents: GuestDocument[]
}

interface CrewRegistrationDetail {
  id: string
  reservationId: string
  status: string
  rejectReason: string | null
  submittedAt: string | null
  arrivalFlight: string
  arrivalDate: string
  arrivalTime: string
  departureFlight: string
  departureDate: string
  departureTime: string
  hotelName: string
  hotelAddress: string
  reservation: { id: string; cruiseName: string; departureDate: string; route: string; guestCount: number }
  guests: CrewGuest[]
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  submitted: 'outline',
  approved: 'default',
  rejected: 'destructive',
  draft: 'secondary',
}

interface Props {
  registrationId: string
  onClose: () => void
  onRefresh: () => void
}

function display(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-sm">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium break-words">{value}</p>
    </div>
  )
}

export function CrewReviewDetailModal({ registrationId, onClose, onRefresh }: Props) {
  const { t } = useLanguage()
  const [registration, setRegistration] = useState<CrewRegistrationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [actionLoading, setActionLoading] = useState<'approve' | 'reject' | null>(null)

  const fetchDetail = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/crew-registration/${registrationId}`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to load registration detail')
      const data = await res.json()
      setRegistration(data.registration)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [registrationId])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  const handleAction = async (action: 'approve' | 'reject') => {
    setActionLoading(action)
    try {
      const res = await fetch(`/api/admin/crew-registration/${registrationId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(action === 'reject' ? { reason } : {}),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Action failed')
      }
      onRefresh()
      onClose()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setActionLoading(null)
    }
  }

  const statusLabel = (status: string) => t(`admin.crewReview.status.${status}`) || status
  const isSubmitted = registration?.status === 'submitted'

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('admin.crewReview.detail.title')}</DialogTitle>
          <DialogDescription>{t('admin.crewReview.detail.subtitle')}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-destructive">{error}</div>
        ) : registration ? (
          <div className="space-y-6 pt-4">
            {/* Status banner */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{registration.reservation.cruiseName}</span>
                <span className="text-xs text-muted-foreground">{registration.reservation.departureDate}</span>
              </div>
              <Badge variant={STATUS_VARIANT[registration.status] || 'outline'}>
                {statusLabel(registration.status)}
              </Badge>
            </div>

            {registration.rejectReason && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
                {t('admin.crewReview.rejectReason')}: {registration.rejectReason}
              </div>
            )}

            {/* Section 6 — reservation travel data */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3">
                {t('crew.section.flights')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Field label={t('crew.field.arrivalFlight')} value={display(registration.arrivalFlight)} />
                <Field label={t('crew.field.arrivalDate')} value={display(registration.arrivalDate)} />
                <Field label={t('crew.field.arrivalTime')} value={display(registration.arrivalTime)} />
                <Field label={t('crew.field.departureFlight')} value={display(registration.departureFlight)} />
                <Field label={t('crew.field.departureDate')} value={display(registration.departureDate)} />
                <Field label={t('crew.field.departureTime')} value={display(registration.departureTime)} />
                <Field label={t('crew.field.hotelName')} value={display(registration.hotelName)} />
                <Field label={t('crew.field.hotelAddress')} value={display(registration.hotelAddress)} />
              </div>
            </div>

            {/* Per-guest tabs */}
            <Tabs defaultValue={`guest-${registration.guests[0]?.guestIndex ?? 0}`}>
              <TabsList className="flex-wrap h-auto">
                {registration.guests.map((guest) => (
                  <TabsTrigger key={guest.id} value={`guest-${guest.guestIndex}`}>
                    {t('admin.crewReview.guest')} {guest.guestIndex + 1}
                  </TabsTrigger>
                ))}
              </TabsList>

              {registration.guests.map((guest) => (
                <TabsContent key={guest.id} value={`guest-${guest.guestIndex}`} className="space-y-6">
                  {/* Personal */}
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3">
                      {t('crew.section.personal')}
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label={t('crew.field.fullName')} value={display(guest.fullName)} />
                      <Field label={t('crew.field.dateOfBirth')} value={display(guest.dateOfBirth)} />
                      <Field label={t('crew.field.nationality')} value={display(guest.nationality)} />
                      <Field label={t('crew.field.passportNumber')} value={display(guest.passportNumber)} />
                      <Field label={t('crew.field.contactPhone')} value={display(guest.contactPhone)} />
                      <Field label={t('crew.field.contactEmail')} value={display(guest.contactEmail)} />
                    </div>
                  </div>

                  {/* Diving */}
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3">
                      {t('crew.section.diving')}
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label={t('crew.field.certificationLevel')} value={display(guest.certificationLevel)} />
                      <Field label={t('crew.field.logbookDives')} value={display(guest.logbookDives)} />
                      <Field label={t('crew.field.diveInsurancePolicyNo')} value={display(guest.diveInsurancePolicyNo)} />
                      <Field
                        label={t('crew.field.isNitroxCertified')}
                        value={guest.isNitroxCertified ? 'Yes' : 'No'}
                      />
                    </div>
                  </div>

                  {/* Ballast / Rental */}
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3">
                      {t('crew.section.ballast')} · {t('crew.section.rental')}
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label={t('crew.field.weightKg')} value={display(guest.weightKg)} />
                      <Field label={t('crew.field.ballastKg')} value={display(guest.ballastKg)} />
                      <Field label={t('crew.field.photoEquipment')} value={display(guest.photoEquipment)} />
                      <Field label={t('crew.field.bcdSize')} value={display(guest.bcdSize)} />
                      <Field label={t('crew.field.wetsuitSize')} value={display(guest.wetsuitSize)} />
                      <Field label={t('crew.field.finsSize')} value={display(guest.finsSize)} />
                      <Field label={t('crew.field.maskSize')} value={display(guest.maskSize)} />
                      <Field label={t('crew.field.bootiesSize')} value={display(guest.bootiesSize)} />
                    </div>
                  </div>

                  {/* Medical */}
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3">
                      {t('crew.section.medical')}
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label={t('crew.field.medicalLimitations')} value={display(guest.medicalLimitations)} />
                      <Field label={t('crew.field.allergies')} value={display(guest.allergies)} />
                      <Field label={t('crew.field.bloodType')} value={display(guest.bloodType)} />
                      <Field label={t('crew.field.dietaryRestrictions')} value={display(guest.dietaryRestrictions)} />
                    </div>
                  </div>

                  {/* Emergency contacts */}
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3">
                      {t('crew.section.emergency')}
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label={t('crew.field.ec1Name')} value={display(guest.ec1Name)} />
                      <Field label={t('crew.field.ec1Relation')} value={display(guest.ec1Relation)} />
                      <Field label={t('crew.field.ec1Phone')} value={display(guest.ec1Phone)} />
                      <Field label={t('crew.field.ec2Name')} value={display(guest.ec2Name)} />
                      <Field label={t('crew.field.ec2Relation')} value={display(guest.ec2Relation)} />
                      <Field label={t('crew.field.ec2Phone')} value={display(guest.ec2Phone)} />
                    </div>
                  </div>

                  {/* Documents */}
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3">
                      {t('crew.docs.title')}
                    </h4>
                    {guest.documents.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{t('admin.crewReview.noDocuments')}</p>
                    ) : (
                      <ul className="space-y-2">
                        {guest.documents.map((doc) => (
                          <li key={doc.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
                            <span>{t(`crew.docs.${doc.kind}`) || doc.kind}</span>
                            {doc.signedUrl ? (
                              <a
                                href={doc.signedUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-accent hover:text-accent/80 font-medium"
                              >
                                {t('admin.crewReview.viewDoc')}
                                <ExternalLink size={14} />
                              </a>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {/* Actions */}
            {isSubmitted && (
              <div className="space-y-4 pt-2 border-t">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('admin.crewReview.rejectReason')}</label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={t('admin.crewReview.rejectReasonPlaceholder')}
                    rows={2}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => handleAction('reject')}
                    disabled={actionLoading !== null || !reason.trim()}
                  >
                    {actionLoading === 'reject' ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <XCircle className="size-4 mr-1" />
                    )}
                    {t('admin.crewReview.reject')}
                  </Button>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleAction('approve')}
                    disabled={actionLoading !== null}
                  >
                    {actionLoading === 'approve' ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle className="size-4 mr-1" />
                    )}
                    {t('admin.crewReview.approve')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
