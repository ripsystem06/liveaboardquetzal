import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import OurBoatPage from '@/app/nuestro-barco/page'

// ── Mutable translation store ──────────────────────────────────────────────
let translationStore: Record<string, string> = {}

// ── Mock next/image ────────────────────────────────────────────────────────
vi.mock('next/image', () => ({
  default: ({ src, alt, fill, priority, className, width, height, sizes, ...props }: Record<string, unknown>) =>
    React.createElement('img', {
      src,
      alt,
      'data-fill': fill ? 'true' : undefined,
      'data-priority': priority ? 'true' : undefined,
      className,
      width: width ? Number(width) : undefined,
      height: height ? Number(height) : undefined,
      'data-sizes': sizes || undefined,
      ...props,
    }),
}))

// ── Mock next/link ─────────────────────────────────────────────────────────
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) =>
    React.createElement('a', { href, ...props }, children),
}))

// ── Mock lucide-react ─────────────────────────────────────────────────────
vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('lucide-react')>()
  return {
    ...actual,
    // Override specific icons we need testids for
    ArrowRight: () => React.createElement('span', { 'data-testid': 'arrow-right' }),
    Star: () => React.createElement('span', { 'data-testid': 'icon-star' }),
  }
})

// ── Mock useLanguage ───────────────────────────────────────────────────────
vi.mock('@/contexts/language-context', () => ({
  useLanguage: () => ({
    language: 'en' as const,
    setLanguage: vi.fn(),
    t: (key: string) => {
      if (key in translationStore) return translationStore[key]
      return key // fallback: returns the key itself so tests can assert on missing keys
    },
  }),
  LanguageProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}))

// ── Mock useUser ───────────────────────────────────────────────────────────
vi.mock('@/contexts/user-context', () => ({
  useUser: () => ({
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    sessionReady: true,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    updateProfile: vi.fn(),
  }),
  UserProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}))

// ── Full boat translations (post-reframe) ──────────────────────────────────
const fullBoatTranslations: Record<string, string> = {
  // Hero
  'boat.hero': 'Step Aboard Your Adventure',
  'boat.subtitle': 'Your 120-foot floating home awaits — designed for you, the ocean, and the stories you will bring back.',
  'boat.heroImageAlt': 'Quetzal sailing through the Pacific at sunrise',

  // Your Floating Home
  'boat.story': 'Your Floating Home',
  'boat.storyText1': 'From the moment you step aboard, the Quetzal is yours.',
  'boat.storyText2': 'Your cabin becomes your sanctuary — a private space where the rhythm of the sea lulls you to sleep and sunrise greets you through your window.',
  'boat.storyText3': 'Your days follow your rhythm. Coffee on the sun deck. A dive when you are ready. Lunch with new friends who share your passion.',
  'boat.storyText4': 'This is not just a boat. It is your home at sea — and every detail exists so you can live the adventure, not just observe it.',

  // Deck Plans
  'boat.deck.title': 'Explore Your Space',
  'boat.deck.subtitle': 'From your cabin to the sun deck, every corner of the Quetzal is built for your comfort and your curiosity.',

  // Specs (unchanged)
  'boat.specs.title': 'Vessel Specifications',
  'boat.specs.length': 'Length',
  'boat.specs.lengthVal': '120 ft (36.5 m)',
  'boat.specs.beam': 'Beam',
  'boat.specs.beamVal': '24 ft (7.3 m)',
  'boat.specs.guests': 'Guests',
  'boat.specs.guestsVal': 'Up to 20',
  'boat.specs.cabins': 'Cabins',
  'boat.specs.cabinsVal': '10 Private',
  'boat.specs.speed': 'Cruising Speed',
  'boat.specs.speedVal': '10 knots',
  'boat.specs.compressor': 'Compressors',
  'boat.specs.compressorVal': '2x Bauer',

  // Comfort / Life Onboard
  'boat.comfort.title': 'Life Onboard',
  'boat.comfort.subtitle': 'Everything you need to focus on what matters — your dives, your rest, and your connection with the sea.',
  'boat.comfort.dining': 'Gourmet Dining',
  'boat.comfort.diningDesc': 'Your meals are prepared fresh daily with local seafood and international cuisine, paired with fine wines and cold beverages.',
  'boat.comfort.sunDeck': 'Sun Deck & Lounge',
  'boat.comfort.sunDeckDesc': 'Your top deck retreat: lounge chairs, shade areas, and the perfect spot for sunset cocktails between dives.',
  'boat.comfort.cabin': 'Private Cabins',
  'boat.comfort.cabinDesc': 'Your cabin features air conditioning, private bathroom, and ample storage for your dive gear.',
  'boat.comfort.dive': 'Dive Platform',
  'boat.comfort.diveDesc': 'Your purpose-built dive deck with individual gear stations, camera rinse tanks, and warm showers.',

  // Gallery
  'boat.gallery.title': 'Your Space on the Quetzal',
  'boat.gallery.subtitle': 'Every corner is designed with you in mind — explore the staterooms, interiors, and decks that will become your home.',
  'boat.gallery.staterooms': 'Staterooms',
  'boat.gallery.interior': 'Interior',
  'boat.gallery.altStateroom': 'Comfortable stateroom aboard the Quetzal',
  'boat.gallery.altInterior': 'Shared interior space aboard the Quetzal',

  // CTA
  'boat.cta': 'Ready to Come Aboard?',
  'boat.ctaButton': 'Start Planning Your Trip',
  'boat.socialProof': '500+ divers have called the Quetzal home',
}

