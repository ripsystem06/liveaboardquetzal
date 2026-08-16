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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useLanguage } from '@/contexts/language-context'
import { DocumentUploadField } from './document-upload-field'
import type {
  CrewRegistrationFormValues,
  CrewGuestData,
  GuestFormValues,
} from './schema'

interface GuestSectionProps {
  index: number
  reservationId: string
  guestId?: string
  documents?: CrewGuestData['documents']
  readOnly?: boolean
}

const CERTIFICATION_LEVELS = ['open_water', 'advanced', 'rescue', 'divemaster', 'instructor'] as const
const EQUIPMENT_SIZES = ['xs', 's', 'm', 'l', 'xl', 'xxl'] as const
const BLOOD_TYPES = [
  'a_positive',
  'a_negative',
  'b_positive',
  'b_negative',
  'ab_positive',
  'ab_negative',
  'o_positive',
  'o_negative',
] as const

function humanize(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function fieldPath<K extends keyof GuestFormValues>(index: number, field: K) {
  return `guests.${index}.${field}` as `guests.${number}.${K}`
}

export function GuestSection({ index, reservationId, guestId, documents, readOnly }: GuestSectionProps) {
  const { control } = useFormContext<CrewRegistrationFormValues>()
  const { t } = useLanguage()

  const guestTitle = t('crew.guest.title').replace('{n}', String(index + 1))

  return (
    <section className="space-y-8 rounded-2xl border border-border bg-card p-6">
      <h3 className="text-lg font-semibold text-primary">{guestTitle}</h3>

      {/* 1 — Personal */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t('crew.section.personal')}
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField name={fieldPath(index, 'fullName')} label={t('crew.field.fullName')} required />
          <TextField name={fieldPath(index, 'dateOfBirth')} label={t('crew.field.dateOfBirth')} type="date" required />
          <TextField name={fieldPath(index, 'nationality')} label={t('crew.field.nationality')} required />
          <TextField name={fieldPath(index, 'passportNumber')} label={t('crew.field.passportNumber')} required />
          <TextField name={fieldPath(index, 'contactPhone')} label={t('crew.field.contactPhone')} required />
          <TextField name={fieldPath(index, 'contactEmail')} label={t('crew.field.contactEmail')} type="email" />
        </div>
      </div>

      {/* 2 — Diving */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t('crew.section.diving')}
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField
            name={fieldPath(index, 'certificationLevel')}
            label={t('crew.field.certificationLevel')}
            options={CERTIFICATION_LEVELS}
            required
          />
          <TextField name={fieldPath(index, 'logbookDives')} label={t('crew.field.logbookDives')} type="number" />
          <TextField name={fieldPath(index, 'diveInsurancePolicyNo')} label={t('crew.field.diveInsurancePolicyNo')} required />
          <SwitchField
            name={fieldPath(index, 'isNitroxCertified')}
            label={t('crew.field.isNitroxCertified')}
          />
        </div>
      </div>

      {/* 3 — Weight & Ballast */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t('crew.section.ballast')}
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <TextField name={fieldPath(index, 'weightKg')} label={t('crew.field.weightKg')} type="number" />
          <TextField name={fieldPath(index, 'ballastKg')} label={t('crew.field.ballastKg')} type="number" />
          <TextField name={fieldPath(index, 'photoEquipment')} label={t('crew.field.photoEquipment')} />
        </div>
      </div>

      {/* 4 — Equipment Rental */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t('crew.section.rental')}
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField
            name={fieldPath(index, 'bcdSize')}
            label={t('crew.field.bcdSize')}
            options={EQUIPMENT_SIZES}
          />
          <SelectField
            name={fieldPath(index, 'wetsuitSize')}
            label={t('crew.field.wetsuitSize')}
            options={EQUIPMENT_SIZES}
          />
          <TextField name={fieldPath(index, 'finsSize')} label={t('crew.field.finsSize')} />
          <TextField name={fieldPath(index, 'maskSize')} label={t('crew.field.maskSize')} />
          <TextField name={fieldPath(index, 'bootiesSize')} label={t('crew.field.bootiesSize')} />
        </div>
      </div>

      {/* 5 — Medical & Dietary */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t('crew.section.medical')}
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextareaField name={fieldPath(index, 'medicalLimitations')} label={t('crew.field.medicalLimitations')} />
          <TextareaField name={fieldPath(index, 'allergies')} label={t('crew.field.allergies')} />
          <SelectField
            name={fieldPath(index, 'bloodType')}
            label={t('crew.field.bloodType')}
            options={BLOOD_TYPES}
          />
          <TextareaField name={fieldPath(index, 'dietaryRestrictions')} label={t('crew.field.dietaryRestrictions')} />
        </div>
      </div>

      {/* 7 — Emergency Contacts & Documents */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t('crew.section.emergency')}
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <TextField name={fieldPath(index, 'ec1Name')} label={t('crew.field.ec1Name')} required />
          <TextField name={fieldPath(index, 'ec1Relation')} label={t('crew.field.ec1Relation')} required />
          <TextField name={fieldPath(index, 'ec1Phone')} label={t('crew.field.ec1Phone')} required />
          <TextField name={fieldPath(index, 'ec2Name')} label={t('crew.field.ec2Name')} required />
          <TextField name={fieldPath(index, 'ec2Relation')} label={t('crew.field.ec2Relation')} required />
          <TextField name={fieldPath(index, 'ec2Phone')} label={t('crew.field.ec2Phone')} required />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DocumentUploadField reservationId={reservationId} guestId={guestId} kind="passport_ine" documents={documents} readOnly={readOnly} />
          <DocumentUploadField reservationId={reservationId} guestId={guestId} kind="dive_cert" documents={documents} readOnly={readOnly} />
          <DocumentUploadField reservationId={reservationId} guestId={guestId} kind="dive_insurance" documents={documents} readOnly={readOnly} />
          <DocumentUploadField reservationId={reservationId} guestId={guestId} kind="nitrox_cert" documents={documents} readOnly={readOnly} />
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Local field primitives (scoped to this form)
// ---------------------------------------------------------------------------

interface TextFieldProps<TName extends FieldPath<CrewRegistrationFormValues>> {
  name: TName
  label: string
  required?: boolean
  type?: string
}

function TextField<TName extends FieldPath<CrewRegistrationFormValues>>({
  name,
  label,
  required,
  type,
}: TextFieldProps<TName>) {
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

function TextareaField<TName extends FieldPath<CrewRegistrationFormValues>>({
  name,
  label,
}: {
  name: TName
  label: string
}) {
  const { control } = useFormContext<CrewRegistrationFormValues>()
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea {...field} value={field.value as string} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

interface SelectFieldProps<TName extends FieldPath<CrewRegistrationFormValues>> {
  name: TName
  label: string
  options: readonly string[]
  required?: boolean
}

function SelectField<TName extends FieldPath<CrewRegistrationFormValues>>({
  name,
  label,
  options,
  required,
}: SelectFieldProps<TName>) {
  const { control } = useFormContext<CrewRegistrationFormValues>()
  const { t } = useLanguage()
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
          <Select onValueChange={field.onChange} value={(field.value as string | undefined) || ''}>
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('crew.select.placeholder')} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {humanize(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function SwitchField<TName extends FieldPath<CrewRegistrationFormValues>>({
  name,
  label,
}: {
  name: TName
  label: string
}) {
  const { control } = useFormContext<CrewRegistrationFormValues>()
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
          <FormLabel className="font-normal">{label}</FormLabel>
          <FormControl>
            <Switch checked={field.value as boolean} onCheckedChange={field.onChange} />
          </FormControl>
        </FormItem>
      )}
    />
  )
}
