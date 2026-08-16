'use client'

import { useFormContext, type FieldPath } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useLanguage } from '@/contexts/language-context'
import type { CrewRegistrationFormValues, FlightsFormValues } from './schema'

function flightsPath<K extends keyof FlightsFormValues>(field: K) {
  return `flights.${field}` as `flights.${K}`
}

export function FlightsSection() {
  const { control } = useFormContext<CrewRegistrationFormValues>()
  const { t } = useLanguage()

  return (
    <section className="space-y-6 rounded-2xl border border-border bg-card p-6">
      <h3 className="text-lg font-semibold text-primary">
        {t('crew.section.flights')}
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TextField name={flightsPath('arrivalFlight')} label={t('crew.field.arrivalFlight')} required />
        <TextField name={flightsPath('arrivalDate')} label={t('crew.field.arrivalDate')} type="date" required />
        <TextField name={flightsPath('arrivalTime')} label={t('crew.field.arrivalTime')} type="time" required />
        <TextField name={flightsPath('departureFlight')} label={t('crew.field.departureFlight')} required />
        <TextField name={flightsPath('departureDate')} label={t('crew.field.departureDate')} type="date" required />
        <TextField name={flightsPath('departureTime')} label={t('crew.field.departureTime')} type="time" required />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField name={flightsPath('hotelName')} label={t('crew.field.hotelName')} required />
        <TextField name={flightsPath('hotelAddress')} label={t('crew.field.hotelAddress')} required />
      </div>
    </section>
  )
}

function TextField<TName extends FieldPath<CrewRegistrationFormValues>>({
  name,
  label,
  required,
  type,
}: {
  name: TName
  label: string
  required?: boolean
  type?: string
}) {
  const { control } = useFormContext<CrewRegistrationFormValues>()
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-destructive"> *</span>}
          </FormLabel>
          <FormControl>
            <Input {...field} value={field.value as string} type={type ?? 'text'} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
