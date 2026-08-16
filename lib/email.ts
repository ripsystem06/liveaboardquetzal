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
  paymentMethod: string
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

export async function sendReservationConfirmedEmail(reservation: ReservationEmailData): Promise<void> {
  const client = getEmailClient()
  const subject = `Reservation confirmed — Quetzal Liveaboard`

  const html = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #16a34a;">Reservation Confirmed</h1>
  <p>Great news! Your reservation for <strong>${reservation.cruiseName}</strong> has been confirmed.</p>
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
  <p style="margin-top: 16px;">We look forward to having you aboard the Quetzal!</p>
</div>`

  await client.emails.send({
    from: process.env.FROM_EMAIL || 'reservations@quetzal.com',
    to: reservation.userEmail,
    subject,
    html,
  })
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

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://quetzal.com'
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
