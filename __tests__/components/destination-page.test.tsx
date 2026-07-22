import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { DestinationPage } from '@/components/destination-page'

// ── Mutable translation store ──────────────────────────────────────────────
let translationStore: Record<string, string> = {}

// ── Mock next/image ────────────────────────────────────────────────────────
vi.mock('next/image', () => ({
  default: ({ src, alt, fill, priority, className, width, height, ...props }: Record<string, unknown>) =>
    React.createElement('img', {
      src,
      alt,
      'data-fill': fill ? 'true' : undefined,
      'data-priority': priority ? 'true' : undefined,
      className,
      width: width ? Number(width) : undefined,
      height: height ? Number(height) : undefined,
      ...props,
    }),
}))

// ── Mock next/link ─────────────────────────────────────────────────────────
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) =>
    React.createElement('a', { href, ...props }, children),
}))

// ── Mock lucide-react ────────────────────────────────────────────────────────
vi.mock('lucide-react', () => ({
  ArrowRight: () => React.createElement('span', { 'data-testid': 'arrow-right' }),
  Fish: () => React.createElement('span', { 'data-testid': 'icon-fish' }),
  Waves: () => React.createElement('span', { 'data-testid': 'icon-waves' }),
  Star: () => React.createElement('span', { 'data-testid': 'icon-star' }),
  Compass: () => React.createElement('span', { 'data-testid': 'icon-compass' }),
  Shell: () => React.createElement('span', { 'data-testid': 'icon-shell' }),
  Sparkles: () => React.createElement('span', { 'data-testid': 'icon-sparkles' }),
  Anchor: () => React.createElement('span', { 'data-testid': 'icon-anchor' }),
}))

// ── Mock useLanguage ───────────────────────────────────────────────────────
vi.mock('@/contexts/language-context', () => ({
  useLanguage: () => ({
    language: 'en' as const,
    setLanguage: vi.fn(),
    t: (key: string) => {
      if (key in translationStore) return translationStore[key]
      return key
    },
  }),
  LanguageProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}))

// ── Full Socorro mock translations ─────────────────────────────────────────
const fullSocorroTranslations: Record<string, string> = {
  'dest.hero': 'Explore Our',
  'socorro.title': 'Socorro Islands',
  'socorro.subtitle': 'The Galápagos of Mexico',
  'socorro.description1': 'Description paragraph 1 for Socorro.',
  'socorro.description2': 'Description paragraph 2 for Socorro.',
  'socorro.highlights': 'What You Will See',
  'socorro.h1': 'Giant Oceanic Mantas',
  'socorro.h1d': 'Mantas glide gracefully.',
  'socorro.h2': 'Hammerhead Schools',
  'socorro.h2d': 'Hundreds of hammerheads.',
  'socorro.h3': 'Humpback Whales',
  'socorro.h3d': 'Hear their songs underwater.',
  'socorro.h4': 'Dolphins & Large Pelagics',
  'socorro.h4d': 'Playful dolphins approach divers.',
  'socorro.h5': 'Tiger & Silky Sharks',
  'socorro.h5d': 'Oceanic predators patrol.',
  'socorro.h6': 'Whale Sharks & False Orcas',
  'socorro.h6d': 'Whale sharks visit Nov, Dec, May.',
  'socorro.diveSites.title': 'Dive Sites',
  'socorro.diveSites.sanBenedicto.boiler.name': 'The Boiler',
  'socorro.diveSites.sanBenedicto.boiler.description': 'A submerged seamount.',
  'socorro.diveSites.sanBenedicto.boiler.fauna': 'Mantas, dolphins, tuna',
  'socorro.diveSites.sanBenedicto.canyon.name': 'The Canyon',
  'socorro.diveSites.sanBenedicto.canyon.description': 'Large mantas wander.',
  'socorro.diveSites.sanBenedicto.canyon.fauna': 'Giant mantas, humpback songs',
  'socorro.diveSites.rocaPartida.rocaPartida.name': 'Roca Partida',
  'socorro.diveSites.rocaPartida.rocaPartida.description': 'A huge reef.',
  'socorro.diveSites.rocaPartida.rocaPartida.fauna': 'Hammerheads, tiger sharks',
  'socorro.diveSites.socorroIsland.caboPearce.name': 'Cabo Pearce',
  'socorro.diveSites.socorroIsland.caboPearce.description': 'Seamount off Socorro Island.',
  'socorro.diveSites.socorroIsland.caboPearce.fauna': 'Dolphins, mantas, humpbacks',
  'socorro.calendar.jan': 'Humpback whales, mantas',
  'socorro.calendar.feb': 'Humpback whales (peak)',
  'socorro.calendar.mar': 'Humpback whales (peak), mantas',
  'socorro.calendar.apr': 'Humpback whales, mantas',
  'socorro.calendar.may': 'Mantas, whale sharks',
  'socorro.calendar.jun': 'Giant mantas, hammerheads',
  'socorro.calendar.jul': 'Giant mantas, dolphins',
  'socorro.calendar.nov': 'Mantas, whale sharks',
  'socorro.calendar.dec': 'Mantas, whale sharks',
  'socorro.conservation.unesco': 'UNESCO World Heritage Site',
  'socorro.conservation.protectedArea': 'Revillagigedo Archipelago National Park',
  'socorro.conservation.designation': 'Designated in 2016',
  'socorro.gallery.title': 'Gallery',
  'socorro.gallery.images': '["/images/panoramicas/Isla Socorro.webp","/images/panoramicas/Manta el Boiler.webp","/images/panoramicas/Cabo Pearce.webp","/images/panoramicas/Clariones.webp"]',
  'dest.bookNow': 'Book This Trip',
  'destination.cta': 'Ask Our Travel Expert',
  'dest.calendar': 'Seasonal Wildlife Calendar',
  'gallery.promise': 'This is what awaits you',
  'gallery.scrollHint': 'Scroll to discover',
}

