import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos de Servicio — Quetzal Liveaboard',
  description: 'Terms and conditions for diving expeditions aboard Quetzal Liveaboard in Baja California. Policies on reservations, payments, and passenger responsibilities.',
}

import { TermsContent } from './terms-content'

export default function TerminosPage() {
  return <TermsContent />
}
