'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

type Language = 'en' | 'es'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.ourBoat': 'Our Boat',
    'nav.destinations': 'Destinations',
    'nav.faqs': 'FAQs',
    'nav.aboutUs': 'About Us',
    'nav.collaborations': 'Collaborations',
    'nav.testimonials': 'Testimonials',
    'nav.blogs': 'Blogs',
    'nav.contact': 'Contact',
    'nav.calendar': 'View Calendar',
    
    // Hero
    'hero.title': 'Quetzal',
    'hero.subtitle': 'THE GREATEST LIVEABOARD ADVENTURE IN THE OCEAN AWAITS YOU',
    
    // Hero
    'hero.button': 'View Calendar',
    
    // Experience Section
    'experience.title': 'What Awaits You Onboard',
    'experience.subtitle': 'Discover what makes this expedition truly unforgettable.',
    'experience.item1': 'Experienced crew navigating through pristine waters',
    'experience.item2': 'Classic luxury vessel ready for your adventure',
    'experience.item3': 'Unforgettable encounters with marine wildlife',
    'experience.item4': 'Professional team ensuring your safety and comfort',
    
    // Destination Section
    'destination.days': '7 DAYS OF EXPLORATION',
    'destination.title': 'SEA OF CORTEZ',
    'destination.year': '2026 STARTING AT',
    'destination.price': '$2,350 USD PER PERSON',
    'destination.cta': 'Ask Our Travel Expert',
    
    // Marine Life Section
    'marine.title': 'This Is What You will See With Us',
    'marine.description': 'Join Quetzal\'s liveaboard adventure and witness breathtaking marine life—exactly what our guests see on this unforgettable underwater experience.',
    'marine.cta': 'See Upcoming Trips',
    
    // Destinations Grid
    'destinations.title': 'Our Destinations',
    'destinations.subtitle': 'Where Adventure Begins',
    'destinations.socorro.title': 'SOCORRO',
    'destinations.socorro.description': 'Born from volcanoes, Socorro is one of four islands that make up the Revillagigedo Archipelago. They sit in a unique geographical location that attracts some of the most incredible marine life in the world.',
    'destinations.magbay.title': 'MAG BAY + SOCORRO',
    'destinations.magbay.description': 'Embark on a 14-day liveaboard adventure from Los Cabos to Mag Bay and Socorro, diving with whales, sharks, and mantas daily.',
    'destinations.cortez.title': 'SEA OF CORTEZ',
    'destinations.cortez.description': 'Visit one of the most beautiful places on the planet, with days full of saltwater and sun, mountains, wildlife, culture, and history!',
    'destinations.explore': 'Explore Destination',
    
    // Upcoming Trips
    'trips.title': 'Upcoming Destination',
    'trips.subtitle': 'Guided by Experience Perfected by Passion',
    'trips.trip1.title': 'Magdalena Bay & Socorro Islands',
    'trips.trip1.dates': '16 OCT 2025 - 30 OCT 2025',
    'trips.trip1.price': 'from $5,199 USD per person',
    'trips.trip2.title': 'Socorro Islands (Revillagigedo)',
    'trips.trip2.dates': '06 JAN 2026 - 14 JAN 2026',
    'trips.trip2.price': 'from $3,499 USD per person',
    'trips.trip3.title': 'Sea of Cortez Trip',
    'trips.trip3.dates': '09 JUL 2026 - 16 JUL 2026',
    'trips.trip3.price': 'from $2,350 USD per person',
    'trips.details': 'Trip & Price Details',
    
    // Testimonials
    'testimonials.title': 'What Our Guests Say',
    'testimonials.subtitle': 'Don\'t just take our word for it—hear from divers who\'ve experienced the adventure of a lifetime',
    
    // Gallery
    'gallery.title': 'Captured Moments',
    'gallery.subtitle': 'Experience the beauty beneath the waves',
    
    // Contact Form
    'contact.title': 'Plan Your Journey with Us',
    'contact.description': 'Use the form to contact our team — we\'re here to help you book and prepare for your Quetzal experience.',
    'contact.email': 'E-mail:',
    'contact.name': 'Name',
    'contact.emailField': 'Email',
    'contact.destinations': 'Destinations',
    'contact.message': 'Message',
    'contact.submit': 'Submit',
    'contact.required': 'Fields marked with an * are required',
    'contact.success': 'Thank you! We\'ll be in touch soon.',
    'contact.error': 'Something went wrong. Please try again.',
  },
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.ourBoat': 'Nuestro Barco',
    'nav.destinations': 'Destinos',
    'nav.faqs': 'Preguntas Frecuentes',
    'nav.aboutUs': 'Sobre Nosotros',
    'nav.collaborations': 'Colaboraciones',
    'nav.testimonials': 'Testimonios',
    'nav.blogs': 'Blog',
    'nav.contact': 'Contacto',
    'nav.calendar': 'Ver Calendario',
    
    // Hero
    'hero.title': 'Quetzal',
    'hero.subtitle': 'LA MEJOR AVENTURA DE BUCEO EN EL OCÉANO TE ESPERA',
    'hero.button': 'Ver Calendario',
    
    // Experience Section
    'experience.title': 'Lo Que Te Espera A Bordo',
    'experience.subtitle': 'Descubre lo que hace de esta expedición algo verdaderamente inolvidable.',
    'experience.item1': 'Tripulación experimentada navegando aguas cristalinas',
    'experience.item2': 'Embarcación clásica de lujo lista para tu aventura',
    'experience.item3': 'Encuentros inolvidables con vida marina',
    'experience.item4': 'Equipo profesional garantizando tu seguridad y comodidad',
    
    // Destination Section
    'destination.days': '7 DÍAS DE EXPLORACIÓN',
    'destination.title': 'MAR DE CORTÉS',
    'destination.year': '2026 DESDE',
    'destination.price': '$2,350 USD POR PERSONA',
    'destination.cta': 'Consulta con Nuestro Experto',
    
    // Marine Life Section
    'marine.title': 'Esto Es Lo Que Verás Con Nosotros',
    'marine.description': 'Únete a la aventura a bordo de Quetzal y presencia la impresionante vida marina—exactamente lo que nuestros huéspedes ven en esta inolvidable experiencia submarina.',
    'marine.cta': 'Ver Próximos Viajes',
    
    // Destinations Grid
    'destinations.title': 'Nuestros Destinos',
    'destinations.subtitle': 'Donde Comienza La Aventura',
    'destinations.socorro.title': 'SOCORRO',
    'destinations.socorro.description': 'Nacido de volcanes, Socorro es una de las cuatro islas que conforman el Archipiélago de Revillagigedo. Se encuentran en una ubicación geográfica única que atrae a una vida marina increíble.',
    'destinations.magbay.title': 'BAHÍA MAGDALENA + SOCORRO',
    'destinations.magbay.description': 'Embárcate en una aventura de 14 días desde Los Cabos hasta Bahía Magdalena y Socorro, buceando con ballenas, tiburones y mantas diariamente.',
    'destinations.cortez.title': 'MAR DE CORTÉS',
    'destinations.cortez.description': '¡Visita uno de los lugares más hermosos del planeta, con días llenos de agua salada y sol, montañas, vida silvestre, cultura e historia!',
    'destinations.explore': 'Explorar Destino',
    
    // Upcoming Trips
    'trips.title': 'Próximo Destino',
    'trips.subtitle': 'Guiados por Experiencia Perfeccionados por Pasión',
    'trips.trip1.title': 'Bahía Magdalena e Islas Socorro',
    'trips.trip1.dates': '16 OCT 2025 - 30 OCT 2025',
    'trips.trip1.price': 'desde $5,199 USD por persona',
    'trips.trip2.title': 'Islas Socorro (Revillagigedo)',
    'trips.trip2.dates': '06 ENE 2026 - 14 ENE 2026',
    'trips.trip2.price': 'desde $3,499 USD por persona',
    'trips.trip3.title': 'Viaje al Mar de Cortés',
    'trips.trip3.dates': '09 JUL 2026 - 16 JUL 2026',
    'trips.trip3.price': 'desde $2,350 USD por persona',
    'trips.details': 'Detalles del Viaje y Precios',
    
    // Testimonials
    'testimonials.title': 'Lo Que Dicen Nuestros Huéspedes',
    'testimonials.subtitle': 'No solo confíes en nuestra palabra—escucha a los buzos que han experimentado la aventura de su vida',
    
    // Gallery
    'gallery.title': 'Momentos Capturados',
    'gallery.subtitle': 'Experimenta la belleza bajo las olas',
    
    // Contact Form
    'contact.title': 'Planifica Tu Viaje Con Nosotros',
    'contact.description': 'Usa el formulario para contactar a nuestro equipo — estamos aquí para ayudarte a reservar y preparar tu experiencia Quetzal.',
    'contact.email': 'Correo electrónico:',
    'contact.name': 'Nombre',
    'contact.emailField': 'Correo Electrónico',
    'contact.destinations': 'Destinos',
    'contact.message': 'Mensaje',
    'contact.submit': 'Enviar',
    'contact.required': 'Los campos marcados con * son obligatorios',
    'contact.success': '¡Gracias! Nos pondremos en contacto pronto.',
    'contact.error': 'Algo salió mal. Por favor intenta de nuevo.',
  },
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
