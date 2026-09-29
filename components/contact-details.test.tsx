import { describe, expect, it } from 'vitest'
import { render, renderWithProviders, screen, userEvent } from '@/test-utils'
import { LanguageProvider } from '@/contexts/language-context'
import ContactoPage from '@/app/contacto/page'
import { ContactFormSection } from './contact-form-section'
import { Footer } from './footer'

const productionEmail = 'info@liveaboardquetzal.com'
const productionPhone = '+52 1 646 146 1000'
const staleEmail = /@quetzalliveaboard\.com/

describe('production contact details', () => {
  it('links the production email in the contact section and never the stale address', () => {
    render(
      <LanguageProvider>
        <ContactFormSection />
      </LanguageProvider>,
    )

    expect(screen.getByRole('link', { name: productionEmail })).toHaveAttribute(
      'href',
      `mailto:${productionEmail}`,
    )
    expect(screen.queryByText(staleEmail)).toBeNull()
  })

  it('shows the production email in the footer and never the stale address', () => {
    render(
      <LanguageProvider>
        <Footer />
      </LanguageProvider>,
    )

    expect(screen.getByText(productionEmail)).toBeInTheDocument()
    expect(screen.queryByText(staleEmail)).toBeNull()
  })

  it('shows the production email and phone on the contact page in both languages', async () => {
    const user = userEvent.setup()

    renderWithProviders(<ContactoPage />)

    expect(screen.getAllByText(productionEmail).length).toBeGreaterThan(0)
    expect(screen.getByText(productionPhone)).toBeInTheDocument()
    expect(screen.queryByText(staleEmail)).toBeNull()

    await user.click(screen.getAllByLabelText('Switch to Spanish')[0])

    expect(screen.getAllByText(productionEmail).length).toBeGreaterThan(0)
    expect(screen.getByText(productionPhone)).toBeInTheDocument()
    expect(screen.queryByText(staleEmail)).toBeNull()
  })
})
