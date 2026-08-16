'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/language-context'
import { GuestSection } from './guest-section'
import { FlightsSection } from './flights-section'
import {
  buildDefaultValues,
  crewRegistrationFormSchema,
  toServerPayload,
  type CrewRegistrationData,
  type CrewRegistrationFormValues,
  type CrewGuestData,
} from './schema'

interface CrewRegistrationFormProps {
  reservationId: string
  guestCount: number
  registration?: CrewRegistrationData | null
}

export function CrewRegistrationForm({
  reservationId,
  guestCount,
  registration = null,
}: CrewRegistrationFormProps) {
  const { t } = useLanguage()
  const readOnly = registration?.status === 'approved'

  const form = useForm<CrewRegistrationFormValues>({
    resolver: zodResolver(crewRegistrationFormSchema),
    defaultValues: buildDefaultValues(guestCount, registration),
  })

  const { fields } = useFieldArray({ control: form.control, name: 'guests' })

  const [guestIds, setGuestIds] = useState<(string | undefined)[]>(() =>
    Array.from({ length: guestCount }, (_, i) => registration?.guests?.find((g) => g.guestIndex === i)?.id)
  )
  const [currentStatus, setCurrentStatus] = useState(registration?.status ?? 'draft')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const documentsByGuest: (CrewGuestData['documents'] | undefined)[] = Array.from(
    { length: guestCount },
    (_, i) => registration?.guests?.find((g) => g.guestIndex === i)?.documents
  )

  const submitForm = async (values: CrewRegistrationFormValues, submit: boolean) => {
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      const response = await fetch(`/api/crew-registration/${reservationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toServerPayload(values, submit)),
      })
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string }
        setError(body.error ?? t('crew.form.error'))
        return
      }
      const data = (await response.json()) as {
        status?: string
        guests?: { id: string }[]
      }
      if (data.guests) {
        setGuestIds(data.guests.map((g) => g.id))
      }
      if (data.status) {
        setCurrentStatus(data.status as CrewRegistrationData['status'])
      }
      setSaved(true)
    } catch {
      setError(t('crew.form.error'))
    } finally {
      setSaving(false)
    }
  }

  const saveDraft = form.handleSubmit((values) => submitForm(values, false))
  const submitForReview = form.handleSubmit((values) => submitForm(values, true))

  return (
    <div className="space-y-6">
      {readOnly && (
        <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          {t('crew.form.readOnly')}
        </div>
      )}

      {currentStatus === 'rejected' && registration?.rejectReason && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {t('crew.form.rejected').replace('{reason}', registration.rejectReason)}
        </div>
      )}

      {currentStatus === 'submitted' && !readOnly && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {t('crew.form.submitted')}
        </div>
      )}

      {saved && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {t('crew.form.saved')}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={(event) => event.preventDefault()} className="space-y-6">
          <fieldset disabled={readOnly} className="space-y-6">
            {fields.map((field, index) => (
              <GuestSection
                key={field.id}
                index={index}
                reservationId={reservationId}
                guestId={guestIds[index]}
                documents={documentsByGuest[index]}
                readOnly={readOnly}
              />
            ))}
            <FlightsSection />
          </fieldset>

          {!readOnly && (
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => void saveDraft()}
                disabled={saving}
              >
                {t('crew.form.saveDraft')}
              </Button>
              <Button
                type="button"
                onClick={() => void submitForReview()}
                disabled={saving}
              >
                {saving ? t('crew.form.saving') : t('crew.form.submit')}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  )
}
