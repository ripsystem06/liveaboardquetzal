import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Riesgos de Buceo | Quetzal Liveaboard',
  description: 'Diving risks, safety guidelines, and guest responsibilities for Quetzal Liveaboard expeditions.',
}

import { DivingRisksContent } from '@/components/diving-risks-content'

export default function RiesgosBuceoPage() {
  return <DivingRisksContent />
}
