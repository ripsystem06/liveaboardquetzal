'use client'

import { LegalPage } from '@/components/legal-page'
import { termsContent } from '@/lib/legal/terms'

export function TermsContent() {
  return <LegalPage data={termsContent} />
}
