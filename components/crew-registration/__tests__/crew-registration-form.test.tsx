import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test-utils'
import { CrewRegistrationForm } from '../crew-registration-form'
import type { CrewRegistrationData } from '../schema'

const approvedRegistration: CrewRegistrationData = {
  id: 'reg_1',
  reservationId: 'res_1',
  status: 'approved',
  rejectReason: null,
  submittedAt: '2026-07-01T00:00:00.000Z',
  arrivalFlight: 'AA123',
  arrivalDate: '2026-07-15',
  arrivalTime: '10:00',
  departureFlight: 'AA456',
  departureDate: '2026-07-22',
  departureTime: '12:00',
  hotelName: 'Hotel Quetzal',
  hotelAddress: 'San José del Cabo',
  guests: [
    {
      id: 'guest_0',
      guestIndex: 0,
      fullName: 'Test Diver',
      dateOfBirth: '1990-01-01',
      nationality: 'Mexican',
      passportNumber: 'ABC123456',
      contactPhone: '+521234567890',
      contactEmail: null,
      certificationLevel: 'advanced',
      logbookDives: 120,
      diveInsurancePolicyNo: 'DAN-123',
      isNitroxCertified: false,
      weightKg: 75,
      ballastKg: 8,
      photoEquipment: null,
      bcdSize: 'm',
      wetsuitSize: 'm',
      finsSize: 'M',
      maskSize: null,
      bootiesSize: null,
      medicalLimitations: null,
      allergies: null,
      bloodType: 'o_positive',
      dietaryRestrictions: null,
      ec1Name: 'Emergency One',
      ec1Relation: 'Spouse',
      ec1Phone: '+521111111111',
      ec2Name: 'Emergency Two',
      ec2Relation: 'Friend',
      ec2Phone: '+522222222222',
      documents: [],
    },
  ],
}

describe('CrewRegistrationForm', () => {
  it('renders all seven sections', () => {
    renderWithProviders(<CrewRegistrationForm reservationId="res_1" guestCount={1} />)

    expect(screen.getByText('Personal Information')).toBeInTheDocument()
    expect(screen.getByText('Diving Experience')).toBeInTheDocument()
    expect(screen.getByText('Weight & Ballast')).toBeInTheDocument()
    expect(screen.getByText('Equipment Rental')).toBeInTheDocument()
    expect(screen.getByText('Medical & Dietary')).toBeInTheDocument()
    expect(screen.getByText('Flights & Accommodation')).toBeInTheDocument()
    expect(screen.getByText('Emergency Contacts & Documents')).toBeInTheDocument()
  })

  it('repeats sections 1–5 and 7 per guest, and renders section 6 exactly once', () => {
    renderWithProviders(<CrewRegistrationForm reservationId="res_1" guestCount={3} />)

    expect(screen.getAllByText('Personal Information')).toHaveLength(3)
    expect(screen.getAllByText('Diving Experience')).toHaveLength(3)
    expect(screen.getAllByText('Weight & Ballast')).toHaveLength(3)
    expect(screen.getAllByText('Equipment Rental')).toHaveLength(3)
    expect(screen.getAllByText('Medical & Dietary')).toHaveLength(3)
    expect(screen.getAllByText('Emergency Contacts & Documents')).toHaveLength(3)
    expect(screen.getAllByText('Flights & Accommodation')).toHaveLength(1)
  })

  it('renders read-only with no edit affordances when the registration is approved', () => {
    renderWithProviders(
      <CrewRegistrationForm
        reservationId="res_1"
        guestCount={1}
        registration={approvedRegistration}
      />
    )

    expect(
      screen.getByText('This registration has been approved and is read-only.')
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Submit for Review' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Save Draft' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Upload' })).not.toBeInTheDocument()
  })
})
