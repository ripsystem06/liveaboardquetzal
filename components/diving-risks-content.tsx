'use client'

import { LegalPage } from '@/components/legal-page'
import { divingRisksContent } from '@/lib/legal/diving-risks'

export function DivingRisksContent() {
  return <LegalPage data={divingRisksContent} />
}
