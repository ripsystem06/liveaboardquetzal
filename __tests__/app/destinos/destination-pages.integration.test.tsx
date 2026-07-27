import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'

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

// ── Mock lucide-react ─────────────────────────────────────────────────────
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

// ── Mock Navigation (imported by page wrappers, not under test) ───────────
vi.mock('@/components/navigation', () => ({
  Navigation: () => React.createElement('nav', { 'data-testid': 'navigation' }),
}))

// ── Mock Footer (imported by page wrappers, not under test) ───────────────
vi.mock('@/components/footer', () => ({
  Footer: () => React.createElement('footer', { 'data-testid': 'footer' }),
}))

// ── Full Socorro mock translations (same keys as unit tests) ──────────────
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
  'socorro.dayAtSea.intro': 'Every day aboard the Quetzal follows a rhythm.',
  'socorro.dayAtSea.morning': 'Your day starts with a light continental breakfast at sunrise.',
  'socorro.dayAtSea.afternoon': 'Midday brings your second and third dives.',
  'socorro.dayAtSea.evening': 'As the sun dips toward the Pacific.',
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
  'socorro.areas.sanBenedicto': 'Your journey begins at San Benedicto.',
  'socorro.areas.rocaPartida': 'In the middle of the open ocean rises Roca Partida.',
  'socorro.areas.socorroIsland': 'Socorro Island combines dramatic volcanic landscapes with dive sites.',
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
  'dest.wetsuitHint': 'We recommend a 5mm wetsuit.',
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
  // Day at Sea keys
  'cortez.dayAtSea.heading': 'Your Day at Sea',
  'cortez.dayAtSea.intro': 'Your days in the Sea of Cortez follow a rhythm.',
  'cortez.dayAtSea.morning': 'You wake up to golden light over the Baja desert.',
  'cortez.dayAtSea.afternoon': 'Between your second and third dives, lunch is served.',
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

// ── Full Magbay mock translations (no diveSites.title!) ────────────────────
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

// ── Lazy-load page components to pick up mocks ────────────────────────────
// Dynamic imports ensure the vi.mock calls above are registered before
// the page modules are loaded.
async function importSocorroPage() {
  const mod = await import('@/app/destinos/islas-socorro/page')
  return { default: mod.default as React.ComponentType }
}

async function importCortezPage() {
  const mod = await import('@/app/destinos/mar-de-cortes/page')
  return { default: mod.default as React.ComponentType }
}

async function importMagbayPage() {
  const mod = await import('@/app/destinos/bahia-magdalena/page')
  return { default: mod.default as React.ComponentType }
}

// ── Integration Tests ──────────────────────────────────────────────────────

