import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { POST as createReservation } from '@/app/api/reservations/route'
import { POST as createCharter } from '@/app/api/admin/charters/route'

const enabled = process.env.POSTGRES_CONCURRENCY_TESTS === '1'

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(async () => ({ user: { id: 'race-user', email: 'race@quetzal.test' } })),
  AuthError: class AuthError extends Error {},
  ForbiddenError: class ForbiddenError extends Error {},
}))
vi.mock('@/lib/admin-auth', () => ({
  requireAdmin: vi.fn(async () => ({ userId: 'race-user', email: 'race@quetzal.test' })),
}))
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(async () => ({ allowed: true })),
  getClientIP: vi.fn(() => '127.0.0.1'),
}))
vi.mock('@/lib/email', () => ({ sendReservationCreatedEmail: vi.fn(async () => undefined) }))
vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }))

const describePostgres = enabled ? describe : describe.skip

describePostgres('PostgreSQL-backed capacity races', () => {
  const reservationBody = {
    cruiseId: 'race-cruise',
    cruiseName: 'Race Cruise',
    departureDate: '2026-12-10',
    route: 'Cabo San Lucas',
    tier: 'standard',
    tierPrice: 3000,
    guestCount: 1,
    freeSpaces: 0,
    paidSpaces: 1,
    totalAmount: 3000,
    termsVersion: 3,
  }

  function reservationRequest() {
    return new NextRequest('http://localhost/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reservationBody),
    })
  }

  function charterRequest() {
    return new NextRequest('http://localhost/api/admin/charters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cruiseId: 'race-cruise',
        cruiseName: 'Race Cruise',
        departureDate: '2026-12-11',
        route: 'Cabo San Lucas',
        charterType: 'medio',
        guestCount: 4,
      }),
    })
  }

  beforeAll(async () => {
    await prisma.user.create({
      data: { id: 'race-user', name: 'Race User', email: 'race@quetzal.test' },
    })
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('permits exactly one concurrent shared-group request when one half-charter remains', async () => {
    await prisma.reservation.create({
      data: {
        userId: 'race-user',
        cruiseId: 'race-cruise',
        cruiseName: 'Race Cruise',
        departureDate: reservationBody.departureDate,
        route: 'Cabo San Lucas',
        tier: 'standard',
        tierPrice: 3000,
        guestCount: 1,
        freeSpaces: 0,
        paidSpaces: 1,
        totalAmount: 3000,
        holdExpiry: new Date(Date.now() + 60_000),
      },
    })

    const responses = await Promise.all([createReservation(reservationRequest()), createReservation(reservationRequest())])
    const statuses = (await Promise.all(responses.map((response) => response.json().then((body) => ({ status: response.status, body })))))
      .sort((a, b) => a.status - b.status)

    expect(statuses.map(({ status }) => status)).toEqual([201, 400])
    expect(statuses[1].body.error).toBe('INSUFFICIENT_SPOTS')
    expect(await prisma.reservation.count({ where: { departureDate: reservationBody.departureDate } })).toBe(2)
  })

  it('permits exactly one concurrent medio-charter registration', async () => {
    await prisma.reservation.create({
      data: {
        userId: 'race-user',
        cruiseId: 'race-cruise',
        cruiseName: 'Race Cruise',
        departureDate: '2026-12-11',
        route: 'Cabo San Lucas',
        tier: 'standard',
        tierPrice: 3000,
        guestCount: 9,
        freeSpaces: 0,
        paidSpaces: 9,
        totalAmount: 27000,
        holdExpiry: new Date(Date.now() + 60_000),
      },
    })

    const responses = await Promise.all([createCharter(charterRequest()), createCharter(charterRequest())])
    const statuses = (await Promise.all(responses.map((response) => response.json().then((body) => ({ status: response.status, body })))))
      .sort((a, b) => a.status - b.status)

    expect(statuses.map(({ status }) => status)).toEqual([201, 400])
    expect(statuses[1].body.error).toBe('CHARTER_OVER_CAPACITY')
    expect(await prisma.reservation.count({ where: { departureDate: '2026-12-11' } })).toBe(2)
  })
})
