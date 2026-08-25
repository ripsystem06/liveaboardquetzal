import { describe, expect, it } from 'vitest'
import { renderWithProviders, screen } from '@/test-utils'
import { DestinationsGrid } from './destinations-grid'

describe('DestinationsGrid', () => {
  it('uses the Magdalena Bay hero image for the MagBay card', () => {
    renderWithProviders(<DestinationsGrid />)

    expect(screen.getByRole('img', { name: 'MAG BAY + SOCORRO' })).toHaveAttribute(
      'src',
      '/balllenahero.webp',
    )
  })
})