describe('Destination Pages Integration', () => {
  describe('Socorro Page (islas-socorro)', () => {
    beforeEach(() => {
      translationStore = { ...fullSocorroTranslations }
    })

    it('renders all sections in the DOM', async () => {
      const { default: SocorroPage } = await importSocorroPage()
      render(<SocorroPage />)

      // Hero section
      expect(screen.getByText('Socorro Islands')).toBeInTheDocument()
      // "The Galápagos of Mexico" appears in hero subtitle
      const heroSubtitles = screen.getAllByText('The Galápagos of Mexico')
      expect(heroSubtitles.length).toBeGreaterThanOrEqual(1)

      // Description section
      expect(screen.getByText(/Description paragraph 1 for Socorro/)).toBeInTheDocument()
      expect(screen.getByText(/Description paragraph 2 for Socorro/)).toBeInTheDocument()

      // Highlights section
      expect(screen.getByText('What You Will See')).toBeInTheDocument()
      expect(screen.getByText('Giant Oceanic Mantas')).toBeInTheDocument()
      expect(screen.getByText('Tiger & Silky Sharks')).toBeInTheDocument()

      // Day at Sea section
      expect(screen.getByText('Your Day at Sea')).toBeInTheDocument()

      // Water Temp section
      expect(screen.getByText('Water Temperature')).toBeInTheDocument()

      // Dive Sites section
      expect(screen.getByText('Dive Sites')).toBeInTheDocument()
      expect(screen.getByText('The Boiler')).toBeInTheDocument()
      // "Roca Partida" appears on its site card
      const rocaPartidaElements = screen.getAllByText('Roca Partida')
      expect(rocaPartidaElements.length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('Cabo Pearce')).toBeInTheDocument()

      // Calendar section
      expect(screen.getByText('Seasonal Wildlife Calendar')).toBeInTheDocument()
      // Calendar months: jan, feb, mar, apr, may, jun, jul, nov, dec (9 months)
      const janElements = screen.getAllByText('Jan')
      expect(janElements.length).toBeGreaterThan(0)

      // Gallery intro section
      expect(screen.getByText('This is what awaits you')).toBeInTheDocument()
      const images = document.querySelectorAll('img')
      const galleryImages = Array.from(images).filter(
        (img) => (img as HTMLImageElement).src.includes('panoramicas')
      )
      expect(galleryImages.length).toBeGreaterThanOrEqual(1)

      // Conservation section
      expect(screen.getByText('UNESCO World Heritage Site')).toBeInTheDocument()
      expect(screen.getByText('Revillagigedo Archipelago National Park')).toBeInTheDocument()

      // CTA section — per-destination keys
      expect(screen.getByText('Ready to Meet the Mantas?')).toBeInTheDocument()
      const ctaLink = screen.getByRole('link', { name: /Reserve Your Socorro Expedition/i })
      expect(ctaLink).toHaveAttribute('href', '/contacto')
    })

    it('renders hero image with correct src', async () => {
      const { default: SocorroPage } = await importSocorroPage()
      render(<SocorroPage />)

      const images = screen.getAllByRole('img')
      const heroImg = images.find(
        (img) => (img as HTMLImageElement).src.includes('images.unsplash.com')
      ) as HTMLImageElement
      expect(heroImg).toBeDefined()
      expect(heroImg.src).toContain('photo-1682687982501')
    })
  })

  describe('Cortez Page (mar-de-cortes)', () => {
    beforeEach(() => {
      translationStore = { ...fullCortezTranslations }
    })

    it('renders its 3 dive site zones in the DOM', async () => {
      const { default: SeaOfCortezPage } = await importCortezPage()
      render(<SeaOfCortezPage />)

      // Zone badges appear on each site card in the horizontal scroll row
      const laPazElements = screen.getAllByText('La Paz Bay')
      expect(laPazElements.length).toBeGreaterThanOrEqual(2)
      const northernElements = screen.getAllByText('Northern Islands')
      expect(northernElements.length).toBeGreaterThanOrEqual(1)
      const eastCapeElements = screen.getAllByText('East Cape')
      expect(eastCapeElements.length).toBeGreaterThanOrEqual(1)

      // Specific site names within zones
      expect(screen.getByText('Los Islotes')).toBeInTheDocument()
      expect(screen.getByText('El Bajo')).toBeInTheDocument()
      expect(screen.getByText('Las Ánimas')).toBeInTheDocument()
    })

    it('renders hero image with correct src', async () => {
      const { default: SeaOfCortezPage } = await importCortezPage()
      render(<SeaOfCortezPage />)

      const images = screen.getAllByRole('img')
      const heroImg = images.find(
        (img) => (img as HTMLImageElement).src.includes('images.unsplash.com')
      ) as HTMLImageElement
      expect(heroImg).toBeDefined()
      expect(heroImg.src).toContain('photo-1507525428034')
    })
  })

  describe('Magbay Page (bahia-magdalena)', () => {
    beforeEach(() => {
      translationStore = { ...fullMagbayTranslations }
    })

    it('omits DiveSites section (magbay has no diveSites.title key)', async () => {
      const { default: BahiaMagdalenaPage } = await importMagbayPage()
      render(<BahiaMagdalenaPage />)

      // "Dive Sites" heading should NOT appear
      expect(screen.queryByText('Dive Sites')).not.toBeInTheDocument()

      // But other key sections should still render
      expect(screen.getByText('Bahía Magdalena')).toBeInTheDocument()
      expect(screen.getByText('What You Will See')).toBeInTheDocument()
      expect(screen.getByText('UNESCO Whale Sanctuary')).toBeInTheDocument()
      expect(screen.getByText('Ready to Meet the Gray Whales?')).toBeInTheDocument()
    })

    it('renders hero image with correct src', async () => {
      const { default: BahiaMagdalenaPage } = await importMagbayPage()
      render(<BahiaMagdalenaPage />)

      const images = screen.getAllByRole('img')
      const heroImg = images.find(
        (img) => (img as HTMLImageElement).src.includes('images.unsplash.com')
      ) as HTMLImageElement
      expect(heroImg).toBeDefined()
      expect(heroImg.src).toContain('photo-1568430462989')
    })
  })
})
