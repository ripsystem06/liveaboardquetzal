'use client'

import { LegalPage } from '@/components/legal-page'
import { privacyContent } from '@/lib/legal/privacy'

export function PrivacyContent() {
  return <LegalPage data={privacyContent} />
}
