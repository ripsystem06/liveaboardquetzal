export interface ReservationEmailData {
  id: string
  userId: string
  cruiseId: string
  cruiseName: string
  departureDate: string
  route: string
  tier: string
  tierPrice: number
  guestCount: number
  freeSpaces: number
  paidSpaces: number
  totalAmount: number
  paymentMethod: string
  status: string
  holdExpiry: Date
  createdAt: Date
  updatedAt: Date
}

/**
 * Mock email sender for development.
 * Logs formatted email content to console.
 * In production, this would connect to a real email service (resend, sendgrid, etc.)
 */
export async function sendExpiryEmail(reservation: ReservationEmailData): Promise<void> {
  const subject = `Your reservation has expired — Quetzal Liveaboard`
  const body = `
Reservation ID: ${reservation.id}
Cruise: ${reservation.cruiseName}
Departure Date: ${reservation.departureDate}
Route: ${reservation.route}

The date has been released and is now available for booking again.

If you still wish to book, please start a new reservation at Quetzal Liveaboard.
  `.trim()

  console.log('--- EMAIL MOCK ---')
  console.log(`To: user@example.com`)
  console.log(`Subject: ${subject}`)
  console.log(`Body:\n${body}`)
  console.log('------------------')
}
