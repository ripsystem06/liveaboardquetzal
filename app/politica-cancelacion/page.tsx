import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cancellation Policy — Quetzal Liveaboard',
  description: 'Cancellation terms, refund schedules, and rescheduling options for Quetzal Liveaboard diving expeditions. Know before you book your Baja California adventure.',
}

import { CancellationContent } from '@/components/cancellation-content'

export default function PoliticaCancelacionPage() {
  return <CancellationContent />
}
