# Proposal: booking-backend-payments

## Intent

Replace the mock payment flow (500ms timeout → confirmation) with a PostgreSQL-backed reservation system. PayPal and bank transfer selections create time-boxed holds on cruise dates; the account panel shows real status with email/WhatsApp receipt actions and PDF re-download.

## Scope

**In Scope**: Prisma schema, API routes, PayPal mock, bank PDF, hold auto-expiry, account panel.

**Out of Scope**: Real PayPal/email/WhatsApp APIs, admin panel, Stripe, Supabase migration (schema Supabase-compatible), new auth.

## Capabilities

### New Capabilities
- `booking-reservations`: Reservation CRUD with hold lifecycle
- `payment-bank-transfer-pdf`: SWIFT/IBAN PDF generation + auto-download
- `account-reservation-panel`: Live reservation list with action buttons
- `reservation-email-notification`: Mock email on hold expiry

### Modified Capabilities
- None (payment-section wires to API; no spec-level behavior change)

## Approach

1. **Prisma** — `prisma/schema.prisma`: User + Reservation (id, cruiseId, cruiseName, departureDate, tier, guestCount, totalPrice, paymentMethod, status, holdExpiry, userId, pdfUrl, createdAt). Local PostgreSQL; schema Supabase-compatible.
2. **API routes** (`app/api/reservations/`): POST / (create), POST /:id/confirm-paypal (mock → pending_approval), GET / (list + auto-release), GET /:id (detail).
3. **PDF** (`lib/pdf-generator.ts`) — jspdf: SWIFT, IBAN, bank name, cruise info, total. Saved to `public/pdfs/{id}.pdf`.
4. **Email** (`lib/email.ts`) — console.log + Ethereal interface.
5. **PaymentSection** — POST /api/reservations then confirm (PayPal) or PDF download (bank).
6. **ReservationHistory** — GET /api/reservations + action buttons for pending_approval.

## Affected Areas

| Area | Impact |
|------|--------|
| `prisma/schema.prisma` | New |
| `app/api/reservations/route.ts` | New |
| `app/api/reservations/[id]/confirm-paypal/route.ts` | New |
| `app/api/reservations/[id]/route.ts` | New |
| `lib/pdf-generator.ts` | New |
| `lib/email.ts` | New |
| `components/booking/payment-section.tsx` | Modified |
| `components/account/reservation-history.tsx` | Modified |
| `contexts/language-context.tsx` | Modified |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| jspdf bundle size | Medium | Dynamic import or pdfmake |
| Hold expiry race condition | Low | Check + release in single DB transaction |
| Supabase schema mismatch | Low | UUID ids, RLS-compatible field design |

## Rollback Plan

1. Delete `prisma/schema.prisma` and remove Prisma from `package.json`
2. Restore `PaymentSection` `setTimeout` mock
3. Restore `ReservationHistory` localStorage version
4. Delete `app/api/reservations/`

## Dependencies

`prisma` + `@prisma/client`, `jspdf`/`pdfmake`, local PostgreSQL

## Success Criteria

- [ ] POST /api/reservations creates reservation + blocks date
- [ ] PayPal mock → pending_approval status
- [ ] Bank transfer → PDF auto-download
- [ ] Account panel: email/WhatsApp/PDF buttons for pending_approval
- [ ] Expired holds auto-release + log email notification
- [ ] Existing Vitest tests pass
