import { ForbiddenError } from '@/lib/auth'
import type { CrewRegistrationStatus, CrewDocumentKind } from '@/lib/validations'

/**
 * Documents that MUST exist for every guest before the registration can be
 * submitted. Nitrox certification is required conditionally (see below).
 */
const MANDATORY_DOCUMENT_KINDS: readonly CrewDocumentKind[] = [
  'passport_ine',
  'dive_cert',
  'dive_insurance',
]

export interface GuestDocumentRequirement {
  id: string
  isNitroxCertified: boolean
}

export interface GuestDocument {
  guestId: string
  kind: CrewDocumentKind
}

export interface MissingDocument {
  guestId: string
  kind: CrewDocumentKind
}

/**
 * Lifecycle: draft → submitted → (approved | rejected).
 *
 * - submit=true → submitted (a rejected registration resubmitting also lands here).
 * - submit=false + draft → draft
 * - submit=false + submitted → submitted
 * - submit=false + rejected → submitted (editing a rejected form reopens review)
 * - approved is terminal for the customer (enforced separately by `assertEditable`).
 */
export function computeTargetStatus(
  current: CrewRegistrationStatus,
  submit: boolean
): CrewRegistrationStatus {
  if (current === 'approved') return 'approved'
  if (submit) return 'submitted'
  if (current === 'rejected') return 'submitted'
  return current
}

/**
 * Returns the list of required document kinds missing per guest.
 * An empty result means every guest satisfies the mandatory document set:
 * passport/INE, dive cert, dive insurance — plus nitrox cert when the guest
 * declared nitrox certification.
 */
export function enforceDocRequirements(
  guests: GuestDocumentRequirement[],
  documents: GuestDocument[]
): MissingDocument[] {
  const missing: MissingDocument[] = []
  for (const guest of guests) {
    const present = new Set<CrewDocumentKind>()
    for (const doc of documents) {
      if (doc.guestId === guest.id) present.add(doc.kind)
    }
    for (const kind of MANDATORY_DOCUMENT_KINDS) {
      if (!present.has(kind)) missing.push({ guestId: guest.id, kind })
    }
    if (guest.isNitroxCertified && !present.has('nitrox_cert')) {
      missing.push({ guestId: guest.id, kind: 'nitrox_cert' })
    }
  }
  return missing
}

/**
 * Throws a ForbiddenError (HTTP 403) once a registration is `approved`.
 * Editable while `draft`, `submitted`, or `rejected`.
 */
export function assertEditable(status: CrewRegistrationStatus): void {
  if (status === 'approved') {
    throw new ForbiddenError('Registration is approved and cannot be edited')
  }
}
