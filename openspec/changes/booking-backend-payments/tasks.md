# Tasks: booking-backend-payments

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~950–1050 (new + modified) |
| New files | 12 |
| Modified files | 4 |
| 400-line budget risk | High |
| 800-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Prisma foundation + lib utilities | PR 1 | Schema, db.ts, pdf-generator, email; low risk |
| 2 | Core API routes | PR 2 | All 5 API routes; depends on PR 1 |
| 3 | Frontend wiring | PR 3 | payment-section, account components, i18n; depends on PR 2 |
| 4 | Tests | PR 4 | Vitest tests for lib + API; depends on PR 2 |

---

## Phase 1: Setup & Foundation

- [x] 1.1 Add `prisma` + `@prisma/client` + `jspdf` to `package.json`
- [x] 1.2 Create `prisma/schema.prisma` with Reservation model (fields per design: id, userId, cruiseId, cruiseName, departureDate, route, tier, tierPrice, guestCount, freeSpaces, paidSpaces, totalAmount, paymentMethod, status, holdExpiry, createdAt, updatedAt) + `@@index([cruiseId, departureDate])` + `@@index([holdExpiry])`
- [x] 1.3 Create `lib/db.ts` — Prisma client singleton with `checkAndExpireHolds()` function
- [x] 1.4 Create `lib/pdf-generator.ts` — `generateBankTransferPDF(reservation)` returning Buffer using jspdf (bank name, SWIFT, IBAN, account, cruiseName, tier, guestCount, totalAmount, reservation ID)
- [x] 1.5 Create `lib/email.ts` — `sendExpiryEmail(reservation)` mock (console.log + Ethereal-style interface)
- [x] 1.6 Run `npx prisma generate` + `npx prisma migrate dev --name add_reservations`

## Phase 2: API Routes

- [x] 2.1 Create `app/api/reservations/route.ts` — `POST` creates reservation with holdExpiry calc (48h Mon–Fri, 72h Sat–Sun), date-blocking check; `GET` lists by userId with auto-expiry
- [x] 2.2 Create `app/api/reservations/[id]/route.ts` — `GET` returns single reservation with auto-expire check
- [x] 2.3 Create `app/api/reservations/[id]/confirm/route.ts` — `POST` mock PayPal confirm (validates transition pending_approval→confirmed)
- [x] 2.4 Create `app/api/reservations/[id]/pdf/route.ts` — `GET` returns PDF Buffer with correct Content-Type + Content-Disposition
- [x] 2.5 Create `app/api/reservations/check-availability/route.ts` — `GET` checks cruise+date availability (returns `{available, blockedBy?}`)

## Phase 3: Frontend — PaymentSection

- [ ] 3.1 Modify `components/booking/payment-section.tsx` — replace `setTimeout` mock with `POST /api/reservations` call; on bank transfer: fetch PDF and trigger download; on PayPal: call `POST /api/reservations/[id]/confirm`; redirect to `/account?reservation={id}`
- [ ] 3.2 Wire PayPal and Bank Transfer buttons to respective API calls with loading state
- [ ] 3.3 Update confirmation screen to display reservation ID from API response

## Phase 4: Frontend — Account Panel

- [ ] 4.1 Create `components/account/reservation-status-badge.tsx` — colored badge per status (pending_approval=amber, confirmed=blue, expired=gray, cancelled=red)
- [ ] 4.2 Create `components/account/reservation-actions.tsx` — Email/WhatsApp/PDF buttons for pending_approval reservations (WhatsApp pre-fills message with reservation ID + total)
- [ ] 4.3 Create `components/account/reservation-list.tsx` — fetches `GET /api/reservations?userId=X` and renders reservation cards with status badge + action buttons
- [ ] 4.4 Modify `components/account/account-page-client.tsx` — switch `ReservationHistory` to `ReservationList`

## Phase 5: i18n

- [ ] 5.1 Add EN translation keys to `contexts/language-context.tsx`: `account.reservation.id`, `account.reservation.status.pending`, `account.reservation.status.confirmed`, `account.reservation.status.expired`, `account.reservation.status.cancelled`, `account.reservation.holdExpires`, `account.reservation.actions.email`, `account.reservation.actions.whatsapp`, `account.reservation.actions.pdf`, `account.reservation.newBadge`, `account.reservation.pdfGenerated`, `account.reservation.emailSent`
- [ ] 5.2 Add matching ES translation keys

## Phase 6: Tests

- [ ] 6.1 Write Vitest tests for `lib/pdf-generator.ts` — verify PDF Buffer is non-empty and contains reservation ID text
- [ ] 6.2 Write Vitest tests for `lib/email.ts` — verify console.log output format
- [ ] 6.3 Write Vitest tests for `checkAndExpireHolds()` — covers: already expired → status updated, not expired → no change, already confirmed → no change
- [ ] 6.4 Write Vitest tests for hold duration calculation (48h Mon–Fri, 72h Sat–Sun)
- [ ] 6.5 Write Vitest tests for reservation API routes (mock Prisma; test 409 on date-blocked, 400 on invalid transition, 201 on success)
