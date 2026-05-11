import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad | Quetzal Liveaboard',
  description: 'Privacy policy for Quetzal Liveaboard.',
}

import { PrivacyContent } from './privacy-content'

export default function PrivacidadPage() {
  return <PrivacyContent />
}
