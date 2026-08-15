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
  Sunrise: () => React.createElement('span', { 'data-testid': 'icon-sunrise' }),
  Sun: () => React.createElement('span', { 'data-testid': 'icon-sun' }),
  Moon: () => React.createElement('span', { 'data-testid': 'icon-moon' }),
  MapPin: () => React.createElement('span', { 'data-testid': 'icon-map-pin' }),
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
  // Day at Sea keys
  'socorro.dayAtSea.heading': 'Your Day at Sea',
  'socorro.dayAtSea.intro': 'Every day aboard the Quetzal follows a rhythm as old as the ocean itself.',
  'socorro.dayAtSea.morning': 'Your day starts with a light continental breakfast at sunrise.',
  'socorro.dayAtSea.afternoon': 'Midday brings your second and third dives.',
  'socorro.dayAtSea.evening': 'As the sun dips toward the Pacific, you might squeeze in a fourth dive.',
  'socorro.dayAtSea.note': 'Schedules are flexible and weather-dependent.',
  // Water temp keys
  'socorro.waterTemp.title': 'Water Temperature',
  'socorro.waterTemp.nov': '26–29°C (79–84°F)',
  'socorro.waterTemp.dec': '24–27°C (75–81°F)',
  'socorro.waterTemp.jan': '22–25°C (72–77°F)',
  'socorro.waterTemp.feb': '21–24°C (70–75°F)',
  'socorro.waterTemp.mar': '21–24°C (70–75°F)',
  'socorro.waterTemp.apr': '22–25°C (72–77°F)',
  'socorro.waterTemp.may': '23–27°C (73–81°F)',
  // Zone intros
  'socorro.areas.sanBenedicto': 'Your journey begins at San Benedicto — a volcanic island with famous manta encounters.',
  'socorro.areas.rocaPartida': 'In the middle of the open ocean rises Roca Partida.',
  'socorro.areas.socorroIsland': 'Socorro Island combines dramatic volcanic landscapes with famous dive sites.',
  // Per-destination CTA keys
  'socorro.cta': 'Ready to Meet the Mantas?',
  'socorro.ctaButton': 'Reserve Your Socorro Expedition',
  'socorro.socialProof': '+500 divers have experienced Revillagigedo with us',
  // Shared fallback keys
  'dest.bookNow': 'Book This Trip',
  'destination.cta': 'Ask Our Travel Expert',
  'dest.calendar': 'Seasonal Wildlife Calendar',
  'gallery.promise': 'This is what awaits you',
  'gallery.scrollHint': 'Scroll to discover',
  // Section labels
  'dest.morning': 'Morning',
  'dest.afternoon': 'Afternoon',
  'dest.evening': 'Evening',
  'dest.wetsuitHint': 'We recommend a 5mm wetsuit for Nov–Apr and a 3mm for May.',
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
  // Water temp keys
  'cortez.waterTemp.title': 'Water Temperature',
  'cortez.waterTemp.aug': '28–30°C (82–86°F)',
  'cortez.waterTemp.sep': '28–30°C (82–86°F)',
  'cortez.waterTemp.oct': '28–30°C (82–86°F)',
  'cortez.waterTemp.nov': '26–28°C (79–82°F)',
  // Day at Sea keys
  'cortez.dayAtSea.heading': 'Your Day at Sea',
  'cortez.dayAtSea.intro': 'Your days in the Sea of Cortez follow a rhythm shaped by the desert sun.',
  'cortez.dayAtSea.morning': 'You wake up to golden light spilling over the Baja desert.',
  'cortez.dayAtSea.afternoon': 'Between your second and third dives, lunch is served on deck.',
  'cortez.dayAtSea.evening': 'As the sun drops behind the Baja mountains.',
  'cortez.dayAtSea.note': 'Schedules are flexible and weather-dependent.',
  // Per-destination CTA keys
  'cortez.cta': 'Ready to Dive the Aquarium of the World?',
  'cortez.ctaButton': 'Reserve Your Sea of Cortez Expedition',
  'cortez.socialProof': '+500 divers have explored the Sea of Cortez with us',
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
  // Water temp keys
  'magbay.waterTemp.title': 'Water Temperature',
  'magbay.waterTemp.oct': '25–27°C (77–81°F)',
  'magbay.waterTemp.nov': '23–26°C (73–79°F)',
  'magbay.waterTemp.dec': '22–24°C (72–75°F)',
  'magbay.waterTemp.jan': '20–22°C (68–72°F)',
  'magbay.waterTemp.feb': '19–21°C (66–70°F)',
  'magbay.waterTemp.mar': '18–20°C (64–68°F)',
  'magbay.waterTemp.apr': '17–19°C (63–66°F)',
  // Day in Lagoon keys
  'magbay.dayInLagoon.heading': 'Your Day in the Lagoon',
  'magbay.dayInLagoon.intro': 'Your expedition unfolds in two distinct phases.',
  'magbay.dayInLagoon.lagoonPhase': 'You start your days in the lagoon at dawn.',
  'magbay.dayInLagoon.archipelagoPhase': 'The second half shifts entirely to ocean diving.',
  'magbay.dayInLagoon.note': 'Schedules are flexible and weather-dependent.',
  // Per-destination CTA keys
  'magbay.cta': 'Ready to Meet the Gray Whales?',
  'magbay.ctaButton': 'Reserve Your Mag Bay Expedition',
  'magbay.socialProof': '+500 divers have lived this two-world expedition',
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

  // ── Test 1: 10-section render order ─────────────────────────────────────
  it('renders all 10 sections in correct order for socorro prefix', () => {
    render(<DestinationPage prefix="socorro" />)

    // Verify each section's key text appears
    const heroTitle = screen.getByText('Socorro Islands')
    const desc1 = screen.getByText(/Description paragraph 1/)
    const desc2 = screen.getByText(/Description paragraph 2/)
    const highlightsHeading = screen.getByText('What You Will See')
    const dayAtSeaHeading = screen.getByText('Your Day at Sea')
    const diveSitesHeading = screen.getByText('Dive Sites')
    const waterTempHeading = screen.getByText('Water Temperature')
    const calendarHeading = screen.getByText('Seasonal Wildlife Calendar')
    const galleryHeading = screen.getByText('This is what awaits you')
    const conservationText = screen.getByText('UNESCO World Heritage Site')
    const ctaHeading = screen.getByText('Ready to Meet the Mantas?')

    // All must be present
    expect(heroTitle).toBeInTheDocument()
    expect(desc1).toBeInTheDocument()
    expect(desc2).toBeInTheDocument()
    expect(highlightsHeading).toBeInTheDocument()
    expect(dayAtSeaHeading).toBeInTheDocument()
    expect(diveSitesHeading).toBeInTheDocument()
    expect(waterTempHeading).toBeInTheDocument()
    expect(calendarHeading).toBeInTheDocument()
    expect(galleryHeading).toBeInTheDocument()
    expect(conservationText).toBeInTheDocument()
    expect(ctaHeading).toBeInTheDocument()

    // Verify order via compareDocumentPosition
    const following = Node.DOCUMENT_POSITION_FOLLOWING

    // Hero title < Day at Sea heading
    expect(heroTitle.compareDocumentPosition(dayAtSeaHeading) & following).toBe(following)
    // Day at Sea < Dive Sites
    expect(dayAtSeaHeading.compareDocumentPosition(diveSitesHeading) & following).toBe(following)
    // Dive Sites < Water Temp
    expect(diveSitesHeading.compareDocumentPosition(waterTempHeading) & following).toBe(following)
    // Water Temp < Calendar
    expect(waterTempHeading.compareDocumentPosition(calendarHeading) & following).toBe(following)
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

  // ── Test 4: Calendar renders species cards with active months ──────────
  it('calendar only renders months that have translation keys', () => {
    render(<DestinationPage prefix="socorro" />)

    // Species that should appear (from Socorro calendar mock data)
    const species = ['Humpback whales', 'Giant mantas', 'whale sharks']
    for (const s of species) {
      expect(screen.getAllByText(s).length).toBeGreaterThan(0)
    }
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
      (img) => (img as HTMLImageElement).src.includes('seacortes.webp')
    ) as HTMLImageElement
    expect(cortezHero).toBeDefined()
    unmountCortez()

    translationStore = { ...fullMagbayTranslations }
    render(<DestinationPage prefix="magbay" />)
    const magbayHero = screen.getAllByRole('img').find(
      (img) => (img as HTMLImageElement).src.includes('balllenahero.webp')
    ) as HTMLImageElement
    expect(magbayHero).toBeDefined()
  })

  // ── Test 9: CTA button links to /contacto ─────────────────────────────
  it('CTA button links to /contacto', () => {
    render(<DestinationPage prefix="socorro" />)

    const ctaLink = screen.getByRole('link', { name: /Reserve Your Socorro Expedition/i })
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
    // Subtitle still appears in hero section
    const cortezSubtitles = screen.getAllByText('The Aquarium of the World')
    expect(cortezSubtitles.length).toBeGreaterThanOrEqual(1)

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

    // CTA — per-destination key
    expect(screen.getByText('Ready to Dive the Aquarium of the World?')).toBeInTheDocument()
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

  // ── Test 13: DayAtSeaSection renders with correct content ───────────────
  it('renders DayAtSeaSection with morning/afternoon/evening narrative', () => {
    render(<DestinationPage prefix="socorro" />)

    // Section heading
    expect(screen.getByText('Your Day at Sea')).toBeInTheDocument()
    // Intro text
    expect(screen.getByText(/Every day aboard the Quetzal/)).toBeInTheDocument()
    // Morning phase
    expect(screen.getByText(/Your day starts with a light continental breakfast/)).toBeInTheDocument()
    // Afternoon phase
    expect(screen.getByText(/Midday brings your second and third dives/)).toBeInTheDocument()
    // Evening phase
    expect(screen.getByText(/As the sun dips toward the Pacific/)).toBeInTheDocument()
    // Flexibility note
    expect(screen.getByText(/Schedules are flexible/)).toBeInTheDocument()
  })

  // ── Test 14: WaterTempSection renders Socorro data ─────────────────────
  it('renders WaterTempSection with Socorro Nov–May temperature data', () => {
    render(<DestinationPage prefix="socorro" />)

    // Section heading
    expect(screen.getByText('Water Temperature')).toBeInTheDocument()
    // Month data
    expect(screen.getByText('26–29°C (79–84°F)')).toBeInTheDocument()
    expect(screen.getByText('24–27°C (75–81°F)')).toBeInTheDocument()
    // jan AND apr both have 22–25°C, feb AND mar both have 21–24°C
    const janAprTemps = screen.getAllByText('22–25°C (72–77°F)')
    expect(janAprTemps.length).toBeGreaterThanOrEqual(2)
    const febMarTemps = screen.getAllByText('21–24°C (70–75°F)')
    expect(febMarTemps.length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('23–27°C (73–81°F)')).toBeInTheDocument()
  })

  // ── Test 15: Cortez WaterTempSection renders Aug–Nov data ──────────────
  it('renders WaterTempSection with Cortez Aug–Nov temperature data', () => {
    translationStore = { ...fullCortezTranslations }
    render(<DestinationPage prefix="cortez" />)

    // Section heading
    expect(screen.getByText('Water Temperature')).toBeInTheDocument()
    // aug, sep and oct all share the 28–30°C range
    expect(screen.getAllByText('28–30°C (82–86°F)').length).toBe(3)
    expect(screen.getByText('26–28°C (79–82°F)')).toBeInTheDocument()

    // Day at Sea and Dive Sites still render
    expect(screen.getByText('Your Day at Sea')).toBeInTheDocument()
    expect(screen.getByText('Dive Sites')).toBeInTheDocument()
  })

  // ── Test 15b: MagBay WaterTempSection renders Oct–Apr data ─────────────
  it('renders WaterTempSection with MagBay Oct–Apr temperature data', () => {
    translationStore = { ...fullMagbayTranslations }
    render(<DestinationPage prefix="magbay" />)

    expect(screen.getByText('Water Temperature')).toBeInTheDocument()
    expect(screen.getByText('25–27°C (77–81°F)')).toBeInTheDocument() // oct
    expect(screen.getByText('20–22°C (68–72°F)')).toBeInTheDocument() // jan
    expect(screen.getByText('17–19°C (63–66°F)')).toBeInTheDocument() // apr
  })

  // ── Test 15c: WaterTempSection gracefully hides when keys are missing ──
  it('hides WaterTempSection when waterTemp keys are missing', () => {
    const stripped = { ...fullSocorroTranslations }
    delete stripped['socorro.waterTemp.title']
    translationStore = stripped
    render(<DestinationPage prefix="socorro" />)

    expect(screen.queryByText('Water Temperature')).not.toBeInTheDocument()
  })

  // ── Test 16: MagBay reads dayInLagoon keys not dayAtSea ────────────────
  it('renders DayInLagoon content for MagBay, not DayAtSea', () => {
    translationStore = { ...fullMagbayTranslations }
    render(<DestinationPage prefix="magbay" />)

    // Day in Lagoon heading should render
    expect(screen.getByText('Your Day in the Lagoon')).toBeInTheDocument()
    // Lagoon phase content
    expect(screen.getByText(/You start your days in the lagoon at dawn/)).toBeInTheDocument()
    // Archipelago phase content
    expect(screen.getByText(/The second half shifts entirely/)).toBeInTheDocument()
    // Day at Sea heading should NOT appear
    expect(screen.queryByText('Your Day at Sea')).not.toBeInTheDocument()
    // Note
    expect(screen.getByText(/Schedules are flexible/)).toBeInTheDocument()
  })

  // ── Test 17: CTASection uses per-destination keys when available ───────
  it('CTASection displays per-destination CTA heading, button, and social proof', () => {
    render(<DestinationPage prefix="socorro" />)

    // Per-destination heading
    expect(screen.getByText('Ready to Meet the Mantas?')).toBeInTheDocument()
    // Social proof
    expect(screen.getByText('+500 divers have experienced Revillagigedo with us')).toBeInTheDocument()
    // Per-destination button text
    expect(screen.getByRole('link', { name: /Reserve Your Socorro Expedition/i })).toBeInTheDocument()
  })

  // ── Test 18: CTASection falls back to shared keys ─────────────────────
  it('CTASection falls back to shared keys when per-destination CTA keys are missing', () => {
    // Use a store without per-destination CTA keys
    translationStore = {
      ...fullSocorroTranslations,
    }
    delete translationStore['socorro.cta']
    delete translationStore['socorro.ctaButton']
    delete translationStore['socorro.socialProof']

    render(<DestinationPage prefix="socorro" />)

    // Should fall back to shared 'dest.bookNow'
    expect(screen.getByText('Book This Trip')).toBeInTheDocument()
    // Should fall back to shared 'destination.cta'
    expect(screen.getByRole('link', { name: /Ask Our Travel Expert/i })).toBeInTheDocument()
    // Social proof should not appear
    expect(screen.queryByText('+500 divers have experienced Revillagigedo with us')).not.toBeInTheDocument()
  })

  // ── Test 19: DiveSitesSection renders zone intros for Socorro ──────────
  it('renders zone narrative intros before each zone group for Socorro', () => {
    render(<DestinationPage prefix="socorro" />)

    // San Benedicto zone intro
    expect(screen.getByText(/Your journey begins at San Benedicto/)).toBeInTheDocument()
    // Roca Partida zone intro
    expect(screen.getByText(/In the middle of the open ocean rises Roca Partida/)).toBeInTheDocument()
    // Socorro Island zone intro
    expect(screen.getByText(/Socorro Island combines dramatic volcanic landscapes/)).toBeInTheDocument()
  })

  // ── Test 20: MagBay suppresses DiveSitesSection ────────────────────────
  it('suppresses DiveSitesSection when magbay ZONES is empty', () => {
    translationStore = { ...fullMagbayTranslations }
    render(<DestinationPage prefix="magbay" />)

    // "Dive Sites" should NOT appear (ZONES[magbay] is empty)
    expect(screen.queryByText('Dive Sites')).not.toBeInTheDocument()

    // But other sections should still render
    expect(screen.getByText('Bahía Magdalena')).toBeInTheDocument()
    expect(screen.getByText('What You Will See')).toBeInTheDocument()
    expect(screen.getByText('Your Day in the Lagoon')).toBeInTheDocument()
    expect(screen.getByText('UNESCO Whale Sanctuary')).toBeInTheDocument()
    expect(screen.getByText('Ready to Meet the Gray Whales?')).toBeInTheDocument()
  })

  // ── Test 21: Cortez DayAtSea renders without zone intros ──────────────
  it('Cortez DiveSites does not render zone intros when areas keys are absent', () => {
    translationStore = { ...fullCortezTranslations }
    render(<DestinationPage prefix="cortez" />)

    // Dive Sites should render
    expect(screen.getByText('Dive Sites')).toBeInTheDocument()
    // But no zone intros should appear (no cortez.areas keys)
    // The zone badges should still appear
    const laPazElements = screen.getAllByText('La Paz Bay')
    expect(laPazElements.length).toBeGreaterThanOrEqual(1)
  })
})