describe('OurBoatPage', () => {
  beforeEach(() => {
    translationStore = { ...fullBoatTranslations }
  })

  // ── Test 1: 7-section render order ──────────────────────────────────────
  it('renders all 7 sections in correct order: Hero → Your Floating Home → Deck Plans → Specs → Life Onboard → Gallery → CTA', () => {
    render(React.createElement(OurBoatPage))

    // Verify each section's key text appears
    const heroHeading = screen.getByText('Step Aboard Your Adventure')
    const storyHeading = screen.getByText('Your Floating Home')
    const deckHeading = screen.getByText('Explore Your Space')
    const specsHeading = screen.getByText('Vessel Specifications')
    const comfortHeading = screen.getByText('Life Onboard')
    const galleryHeading = screen.getByText('Your Space on the Quetzal')
    const ctaHeading = screen.getByText('Ready to Come Aboard?')

    // All must be present
    expect(heroHeading).toBeInTheDocument()
    expect(storyHeading).toBeInTheDocument()
    expect(deckHeading).toBeInTheDocument()
    expect(specsHeading).toBeInTheDocument()
    expect(comfortHeading).toBeInTheDocument()
    expect(galleryHeading).toBeInTheDocument()
    expect(ctaHeading).toBeInTheDocument()

    // Verify order via compareDocumentPosition
    const following = Node.DOCUMENT_POSITION_FOLLOWING

    expect(heroHeading.compareDocumentPosition(storyHeading) & following).toBe(following)
    expect(storyHeading.compareDocumentPosition(deckHeading) & following).toBe(following)
    expect(deckHeading.compareDocumentPosition(specsHeading) & following).toBe(following)
    expect(specsHeading.compareDocumentPosition(comfortHeading) & following).toBe(following)
    expect(comfortHeading.compareDocumentPosition(galleryHeading) & following).toBe(following)
    expect(galleryHeading.compareDocumentPosition(ctaHeading) & following).toBe(following)
  })

  // ── Test 2: Hero Image alt uses boat.heroImageAlt ───────────────────────
  it('Hero image alt attribute uses boat.heroImageAlt key, not hardcoded text', () => {
    render(React.createElement(OurBoatPage))

    const images = document.querySelectorAll('img')
    const heroImg = Array.from(images).find(
      (img) => img.src.includes('quetzal-navegando')
    ) as HTMLImageElement | undefined
    expect(heroImg).toBeDefined()
    expect(heroImg!.alt).toBe('Quetzal sailing through the Pacific at sunrise')
  })

  // ── Test 3: Deck Plans heading and description use translation keys ─────
  it('Deck Plans heading uses boat.deck.title and description uses boat.deck.subtitle', () => {
    render(React.createElement(OurBoatPage))

    expect(screen.getByText('Explore Your Space')).toBeInTheDocument()
    expect(screen.getByText(/From your cabin to the sun deck/)).toBeInTheDocument()
  })

  // ── Test 4: CTA uses boat.cta / boat.ctaButton / boat.socialProof ──────
  it('CTA renders boat.cta heading, boat.ctaButton → /contacto, boat.socialProof; zero dest.bookNow or destination.cta', () => {
    render(React.createElement(OurBoatPage))

    // Heading from boat.cta
    expect(screen.getByText('Ready to Come Aboard?')).toBeInTheDocument()

    // Social proof from boat.socialProof
    expect(screen.getByText('500+ divers have called the Quetzal home')).toBeInTheDocument()

    // Button from boat.ctaButton, links to /contacto
    const ctaLink = screen.getByRole('link', { name: /Start Planning Your Trip/i })
    expect(ctaLink).toBeInTheDocument()
    expect(ctaLink).toHaveAttribute('href', '/contacto')
    expect(screen.getByTestId('arrow-right')).toBeInTheDocument()

    // ZERO references to destination keys
    expect(screen.queryByText('Book This Trip')).not.toBeInTheDocument()
    expect(screen.queryByText('Ask Our Travel Expert')).not.toBeInTheDocument()
  })

  // ── Test 5: Social proof renders from boat.socialProof ──────────────────
  it('Social proof text renders from boat.socialProof between CTA heading and button', () => {
    render(React.createElement(OurBoatPage))

    const ctaHeading = screen.getByText('Ready to Come Aboard?')
    const socialProof = screen.getByText('500+ divers have called the Quetzal home')
    const ctaButton = screen.getByRole('link', { name: /Start Planning Your Trip/i })

    const following = Node.DOCUMENT_POSITION_FOLLOWING

    // Social proof comes after heading
    expect(ctaHeading.compareDocumentPosition(socialProof) & following).toBe(following)
    // Button comes after social proof
    expect(socialProof.compareDocumentPosition(ctaButton) & following).toBe(following)
  })

  // ── Test 6: Gallery Image alt attributes use category keys ──────────────
  it('Gallery Image alt attributes use boat.gallery.altStateroom or boat.gallery.altInterior keys', () => {
    render(React.createElement(OurBoatPage))

    const galleryImages = document.querySelectorAll('img')
    const cabinImages = Array.from(galleryImages).filter(
      (img) => (img as HTMLImageElement).src.includes('cabin')
    ) as HTMLImageElement[]
    const interiorImages = Array.from(galleryImages).filter(
      (img) => (img as HTMLImageElement).src.includes('Interior')
    ) as HTMLImageElement[]

    // All stateroom images should use altStateroom key
    for (const img of cabinImages) {
      expect(img.alt).toBe('Comfortable stateroom aboard the Quetzal')
    }

    // All interior images should use altInterior key
    for (const img of interiorImages) {
      expect(img.alt).toBe('Shared interior space aboard the Quetzal')
    }
  })
})
