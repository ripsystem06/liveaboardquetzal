import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Diving Risks & Safety — Quetzal Liveaboard',
  description: 'Essential safety guidelines, diving risks, and passenger responsibilities for Quetzal Liveaboard expeditions in Socorro, Sea of Cortez, and Magdalena Bay.',
}

import { DivingRisksContent } from '@/components/diving-risks-content'

export default function RiesgosBuceoPage() {
  return <DivingRisksContent />
}
