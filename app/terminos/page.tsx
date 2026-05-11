import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos de Servicio | Quetzal Liveaboard',
  description: 'Terms of service for Quetzal Liveaboard.',
}

import { TermsContent } from './terms-content'

export default function TerminosPage() {
  return <TermsContent />
}
