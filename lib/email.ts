import { Resend } from 'resend'

export interface ReservationEmailData {
  id: string
  userId: string
  userEmail: string
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
  paymentMethod: string | null
  status: string
  holdExpiry: Date
  createdAt: Date
  updatedAt: Date
}

interface EmailClient {
  emails: {
    send(params: { from: string; to: string; subject: string; html: string }): Promise<unknown>
  }
}

function getEmailClient(): EmailClient {
  if (process.env.RESEND_API_KEY) {
    return new Resend(process.env.RESEND_API_KEY)
  }

  return {
    emails: {
      async send(params) {
        console.log('--- EMAIL MOCK ---')
        console.log(`To: ${params.to}`)
        console.log(`Subject: ${params.subject}`)
        console.log(`Body:\n${params.html.replace(/<[^>]*>/g, '')}`)
        console.log('------------------')
      },
    },
  }
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-US')} USD`
}

export async function sendExpiryEmail(reservation: ReservationEmailData): Promise<void> {
  const client = getEmailClient()
  const subject = `Your reservation has expired — Quetzal Liveaboard`

  const html = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #dc2626;">Reservation Expired</h1>
  <p>Your reservation for <strong>${reservation.cruiseName}</strong> has expired.</p>
  <hr style="border: 0; border-top: 1px solid #e5e7eb;" />
  <h3>Reservation Details</h3>
  <table style="width: 100%; border-collapse: collapse;">
    <tr><td style="padding: 4px 0; color: #6b7280;">Reservation ID</td><td>${reservation.id}</td></tr>
    <tr><td style="padding: 4px 0; color: #6b7280;">Cruise</td><td>${reservation.cruiseName}</td></tr>
    <tr><td style="padding: 4px 0; color: #6b7280;">Departure Date</td><td>${reservation.departureDate}</td></tr>
    <tr><td style="padding: 4px 0; color: #6b7280;">Route</td><td>${reservation.route}</td></tr>
  </table>
  <p style="margin-top: 16px;">The date has been released and is now available for booking again.</p>
  <p>If you still wish to book, please start a new reservation at Quetzal Liveaboard.</p>
</div>`

  await client.emails.send({
    from: process.env.FROM_EMAIL || 'reservations@quetzal.com',
    to: reservation.userEmail,
    subject,
    html,
  })
}

export async function sendReservationCreatedEmail(reservation: ReservationEmailData): Promise<void> {
  const client = getEmailClient()
  const subject = `Reservation created — Quetzal Liveaboard`

  const html = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #2563eb;">Reservation Created</h1>
  <p>Your reservation for <strong>${reservation.cruiseName}</strong> has been created and is pending admin approval.</p>
  <hr style="border: 0; border-top: 1px solid #e5e7eb;" />
  <h3>Reservation Details</h3>
  <table style="width: 100%; border-collapse: collapse;">
    <tr><td style="padding: 4px 0; color: #6b7280;">Reservation ID</td><td>${reservation.id}</td></tr>
    <tr><td style="padding: 4px 0; color: #6b7280;">Cruise</td><td>${reservation.cruiseName}</td></tr>
    <tr><td style="padding: 4px 0; color: #6b7280;">Departure Date</td><td>${reservation.departureDate}</td></tr>
    <tr><td style="padding: 4px 0; color: #6b7280;">Route</td><td>${reservation.route}</td></tr>
    <tr><td style="padding: 4px 0; color: #6b7280;">Tier</td><td>${reservation.tier}</td></tr>
    <tr><td style="padding: 4px 0; color: #6b7280;">Guests</td><td>${reservation.guestCount}</td></tr>
    <tr><td style="padding: 4px 0; color: #6b7280;">Total</td><td><strong>${formatCurrency(reservation.totalAmount)}</strong></td></tr>
  </table>
  <p style="margin-top: 16px;">We will notify you once your reservation has been reviewed by our team.</p>
</div>`

  await client.emails.send({
    from: process.env.FROM_EMAIL || 'reservations@quetzal.com',
    to: reservation.userEmail,
    subject,
    html,
  })
}

