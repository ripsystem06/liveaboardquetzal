# Design: booking-backend-payments

## Technical Approach

Replace the mock `setTimeout` payment flow with a PostgreSQL-backed reservation system using Prisma. Reservations are time-boxed holds (48h Mon–Fri, 72h Sat–Sun) that block cruise dates. The payment section wires to API routes; the account panel fetches real reservation data with action buttons for pending holds.

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Currency | `Int` (USD cents) | Avoids floating-point precision errors; standard financial practice |
| Date blocking granularity | Cruise + date (any tier) | Per spec: one pending hold blocks ALL tiers for that date |
| Hold expiry check | DB transaction + `checkAndExpireHolds()` | Atomic; called before any GET returns reservation data |
| PDF bundle | `jspdf` + dynamic import | `jspdf` is lighter than `pdfmake`; dynamic import keeps initial bundle small |
| Supabase compatibility | UUID `@id`, no Prisma-specific fields | Enables future migration without schema changes |

## Data Flow

```
PaymentSection
    │
    ├── POST /api/reservations (creates pending_approval, sets holdExpiry)
    │       │
    │       └── [Bank Transfer] → GET /api/reservations/[id]/pdf → browser downloads PDF
    │       └── [PayPal]       → POST /api/reservations/[id]/confirm → mock confirm
    │
    └── Redirect to /account?reservation=res_xxx

AccountPage → GET /api/reservations?userId=X
    │
    └── ReservationList renders cards with:
            • Status badge (pending_approval / confirmed / expired / cancelled)
            • For pending_approval + bank_transfer: PDF re-download, Email, WhatsApp
            • For pending_approval + paypal: Email, WhatsApp (no PDF)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | Create | `Reservation` model with indexes on `(cruiseId, departureDate)` and `holdExpiry` |
| `lib/db.ts` | Create | Prisma client singleton (avoids hot-reload re-initialization) |
| `lib/pdf-generator.ts` | Create | `generateBankTransferPDF(reservation)` → `Buffer` using jspdf |
| `lib/email.ts` | Create | `sendExpiryEmail(reservation)` mock using console.log |
| `app/api/reservations/route.ts` | Create | POST (create) + GET (list by userId) |
| `app/api/reservations/[id]/route.ts` | Create | GET (single + auto-expire) |
| `app/api/reservations/[id]/confirm/route.ts` | Create | POST mock PayPal confirmation |
| `app/api/reservations/[id]/pdf/route.ts` | Create | GET returns PDF Buffer |
| `app/api/reservations/check-availability/route.ts` | Create | GET checks cruise+date availability |
| `components/account/reservation-list.tsx` | Create | Renders reservation cards with action buttons |
| `components/account/reservation-status-badge.tsx` | Create | Colored badge by status |
| `components/account/reservation-actions.tsx` | Create | Email/WhatsApp/PDF buttons per reservation |
| `components/booking/payment-section.tsx` | Modify | Wire `onPay` to API instead of setTimeout mock |
| `components/account/account-page-client.tsx` | Modify | Switch `ReservationHistory` to `ReservationList` |

## Interfaces

### Prisma Schema

```prisma
model Reservation {
  id            String   @id @default(uuid())
  userId        String
  cruiseId      String
  cruiseName    String
  departureDate String
  route         String
  tier          String   // "basic" | "standard" | "premium"
  tierPrice     Int      // USD cents
  guestCount    Int
  freeSpaces    Int      @default(0)
  paidSpaces    Int
  totalAmount   Int      // USD cents
  paymentMethod String   // "paypal" | "bank_transfer"
  status        String   @default("pending_approval")
  holdExpiry    DateTime
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([cruiseId, departureDate])
  @@index([holdExpiry])
}
```

### API Request/Response Types

**POST /api/reservations**
```typescript
// Request
{
  userId: string
  cruiseId: string
  cruiseName: string
  departureDate: string
  route: string
  tier: "basic" | "standard" | "premium"
  tierPrice: number      // cents
  guestCount: number
  paymentMethod: "paypal" | "bank_transfer"
}
// Response 201
{
  id: string
  status: "pending_approval"
  holdExpiry: string    // ISO date
}
// Response 409 (date blocked)
{
  error: "DATE_BLOCKED"
  message: "Cruise date is currently held by another reservation"
}
```

**GET /api/reservations?userId=X**
```typescript
// Response 200
{
  reservations: Reservation[]
}
```

**POST /api/reservations/[id]/confirm**
```typescript
// Response 200
{
  id: string
  status: "pending_approval"
  message: "PayPal mock confirmation received"
}
// Response 400 (invalid transition)
{
  error: "INVALID_TRANSITION"
  message: "Cannot confirm reservation in status: expired"
}
```

**GET /api/reservations/[id]/pdf**
```typescript
// Response 200
// Content-Type: application/pdf
// Content-Disposition: attachment; filename="reservation-{id}.pdf"
```

**GET /api/reservations/check-availability?cruiseId=X&departureDate=Y**
```typescript
// Response 200
{
  available: boolean
  blockedBy?: string  // reservation id if not available
}
```

### PDF Content Structure

```
+------------------------------------------+
|  QUETZAL LIVEABOARD                      |
|  Bank Transfer Instructions               |
+------------------------------------------+
|  Reservation ID: res_xxx                  |
|  Cruise: Socorro Islands                  |
|  Departure: 2026-03-15                    |
|  Tier: Premium                            |
|  Guests: 4                                |
|  Total: $12,800 USD                       |
+------------------------------------------+
|  Bank Name: Banco Nacional de México     |
|  SWIFT: BNMXMX01                          |
|  IBAN: MX60XXXXX...                       |
|  Account: 1234567890                      |
|  Beneficiary: Quetzal Expeditions S.A.   |
+------------------------------------------+
|  ⚠ Include Reservation ID in transfer    |
|    reference field                        |
+------------------------------------------+
```

### Email Mock

```typescript
// dev: console.log
// prod (future): Ethereal / SendGrid
{
  to: user.email,
  subject: `Reservation ${id} has expired — Quetzal Liveaboard`,
  body: `
    Your reservation for ${cruiseName} on ${departureDate} has expired.
    Reservation ID: ${id}
    If you still wish to book, please start a new reservation.
  `
}
```

## Hold Expiry Logic

```typescript
// lib/db.ts
export async function checkAndExpireHolds(reservation: Reservation): Promise<Reservation> {
  if (reservation.status !== 'pending_approval') return reservation
  if (reservation.holdExpiry < new Date()) {
    const updated = await prisma.reservation.update({
      where: { id: reservation.id },
      data: { status: 'expired' }
    })
    await sendExpiryEmail(updated)
    return updated
  }
  return reservation
}
```

Called at the top of every GET handler that returns reservation data.

## State Management Interaction

After `POST /api/reservations` succeeds:
1. Dispatch `CONFIRM_PAYMENT` to booking reducer
2. Clear booking state via `RESET_TO_LOGIN`
3. Redirect to `/account?reservation={newReservationId}`

The reservation ID is passed via query param to surface a "just created" banner on the account page.

## Testing Strategy

| Layer | What | Approach |
|-------|------|---------|
| Unit | `checkAndExpireHolds`, `calculatePayment`, PDF content | Vitest + mocks |
| Integration | All API routes | `fetch` against dev server |
| E2E | Full PayPal and bank flows | Playwright against `/booking` → `/account` |

## Translation Keys (additions)

```typescript
// EN
'account.reservation.id': 'Reservation ID'
'account.reservation.status.pending': 'Pending Approval'
'account.reservation.status.confirmed': 'Confirmed'
'account.reservation.status.expired': 'Expired'
'account.reservation.status.cancelled': 'Cancelled'
'account.reservation.holdExpires': 'Hold expires'
'account.reservation.actions.email': 'Email Confirmation'
'account.reservation.actions.whatsapp': 'WhatsApp Us'
'account.reservation.actions.pdf': 'Download PDF'
'account.reservation.newBadge': 'New Reservation'

