import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad — Quetzal Liveaboard',
  description: 'How Quetzal Liveaboard collects, uses, and protects your personal data. GDPR-compliant privacy practices for our diving community in Baja California.',
}

import { PrivacyContent } from './privacy-content'

export default function PrivacidadPage() {
  return <PrivacyContent />
}