export async function sendPaymentReceivedEmail(reservation: ReservationEmailData): Promise<void> {
  const client = getEmailClient()
  const subject = `Payment received — Quetzal Liveaboard`

  const html = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #2563eb;">Payment Received</h1>
  <p>Thank you! We received your payment for <strong>${reservation.cruiseName}</strong>.</p>
  <p>Your reservation is now pending review by our team. We will notify you once it is approved.</p>
  <hr style="border: 0; border-top: 1px solid #e5e7eb;" />
  <h3>Reservation Details</h3>
  <table style="width: 100%; border-collapse: collapse;">
    <tr><td style="padding: 4px 0; color: #6b7280;">Reservation ID</td><td>${reservation.id}</td></tr>
    <tr><td style="padding: 4px 0; color: #6b7280;">Cruise</td><td>${reservation.cruiseName}</td></tr>
    <tr><td style="padding: 4px 0; color: #6b7280;">Departure Date</td><td>${reservation.departureDate}</td></tr>
    <tr><td style="padding: 4px 0; color: #6b7280;">Route</td><td>${reservation.route}</td></tr>
    <tr><td style="padding: 4px 0; color: #6b7280;">Total</td><td><strong>${formatCurrency(reservation.totalAmount)}</strong></td></tr>
  </table>
  <p style="margin-top: 16px;">We will contact you once your reservation has been reviewed by our team.</p>
</div>`

  await client.emails.send({
    from: process.env.FROM_EMAIL || 'reservations@quetzal.com',
    to: reservation.userEmail,
    subject,
    html,
  })
}

export interface ConfirmationEmailData {
  id: string
  userEmail: string
  cruiseName: string
  departureDate: string
  route: string
  tier: string
  guestCount: number
  totalAmount: number
  confirmationEmailSentAt?: Date | null
}

/**
 * Sends the reservation confirmation email once a reservation is `approved` AND
 * payment is validated (Stripe success or admin wire confirmation).
 *
 * At-most-once guard: if `confirmationEmailSentAt` is already set, this is a
 * no-op and returns `false`. On a successful send the timestamp is persisted via
 * Prisma (lazy-imported to avoid a `db` ↔ `email` cycle) so duplicate events can
 * never produce a second email.
 *
 * Route wiring (Stripe webhook / admin confirm) is intentionally NOT done here.
 */
export async function sendConfirmationEmail(data: ConfirmationEmailData): Promise<boolean> {
  if (data.confirmationEmailSentAt) {
    return false
  }

  const client = getEmailClient()
  const subject = `Your reservation is confirmed — Quetzal Liveaboard`

  const html = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #2563eb;">Reservation Confirmed</h1>
  <p>Your reservation for <strong>${data.cruiseName}</strong> is confirmed and your payment has been validated.</p>
  <hr style="border: 0; border-top: 1px solid #e5e7eb;" />
  <h3>Reservation Details</h3>
  <table style="width: 100%; border-collapse: collapse;">
    <tr><td style="padding: 4px 0; color: #6b7280;">Reservation ID</td><td>${data.id}</td></tr>
    <tr><td style="padding: 4px 0; color: #6b7280;">Cruise</td><td>${data.cruiseName}</td></tr>
    <tr><td style="padding: 4px 0; color: #6b7280;">Departure Date</td><td>${data.departureDate}</td></tr>
    <tr><td style="padding: 4px 0; color: #6b7280;">Route</td><td>${data.route}</td></tr>
    <tr><td style="padding: 4px 0; color: #6b7280;">Tier</td><td>${data.tier}</td></tr>
    <tr><td style="padding: 4px 0; color: #6b7280;">Guests</td><td>${data.guestCount}</td></tr>
    <tr><td style="padding: 4px 0; color: #6b7280;">Total</td><td><strong>${formatCurrency(data.totalAmount)}</strong></td></tr>
  </table>
  <p style="margin-top: 16px;">Thank you for booking with Quetzal Liveaboard. We look forward to having you aboard.</p>
</div>`

  await client.emails.send({
    from: process.env.FROM_EMAIL || 'reservations@quetzal.com',
    to: data.userEmail,
    subject,
    html,
  })

  // Persist the at-most-once guard so a duplicate event never sends twice.
  const { prisma } = await import('./db')
  await prisma.reservation.update({
    where: { id: data.id },
    data: { confirmationEmailSentAt: new Date() },
  })

  return true
}

export interface CrewInviteEmailData {
  userEmail: string
  reservationId: string
  cruiseName: string
  departureDate: string
}

export async function sendCrewRegistrationInviteEmail(data: CrewInviteEmailData): Promise<void> {
  const client = getEmailClient()
  const subject = `Complete your crew registration — Quetzal Liveaboard`

  const baseUrl = process.env.SITE_URL || 'https://www.liveaboardquetzal.com'
  const crewUrl = `${baseUrl}/account/crew-registration/${data.reservationId}`

  const html = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #2563eb;">Complete Your Crew Registration</h1>
  <p>Great news — your reservation for <strong>${data.cruiseName}</strong> (departing ${data.departureDate}) has been confirmed.</p>
  <p>Before you board, every guest must complete their crew registration: personal details, diving experience, rental sizes, medical information, emergency contacts, and the required documents.</p>
  <p style="margin-top: 24px;">
    <a href="${crewUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Complete Crew Registration</a>
  </p>
  <p style="color: #6b7280; font-size: 12px;">If the button doesn't work, copy this link into your browser: ${crewUrl}</p>
  <p style="color: #6b7280;">We look forward to having you aboard the Quetzal!</p>
</div>`

  await client.emails.send({
    from: process.env.FROM_EMAIL || 'reservations@quetzal.com',
    to: data.userEmail,
    subject,
    html,
  })
}

export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  const client = getEmailClient()
  const subject = `Welcome to Quetzal Liveaboard`

  const html = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #2563eb;">Welcome aboard, ${name}!</h1>
  <p>Thank you for creating an account with Quetzal Liveaboard.</p>
  <p>You can now browse our available cruises and make reservations for your next diving adventure.</p>
  <hr style="border: 0; border-top: 1px solid #e5e7eb;" />
  <p style="color: #6b7280;">If you have any questions, feel free to reach out to our team.</p>
</div>`

  await client.emails.send({
    from: process.env.FROM_EMAIL || 'reservations@quetzal.com',
    to: email,
    subject,
    html,
  })
}

export async function sendOtpEmail(email: string, code: string): Promise<void> {
  const client = getEmailClient()
  const subject = `Your Quetzal Liveaboard login code`

  const html = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #2563eb;">Your login code</h1>
  <p>Use the code below to sign in to Quetzal Liveaboard. It expires in 10 minutes.</p>
  <p style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #2563eb;">${code}</p>
  <p style="color: #6b7280;">If you did not request this code, you can safely ignore this email.</p>
</div>`

  await client.emails.send({
    from: process.env.FROM_EMAIL || 'reservations@quetzal.com',
    to: email,
    subject,
    html,
  })
}