// ES
'account.reservation.id': 'ID de Reserva'
'account.reservation.status.pending': 'Pendiente de Aprobación'
'account.reservation.status.confirmed': 'Confirmada'
'account.reservation.status.expired': 'Expirada'
'account.reservation.status.cancelled': 'Cancelada'
'account.reservation.holdExpires': 'La reserva expira'
'account.reservation.actions.email': 'Enviar por Email'
'account.reservation.actions.whatsapp': 'WhatsApp'
'account.reservation.actions.pdf': 'Descargar PDF'
'account.reservation.newBadge': 'Nueva Reserva'
```

## Migration / Rollout

1. Add `prisma` + `@prisma/client` to `package.json`
2. Run `prisma init` and add the `Reservation` model
3. Run `prisma migrate dev --name add_reservations`
4. Deploy API routes behind existing booking flow (feature flag on payment section)
5. Once verified, remove `setTimeout` mock from `payment-section.tsx`

No data migration required — this is a net-new feature.

## Open Questions

- [ ] Should `Reservation.userId` be a foreign key to a `User` model? (Proposal says Supabase-compatible; currently user is session-based with no DB record)
- [ ] Real PayPal confirmation endpoint path — `confirm-paypal` (proposal) or `confirm` (task description)? Use `confirm` per task description
- [ ] PDF storage: `public/pdfs/` (static, proposal) vs in-memory `Buffer` (task description)? Use in-memory Buffer per task description — avoids stale files