// ── Full Cortez mock translations ──────────────────────────────────────────
const fullCortezTranslations: Record<string, string> = {
  'dest.hero': 'Explore Our',
  'cortez.title': 'Sea of Cortez',
  'cortez.subtitle': 'The Aquarium of the World',
  'cortez.description1': 'Description paragraph 1 for Cortez.',
  'cortez.description2': 'Description paragraph 2 for Cortez.',
  'cortez.highlights': 'What You Will See',
  'cortez.h1': 'Sea Lion Colonies',
  'cortez.h1d': 'Play with curious sea lions.',
  'cortez.h2': 'Whale Sharks',
  'cortez.h2d': 'Swim alongside whale sharks.',
  'cortez.h3': 'Colorful Reef Life',
  'cortez.h3d': 'Vibrant nudibranchs and moray eels.',
  'cortez.h4': 'Stunning Topside',
  'cortez.h4d': 'Dramatic desert landscapes.',
  'cortez.h5': 'Mobula Rays',
  'cortez.h5d': 'Mobula rays gather by thousands.',
  'cortez.h6': 'Macro Life & Wrecks',
  'cortez.h6d': 'Bluespotted Jawfish, wrecks.',
  'cortez.diveSites.title': 'Dive Sites',
  'cortez.diveSites.laPazBay.losIslotes.name': 'Los Islotes',
  'cortez.diveSites.laPazBay.losIslotes.description': 'Sea lion colony.',
  'cortez.diveSites.laPazBay.losIslotes.fauna': '400+ sea lions',
  'cortez.diveSites.laPazBay.laPazBay.name': 'La Paz Bay',
  'cortez.diveSites.laPazBay.laPazBay.description': 'Whale shark feeding grounds.',
  'cortez.diveSites.laPazBay.laPazBay.fauna': 'Whale sharks',
  'cortez.diveSites.laPazBay.swanneeReef.name': 'Swannee Reef',
  'cortez.diveSites.laPazBay.swanneeReef.description': 'Fish paradise.',
  'cortez.diveSites.laPazBay.swanneeReef.fauna': 'Goatfish, blennies',
  'cortez.diveSites.laPazBay.salvatierra.name': 'Salvatierra Wreck',
  'cortez.diveSites.laPazBay.salvatierra.description': '80m ferry wreck.',
  'cortez.diveSites.laPazBay.salvatierra.fauna': 'Large grunts, angelfish',
  'cortez.diveSites.laPazBay.elCorralito.name': 'El Corralito',
  'cortez.diveSites.laPazBay.elCorralito.description': 'Giant jawfishes.',
  'cortez.diveSites.laPazBay.elCorralito.fauna': 'Giant jawfishes',
  'cortez.diveSites.northernIslands.elBajo.name': 'El Bajo',
  'cortez.diveSites.northernIslands.elBajo.description': 'Three seamounts.',
  'cortez.diveSites.northernIslands.elBajo.fauna': 'Hammerheads, marlin',
  'cortez.diveSites.northernIslands.whaleIsland.name': 'Whale Island',
  'cortez.diveSites.northernIslands.whaleIsland.description': 'Whale-shaped island.',
  'cortez.diveSites.northernIslands.whaleIsland.fauna': 'Cortez angelfish',
  'cortez.diveSites.northernIslands.sanFrancisquito.name': 'San Francisquito',
  'cortez.diveSites.northernIslands.sanFrancisquito.description': 'Liveaboard-only site.',
  'cortez.diveSites.northernIslands.sanFrancisquito.fauna': 'Calm sea lions',
  'cortez.diveSites.eastCape.lasAnimas.name': 'Las Ánimas',
  'cortez.diveSites.eastCape.lasAnimas.description': 'Giant stingrays glide.',
  'cortez.diveSites.eastCape.lasAnimas.fauna': 'Stingrays, hammerheads',
  'cortez.diveSites.eastCape.caboPulmo.name': 'Cabo Pulmo / Gordo Banks',
  'cortez.diveSites.eastCape.caboPulmo.description': 'Advanced drift dive.',
  'cortez.diveSites.eastCape.caboPulmo.fauna': 'Jacks, bull sharks',
  'cortez.calendar.aug': 'Whale sharks, mobula rays',
  'cortez.calendar.sep': 'Whale sharks, mobula rays (peak)',
  'cortez.calendar.oct': 'Whale sharks, mobula rays (peak)',
  'cortez.calendar.nov': 'Sea lions, hammerheads',
  'cortez.conservation.unesco': 'UNESCO World Heritage Site',
  'cortez.conservation.protectedArea': 'Islands and Protected Areas of the Gulf of California',
  'cortez.conservation.designation': 'Designated in 2005',
  'cortez.gallery.title': 'Gallery',
  'cortez.gallery.images': '["/images/panoramicas/PuntaTosca.webp","/images/panoramicas/loreto-magdalena-bay.webp"]',
  'dest.bookNow': 'Book This Trip',
  'destination.cta': 'Ask Our Travel Expert',
  'dest.calendar': 'Seasonal Wildlife Calendar',
  'gallery.promise': 'This is what awaits you',
  'gallery.scrollHint': 'Scroll to discover',
}

