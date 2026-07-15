'use client'

import { LegalPage } from '@/components/legal-page'
import { cancellationContent } from '@/lib/legal/cancellation'

export function CancellationContent() {
  return <LegalPage data={cancellationContent} />
}
