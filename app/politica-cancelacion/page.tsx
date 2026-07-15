import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Cancelación | Quetzal Liveaboard',
  description: 'Cancellation and refund policy for Quetzal Liveaboard expeditions.',
}

import { CancellationContent } from '@/components/cancellation-content'

export default function PoliticaCancelacionPage() {
  return <CancellationContent />
}