// ── Full Magbay mock translations (no diveSites!) ──────────────────────────
const fullMagbayTranslations: Record<string, string> = {
  'dest.hero': 'Explore Our',
  'magbay.title': 'Bahía Magdalena',
  'magbay.subtitle': 'Where Whales Meet the Desert',
  'magbay.description1': 'Description paragraph 1 for Magbay.',
  'magbay.description2': 'Description paragraph 2 for Magbay.',
  'magbay.highlights': 'What You Will See',
  'magbay.h1': 'Gray Whale Encounters',
  'magbay.h1d': 'Get within arm\'s reach of whales.',
  'magbay.h2': 'Mangrove Channels',
  'magbay.h2d': 'Kayak through pristine channels.',
  'magbay.h3': 'Desert Wildlife',
  'magbay.h3d': 'Spot coyotes and osprey.',
  'magbay.h4': 'Socorro Diving',
  'magbay.h4d': 'Mantas, sharks, dolphins.',
  'magbay.h5': 'Mexico Sardine Run',
  'magbay.h5d': 'Pacific explodes with life.',
  'magbay.h6': '14-Day Expedition',
  'magbay.h6d': 'Two worlds in one trip.',
  'magbay.calendar.jan': 'Gray whales (peak)',
  'magbay.calendar.feb': 'Gray whales (peak)',
  'magbay.calendar.mar': 'Gray whales (peak)',
  'magbay.calendar.apr': 'Gray whales (final weeks)',
  'magbay.calendar.oct': 'Sardine run begins',
  'magbay.calendar.nov': 'Sardine run (peak)',
  'magbay.calendar.dec': 'Sardine run, bait balls',
  'magbay.conservation.unesco': 'UNESCO Whale Sanctuary',
  'magbay.conservation.protectedArea': 'Bahía Magdalena Protected Lagoon',
  'magbay.conservation.designation': 'Part of the UNESCO World Heritage Site',
  'magbay.gallery.title': 'Gallery',
  'magbay.gallery.images': '["/images/panoramicas/loreto-magdalena-bay.webp"]',
  'dest.bookNow': 'Book This Trip',
  'destination.cta': 'Ask Our Travel Expert',
  'dest.calendar': 'Seasonal Wildlife Calendar',
  'gallery.promise': 'This is what awaits you',
  'gallery.scrollHint': 'Scroll to discover',
}

describe('DestinationPage', () => {
  beforeEach(() => {
    translationStore = { ...fullSocorroTranslations }
  })

  // ── Test 1: 8-section render order ─────────────────────────────────────
  it('renders all 8 sections in correct order for socorro prefix', () => {
    render(<DestinationPage prefix="socorro" />)

    // Verify each section's key text appears
    const heroTitle = screen.getByText('Socorro Islands')
    // "The Galápagos of Mexico" appears in both hero subtitle AND CTA subtitle
    const heroSubtitles = screen.getAllByText('The Galápagos of Mexico')
    const desc1 = screen.getByText(/Description paragraph 1/)
    const desc2 = screen.getByText(/Description paragraph 2/)
    const highlightsHeading = screen.getByText('What You Will See')
    const diveSitesHeading = screen.getByText('Dive Sites')
    const calendarHeading = screen.getByText('Seasonal Wildlife Calendar')
    const galleryHeading = screen.getByText('This is what awaits you')
    const conservationText = screen.getByText('UNESCO World Heritage Site')
    const ctaHeading = screen.getByText('Book This Trip')

    // All must be present
    expect(heroTitle).toBeInTheDocument()
    expect(heroSubtitles.length).toBeGreaterThanOrEqual(2)
    expect(desc1).toBeInTheDocument()
    expect(desc2).toBeInTheDocument()
    expect(highlightsHeading).toBeInTheDocument()
    expect(diveSitesHeading).toBeInTheDocument()
    expect(calendarHeading).toBeInTheDocument()
    expect(galleryHeading).toBeInTheDocument()
    expect(conservationText).toBeInTheDocument()
    expect(ctaHeading).toBeInTheDocument()

    // Verify order via compareDocumentPosition
    const following = Node.DOCUMENT_POSITION_FOLLOWING

    // Use heroSubtitles[0] for order check (the first occurrence is in the Hero section)
    // Hero title < Highlights heading
    expect(heroTitle.compareDocumentPosition(highlightsHeading) & following).toBe(following)
    // Highlights < Dive Sites
    expect(highlightsHeading.compareDocumentPosition(diveSitesHeading) & following).toBe(following)
    // Dive Sites < Calendar
    expect(diveSitesHeading.compareDocumentPosition(calendarHeading) & following).toBe(following)
    // Calendar < Gallery
    expect(calendarHeading.compareDocumentPosition(galleryHeading) & following).toBe(following)
    // Gallery < Conservation
    expect(galleryHeading.compareDocumentPosition(conservationText) & following).toBe(following)
    // Conservation < CTA
    expect(conservationText.compareDocumentPosition(ctaHeading) & following).toBe(following)
  })

  // ── Test 2: 6 highlights render when h5/h6 keys exist ──────────────────
  it('renders 6 highlight cards when h5 and h6 translation keys exist', () => {
    render(<DestinationPage prefix="socorro" />)

    expect(screen.getByText('Giant Oceanic Mantas')).toBeInTheDocument()
    expect(screen.getByText('Hammerhead Schools')).toBeInTheDocument()
    expect(screen.getByText('Humpback Whales')).toBeInTheDocument()
    expect(screen.getByText('Dolphins & Large Pelagics')).toBeInTheDocument()
    expect(screen.getByText('Tiger & Silky Sharks')).toBeInTheDocument()
    expect(screen.getByText('Whale Sharks & False Orcas')).toBeInTheDocument()
  })

  // ── Test 3: 4 highlights when h5/h6 keys are missing ───────────────────
  it('renders only 4 highlight cards when h5 and h6 keys are missing', () => {
    // Use a reduced set: keep h1-h4 but remove h5/h6
    translationStore = {
      ...fullSocorroTranslations,
    }
    delete translationStore['socorro.h5']
    delete translationStore['socorro.h5d']
    delete translationStore['socorro.h6']
    delete translationStore['socorro.h6d']

    render(<DestinationPage prefix="socorro" />)

    expect(screen.getByText('Giant Oceanic Mantas')).toBeInTheDocument()
    expect(screen.getByText('Hammerhead Schools')).toBeInTheDocument()
    expect(screen.getByText('Humpback Whales')).toBeInTheDocument()
    expect(screen.getByText('Dolphins & Large Pelagics')).toBeInTheDocument()

    // h5 and h6 should NOT be in the DOM
    expect(screen.queryByText('Tiger & Silky Sharks')).not.toBeInTheDocument()
    expect(screen.queryByText('Whale Sharks & False Orcas')).not.toBeInTheDocument()
  })

  // ── Test 4: Calendar only renders months with translation keys ─────────
  it('calendar only renders months that have translation keys', () => {
    render(<DestinationPage prefix="socorro" />)

    // Socorro has jan, feb, mar, apr, may, jun, jul, nov, dec (9 months)
    // Aug, Sep, Oct should NOT render
    const monthAbbrs = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Nov', 'Dec']

    for (const month of monthAbbrs) {
      // Month cards contain the capitalized abbreviation as heading
      const headingElements = screen.getAllByText(month, { exact: false })
      // At least one element with this month text should exist
      expect(headingElements.length).toBeGreaterThan(0)
    }

    // Months without keys should not render
    expect(screen.queryByText('Aug')).not.toBeInTheDocument()
    expect(screen.queryByText('Sep')).not.toBeInTheDocument()
    expect(screen.queryByText('Oct')).not.toBeInTheDocument()
  })

  // ── Test 5: Gallery renders images from valid JSON ─────────────────────
  it('renders gallery images from valid JSON translation value', () => {
    render(<DestinationPage prefix="socorro" />)

    // Gallery images use next/image with fill — query by alt text instead
    const images = document.querySelectorAll('img')
    const galleryImages = Array.from(images).filter(
      (img) => (img as HTMLImageElement).src.includes('panoramicas')
    )
    expect(galleryImages.length).toBeGreaterThanOrEqual(1)
  })

  // ── Test 6: Gallery gracefully handles invalid JSON ────────────────────
  it('gracefully skips gallery when JSON is invalid (no crash)', () => {
    translationStore = {
      ...fullSocorroTranslations,
      'socorro.gallery.images': 'this is not valid json',
    }

    // Should not throw
    expect(() => render(<DestinationPage prefix="socorro" />)).not.toThrow()

    // Gallery images from panoramicas should not render
    const images = screen.getAllByRole('img')
    const galleryImages = images.filter(
      (img) => (img as HTMLImageElement).src.includes('panoramicas')
    )
    expect(galleryImages.length).toBe(0)
  })

  // ── Test 7: DiveSites suppressed when diveSites.title is missing ───────
  it('suppresses DiveSites section when magbay has no diveSites.title key', () => {
    translationStore = { ...fullMagbayTranslations }

    render(<DestinationPage prefix="magbay" />)

    // "Dive Sites" should NOT appear
    expect(screen.queryByText('Dive Sites')).not.toBeInTheDocument()

    // But other sections should still render
    expect(screen.getByText('Bahía Magdalena')).toBeInTheDocument()
    expect(screen.getByText('What You Will See')).toBeInTheDocument()
    expect(screen.getByText('UNESCO Whale Sanctuary')).toBeInTheDocument()
  })

  // ── Test 8: Hero image src is correct per prefix ──────────────────────
  it('renders correct hero image src for each prefix', () => {
    const { unmount: unmountSocorro } = render(<DestinationPage prefix="socorro" />)
    const heroImages = screen.getAllByRole('img')
    const heroImg = heroImages.find(
      (img) => (img as HTMLImageElement).src.includes('images.unsplash.com')
    ) as HTMLImageElement
    expect(heroImg).toBeDefined()
    expect(heroImg.src).toContain('photo-1682687982501')
    unmountSocorro()

    translationStore = { ...fullCortezTranslations }
    const { unmount: unmountCortez } = render(<DestinationPage prefix="cortez" />)
    const cortezHero = screen.getAllByRole('img').find(
      (img) => (img as HTMLImageElement).src.includes('images.unsplash.com')
    ) as HTMLImageElement
    expect(cortezHero.src).toContain('photo-1507525428034')
    unmountCortez()

    translationStore = { ...fullMagbayTranslations }
    render(<DestinationPage prefix="magbay" />)
    const magbayHero = screen.getAllByRole('img').find(
      (img) => (img as HTMLImageElement).src.includes('images.unsplash.com')
    ) as HTMLImageElement
    expect(magbayHero.src).toContain('photo-1568430462989')
  })

  // ── Test 9: CTA button links to /contacto ─────────────────────────────
  it('CTA button links to /contacto', () => {
    render(<DestinationPage prefix="socorro" />)

    const ctaLink = screen.getByRole('link', { name: /Ask Our Travel Expert/i })
    expect(ctaLink).toBeInTheDocument()
    expect(ctaLink).toHaveAttribute('href', '/contacto')
    // ArrowRight icon should be present
    expect(screen.getByTestId('arrow-right')).toBeInTheDocument()
  })

  // ── Test 10: Each section heading renders from translation ─────────────
  it('each section heading renders from its translation key', () => {
    translationStore = { ...fullCortezTranslations }
    render(<DestinationPage prefix="cortez" />)

    // Hero
    expect(screen.getByText('Sea of Cortez')).toBeInTheDocument()
    // Subtitle appears in both hero and CTA sections
    const cortezSubtitles = screen.getAllByText('The Aquarium of the World')
    expect(cortezSubtitles.length).toBeGreaterThanOrEqual(2)

    // Highlights
    expect(screen.getByText('What You Will See')).toBeInTheDocument()
    expect(screen.getByText('Sea Lion Colonies')).toBeInTheDocument()

    // Dive Sites
    expect(screen.getByText('Dive Sites')).toBeInTheDocument()
    expect(screen.getByText('Los Islotes')).toBeInTheDocument()

    // Gallery intro
    expect(screen.getByText('This is what awaits you')).toBeInTheDocument()

    // Conservation
    expect(screen.getByText('UNESCO World Heritage Site')).toBeInTheDocument()

    // CTA
    expect(screen.getByText('Book This Trip')).toBeInTheDocument()
  })

  // ── Test 11: Cortez renders its specific dive zones ────────────────────
  it('renders Cortez dive sites with correct zone headings', () => {
    translationStore = { ...fullCortezTranslations }
    render(<DestinationPage prefix="cortez" />)

    // Zone badges appear on each site card
    const laPazElements = screen.getAllByText('La Paz Bay')
    expect(laPazElements.length).toBeGreaterThanOrEqual(2)
    // Northern Islands and East Cape appear as badges on multiple cards
    const northernElements = screen.getAllByText('Northern Islands')
    expect(northernElements.length).toBeGreaterThanOrEqual(1)
    const eastCapeElements = screen.getAllByText('East Cape')
    expect(eastCapeElements.length).toBeGreaterThanOrEqual(1)

    // Specific site names
    expect(screen.getByText('Los Islotes')).toBeInTheDocument()
    expect(screen.getByText('El Bajo')).toBeInTheDocument()
    expect(screen.getByText('Las Ánimas')).toBeInTheDocument()
  })

  // ── Test 12: Conservation section renders UNESCO info ──────────────────
  it('renders conservation section with UNESCO badge and protected area info', () => {
    render(<DestinationPage prefix="socorro" />)

    expect(screen.getByText('UNESCO World Heritage Site')).toBeInTheDocument()
    expect(screen.getByText('Revillagigedo Archipelago National Park')).toBeInTheDocument()
    expect(screen.getByText('Designated in 2016')).toBeInTheDocument()
  })
})
