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
    'nav.bookNow': 'Book Now',
    'nav.menu': 'Menu',
    'nav.signOut': 'Sign out',

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

    // Footer
    'footer.brand': 'Experience the greatest liveaboard adventure in the Pacific Ocean. Diving expeditions to Mexico\'s most extraordinary destinations.',
    'footer.destinations': 'Destinations',
    'footer.socorro': 'Socorro Islands',
    'footer.cortez': 'Sea of Cortez',
    'footer.magBay': 'Magdalena Bay',
    'footer.company': 'Company',
    'footer.contactForm': 'Contact Form',
    'footer.rights': 'All rights reserved.',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',

    // Our Boat Page
    'boat.hero': 'Meet the Quetzal',
    'boat.subtitle': 'A classic luxury vessel designed for exploration, comfort, and unforgettable moments on the open sea.',
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
    'boat.comfort.title': 'Comfort Onboard',
    'boat.comfort.subtitle': 'Every detail is designed so you can focus on what matters — the adventure.',
    'boat.comfort.dining': 'Gourmet Dining',
    'boat.comfort.diningDesc': 'Freshly prepared meals with local seafood and international cuisine, paired with fine wines and cold beverages.',
    'boat.comfort.sunDeck': 'Sun Deck & Lounge',
    'boat.comfort.sunDeckDesc': 'A spacious top deck with lounge chairs and shade areas, perfect for sunset cocktails between dives.',
    'boat.comfort.cabin': 'Private Cabins',
    'boat.comfort.cabinDesc': 'Comfortable cabins with air conditioning, private bathrooms, and ample storage for your gear.',
    'boat.comfort.dive': 'Dive Platform',
    'boat.comfort.diveDesc': 'A purpose-built dive deck with individual gear stations, camera rinse tanks, and warm showers.',

    // Destination Pages
    'dest.hero': 'Explore Our',
    'dest.heroHighlight': 'Destinations',
    'dest.backAll': 'View All Destinations',
    'dest.fromPrice': 'Starting from',
    'dest.perPerson': 'per person',
    'dest.duration': 'Duration',
    'dest.nextDeparture': 'Next Departure',
    'dest.bookNow': 'Book This Trip',

    // Socorro
    'socorro.title': 'Socorro Islands',
    'socorro.subtitle': 'The Galápagos of Mexico',
    'socorro.description1': 'The Revillagigedo Archipelago, known as the Socorro Islands, is a UNESCO World Heritage Site located 250 miles south of Cabo San Lucas. These volcanic islands rise from the deep ocean, creating a unique ecosystem that attracts some of the largest marine species on Earth.',
    'socorro.description2': 'From giant oceanic mantas with wingspans over 20 feet to schools of hammerhead sharks, bottlenose dolphins, and seasonal humpback whale encounters — Socorro delivers world-class diving that rivals the best on the planet.',
    'socorro.highlights': 'What You\'ll See',
    'socorro.h1': 'Giant Oceanic Mantas',
    'socorro.h1d': 'Witness mantas with wingspans over 20 feet glide gracefully through crystal-clear waters, often approaching divers with gentle curiosity.',
    'socorro.h2': 'Hammerhead Schools',
    'socorro.h2d': 'Dive among hundreds of scalloped hammerhead sharks gathering at cleaning stations, an awe-inspiring sight unique to these waters.',
    'socorro.h3': 'Humpback Whales',
    'socorro.h3d': 'Between January and April, humpback whales visit these waters. Hear their songs underwater and witness spectacular breaches.',
    'socorro.h4': 'Dolphins & Large Pelagics',
    'socorro.h4d': 'Playful bottlenose dolphins frequently approach divers, while tuna, wahoo, and other large pelagics patrol the blue.',

    // Sea of Cortez
    'cortez.title': 'Sea of Cortez',
    'cortez.subtitle': 'The Aquarium of the World',
    'cortez.description1': 'Jacques Cousteau called the Sea of Cortez "the aquarium of the world," and for good reason. This narrow body of water between the Baja California peninsula and mainland Mexico is one of the most biodiverse marine environments on the planet.',
    'cortez.description2': 'Over 900 species of fish, thousands of invertebrates, and one-third of the world\'s cetacean species call these waters home. From sea lion colonies to whale watching, from colorful nudibranchs to massive whale sharks — the Sea of Cortez delivers diversity unmatched anywhere.',
    'cortez.highlights': 'What You\'ll See',
    'cortez.h1': 'Sea Lion Colonies',
    'cortez.h1d': 'Play with curious sea lions at Espíritu Santo Island — they love to twirl, spin, and blow bubbles around delighted divers.',
    'cortez.h2': 'Whale Sharks',
    'cortez.h2d': 'Swim alongside the world\'s largest fish in the nutrient-rich waters of Bahía de La Paz, a truly humbling experience.',
    'cortez.h3': 'Colorful Reef Life',
    'cortez.h3d': 'Vibrant nudibranchs, moray eels, octopus, and over 700 species of reef fish make every dive a treasure hunt.',
    'cortez.h4': 'Stunning Topside',
    'cortez.h4d': 'Dramatic desert landscapes, secluded coves, and mountainous islands create breathtaking scenery above and below water.',

    // Magdalena Bay
    'magbay.title': 'Bahía Magdalena',
    'magbay.subtitle': 'Where Whales Meet the Desert',
    'magbay.description1': 'Bahía Magdalena is one of Baja California\'s best-kept secrets. This vast protected lagoon on the Pacific coast is famous worldwide as a nursery for gray whales, who travel over 10,000 miles to calve in its warm, shallow waters.',
    'magbay.description2': 'Combined with a journey to Socorro, this expedition offers the rare chance to experience both the intimacy of close whale encounters in the bay and the adrenaline of big-animal diving at the archipelago — two截然不同的 worlds in one unforgettable trip.',
    'magbay.highlights': 'What You\'ll See',
    'magbay.h1': 'Gray Whale Encounters',
    'magbay.h1d': 'Get within arm\'s reach of gentle gray whales and their calves — one of the most profound wildlife experiences anywhere.',
    'magbay.h2': 'Mangrove Channels',
    'magbay.h2d': 'Kayak through pristine mangrove channels teeming with birds, rays, and tropical fish in crystal-clear shallows.',
    'magbay.h3': 'Desert Wildlife',
    'magbay.h3d': 'Spot coyotes, osprey, and desert foxes along the unspoiled dunes and remote beaches of Isla Magdalena.',
    'magbay.h4': 'Socorro Diving',
    'magbay.h4d': 'The second half brings mantas, sharks, and dolphins at the Revillagigedo Archipelago — the best of both worlds.',

    // FAQ Page
    'faq.title': 'Frequently Asked Questions',
    'faq.subtitle': 'Everything you need to know before your expedition.',
    'faq.booking.title': 'Booking & Reservations',
    'faq.q1': 'How do I book a trip?',
    'faq.a1': 'You can book directly through our contact form, send us an email, or contact our travel experts who will help you find the perfect expedition for your dates and interests.',
    'faq.q2': 'What is the cancellation policy?',
    'faq.a2': 'Cancellations made more than 120 days before departure receive a full refund minus a $200 processing fee. Between 60–120 days, 50% refund. Less than 60 days, no refund. We strongly recommend travel insurance.',
    'faq.q3': 'Do you offer group discounts?',
    'faq.a3': 'Yes! Groups of 6 or more receive a 10% discount. For larger groups or charter inquiries, please contact us directly for custom pricing.',
    'faq.preparation.title': 'Preparation & Packing',
    'faq.q4': 'What certification level do I need?',
    'faq.a4': 'Most dives require an Open Water certification with at least 25 logged dives. For Socorro, we recommend Advanced Open Water due to currents and depth. Non-divers are also welcome for snorkeling and topside activities.',
    'faq.q5': 'What should I pack?',
    'faq.a5': 'We provide a detailed packing list upon booking. Essentials include: reef-safe sunscreen, motion sickness medication, 3mm wetsuit (5mm for winter), dive computer, and a camera if you have one.',
    'faq.q6': 'Do I need travel insurance?',
    'faq.a6': 'We strongly recommend comprehensive travel insurance including dive evacuation coverage (DAN membership). This protects you against trip cancellations, medical emergencies, and evacuation scenarios.',
    'faq.onboard.title': 'Onboard Experience',
    'faq.q7': 'What are the cabins like?',
    'faq.a7': 'All cabins are private with air conditioning, en-suite bathrooms, 110V outlets, and storage space. Categories range from Standard to Master Suite. All linens and towels are provided.',
    'faq.q8': 'How many dives per day?',
    'faq.a8': 'Typically 3–4 dives per day including a night dive when conditions allow. Dive schedules are flexible and weather-dependent.',
    'faq.q9': 'What about dietary restrictions?',
    'faq.a9': 'Our chef can accommodate most dietary needs including vegetarian, vegan, gluten-free, and kosher. Please inform us at least 2 weeks before departure.',

    // About Page
    'about.title': 'About Quetzal',
    'about.subtitle': 'Passion for the ocean, commitment to excellence.',
    'about.story': 'Our Story',
    'about.storyText1': 'Quetzal was born from a love affair with the Mexican Pacific. Our founders — seasoned divers and seafarers — spent decades exploring these waters before deciding to share them with the world.',
    'about.storyText2': 'We believe that extraordinary experiences deserve an extraordinary vessel. The Quetzal was custom-designed for comfort, safety, and accessibility to Mexico\'s most remote and spectacular dive sites.',
    'about.storyText3': 'Today, we\'re proud to host adventurers from over 30 countries who return year after year — not just for the diving, but for the warmth, professionalism, and genuine care that defines every Quetzal expedition.',
    'about.mission': 'Our Mission',
    'about.missionText': 'To provide world-class liveaboard expeditions that connect people with the ocean\'s most extraordinary environments, while promoting marine conservation and supporting local communities.',
    'about.values': 'Our Values',
    'about.v1': 'Safety First',
    'about.v1d': 'Rigorous safety protocols, experienced crew, and state-of-the-art equipment ensure your wellbeing at all times.',
    'about.v2': 'Marine Conservation',
    'about.v2d': 'We partner with research organizations and follow strict eco-guidelines to protect the ecosystems we visit.',
    'about.v3': 'Exceptional Service',
    'about.v3d': 'From gourmet meals to personalized dive briefings, every detail is curated for an unforgettable experience.',
    'about.v4': 'Community',
    'about.v4d': 'We hire locally, source responsibly, and invest in the coastal communities that make our expeditions possible.',

    // Collaborations Page
    'collab.title': 'Our Collaborations',
    'collab.subtitle': 'Working together for a healthier ocean.',
    'collab.intro': 'We believe in the power of partnership. Our collaborations span marine research, conservation, and community development — ensuring that every expedition gives back to the ocean and the people who depend on it.',
    'collab.p1.name': 'Sylvia Earle Alliance',
    'collab.p1.desc': 'Supporting Mission Blue Hope Spots in the Revillagigedo Archipelago and Sea of Cortez, contributing data to global marine conservation efforts.',
    'collab.p2.name': 'PADI Conservation',
    'collab.p2.desc': 'Official PADI AWARE partner. We conduct reef health surveys, debris cleanups, and help certify new divers in conservation practices.',
    'collab.p3.name': 'Local Fishing Co-ops',
    'collab.p3.desc': 'We source our seafood from sustainable local co-ops and provide alternative income opportunities through eco-tourism training.',
    'collab.p4.name': 'CICIMAR Research',
    'collab.p4.desc': 'Collaborating with Mexico\'s Center for Scientific Research and Higher Education to monitor whale populations and ocean health.',
    'collab.cta': 'Interested in partnering with us?',
    'collab.ctaButton': 'Get In Touch',

    // Testimonials Page
    'testimonials.pageTitle': 'Guest Testimonials',
    'testimonials.pageSubtitle': 'Real stories from real adventurers.',
    'testimonials.all': 'All Trips',
    'testimonials.socorro': 'Socorro',
    'testimonials.cortez': 'Sea of Cortez',
    'testimonials.magBay': 'Mag Bay',

    // Blog Page
    'blog.title': 'The Quetzal Journal',
    'blog.subtitle': 'Stories, guides, and insights from the Mexican Pacific.',
    'blog.readMore': 'Read More',
    'blog.comingSoon': 'Coming Soon',
    'blog.comingSoonDesc': 'We\'re preparing amazing stories about our expeditions, marine life encounters, and travel guides. Stay tuned!',
    'blog.category': 'Category',
    'blog.catAll': 'All',
    'blog.catExpeditions': 'Expeditions',
    'blog.catMarine': 'Marine Life',
    'blog.catGuides': 'Travel Guides',
    'blog.catConservation': 'Conservation',

    // Contact Page
    'contact.pageTitle': 'Get In Touch',
    'contact.pageSubtitle': 'Ready to embark on the adventure of a lifetime? We\'re here to help.',
    'contact.phone': 'Phone',
    'contact.phoneVal': '+52 624 123 4567',
    'contact.hours': 'Hours',
    'contact.hoursVal': 'Mon–Sat, 9am–6pm MT',
    'contact.location': 'Location',
    'contact.locationVal': 'Cabo San Lucas, BCS, México',
    'contact.social': 'Follow Us',

    // Shared
    'shared.backHome': 'Back to Home',

    // Nav dropdown
    'nav.socorro': 'Socorro Islands',
    'nav.cortez': 'Sea of Cortez',
    'nav.magbay': 'Magdalena Bay',

    // Legal
    'privacy.title': 'Privacy Policy',
    'privacy.content': 'We are committed to protecting your privacy. This policy outlines how we collect, use, and protect your personal information when you use our website and book our services. For the full privacy policy, please contact us directly.',
    'terms.title': 'Terms of Service',
    'terms.content': 'By using our website and booking our services, you agree to these terms. All bookings are subject to our cancellation policy. For complete terms and conditions, please contact us directly.',

    // Booking Page
    'booking.title': 'Book Your Expedition',
    'booking.steps.login': 'Login',
    'booking.steps.selectCruise': 'Select Cruise',
    'booking.steps.payment': 'Payment',
    'booking.flow.back': 'Back',
    'booking.flow.next': 'Next',
    'booking.login.title': 'Login to Your Account',
    'booking.login.email': 'Email',
    'booking.login.password': 'Password',
    'booking.login.submit': 'Login',
    'booking.login.error': 'Invalid email or password',
    'booking.login.invalid': 'Please enter a valid email address',
    'booking.cruise.title': 'Select Your Cruise',
    'booking.cruise.select': 'Select',
    'booking.cruise.signIn': 'Sign in',
    'booking.cruise.selected': 'Selected',
    'booking.cruise.departure': 'Departure',
    'booking.cruise.route': 'Route',
    'booking.cruise.pricePerPerson': 'per person',
    'booking.cruise.boat': 'Ship',
    'booking.cruise.tripDetails': 'Trip & Price details',
    'booking.guest.title': 'Number of Guests',
    'booking.guest.label': 'Guests',
    'booking.guest.increment': 'Add guest',
    'booking.guest.decrement': 'Remove guest',
    'booking.guest.minReached': 'Minimum 1 guest required',
    'booking.guest.maxReached': 'Maximum 18 guests allowed',
    'booking.payment.title': 'Complete Your Booking',
    'booking.payment.summary': 'Booking Summary',
    'booking.payment.cruise': 'Cruise',
    'booking.payment.guests': 'Guests',
    'booking.payment.total': 'Total',
    'booking.payment.payWithCard': 'Pay with Credit Card',
    'booking.payment.payWithPaypal': 'Pay with PayPal',
    'booking.payment.payWithBank': 'Pay with Bank Transfer',
    'booking.payment.confirming': 'Processing...',
    'booking.payment.success': 'Booking confirmed! We will contact you shortly.',
    'booking.confirmation.title': 'Booking Confirmed',
    'booking.confirmation.message': 'Thank you for your booking. Our team will be in touch with next steps.',
    'booking.confirmation.backHome': 'Back to Home',

    // Account Page
    'account.title': 'My Account',
    'account.profile': 'Profile',
    'account.reservations': 'Reservation History',
    'account.save': 'Save',
    'account.edit': 'Edit',
    'account.name': 'Name',
    'account.email': 'Email',
    'account.phone': 'Phone',
    'account.noReservations': 'No reservations yet',
    'account.saveSuccess': 'Profile updated successfully',
    'account.status.pending': 'Pending',
    'account.status.confirmed': 'Confirmed',
    'account.status.completed': 'Completed',
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
    'nav.bookNow': 'Reservar',
    'nav.menu': 'Menú',
    'nav.signOut': 'Cerrar sesión',

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

    // Footer
    'footer.brand': 'Experimenta la mejor aventura de buceo en barco en el Océano Pacífico. Expediciones a los destinos más extraordinarios de México.',
    'footer.destinations': 'Destinos',
    'footer.socorro': 'Islas Socorro',
    'footer.cortez': 'Mar de Cortés',
    'footer.magBay': 'Bahía Magdalena',
    'footer.company': 'Compañía',
    'footer.contactForm': 'Formulario de Contacto',
    'footer.rights': 'Todos los derechos reservados.',
    'footer.privacy': 'Política de Privacidad',
    'footer.terms': 'Términos de Servicio',

    // Our Boat Page
    'boat.hero': 'Conoce el Quetzal',
    'boat.subtitle': 'Una embarcación clásica de lujo diseñada para la exploración, la comodidad y los momentos inolvidables en alta mar.',
    'boat.specs.title': 'Especificaciones del Barco',
    'boat.specs.length': 'Eslora',
    'boat.specs.lengthVal': '120 ft (36.5 m)',
    'boat.specs.beam': 'Manga',
    'boat.specs.beamVal': '24 ft (7.3 m)',
    'boat.specs.guests': 'Huéspedes',
    'boat.specs.guestsVal': 'Hasta 20',
    'boat.specs.cabins': 'Cabinas',
    'boat.specs.cabinsVal': '10 Privadas',
    'boat.specs.speed': 'Velocidad de Crucero',
    'boat.specs.speedVal': '10 nudos',
    'boat.specs.compressor': 'Compresores',
    'boat.specs.compressorVal': '2x Bauer',
    'boat.comfort.title': 'Comodidad a Bordo',
    'boat.comfort.subtitle': 'Cada detalle está diseñado para que te enfoques en lo importante — la aventura.',
    'boat.comfort.dining': 'Cena Gourmet',
    'boat.comfort.diningDesc': 'Comidas recién preparadas con mariscos locales y cocina internacional, acompañadas de vinos finos y bebidas frías.',
    'boat.comfort.sunDeck': 'Solárium y Terraza',
    'boat.comfort.sunDeckDesc': 'Una cubierta superior espaciosa con tumbonas y zonas con sombra, perfecta para cócteles al atardecer entre inmersiones.',
    'boat.comfort.cabin': 'Cabinas Privadas',
    'boat.comfort.cabinDesc': 'Cabinas cómodas con aire acondicionado, baños privados y amplio espacio de almacenamiento para tu equipo.',
    'boat.comfort.dive': 'Plataforma de Buceo',
    'boat.comfort.diveDesc': 'Un área de buceo diseñada con estaciones individuales de equipo, tanques de enjuague para cámaras y duchas de agua caliente.',

    // Destination Pages
    'dest.hero': 'Explora Nuestros',
    'dest.heroHighlight': 'Destinos',
    'dest.backAll': 'Ver Todos los Destinos',
    'dest.fromPrice': 'Desde',
    'dest.perPerson': 'por persona',
    'dest.duration': 'Duración',
    'dest.nextDeparture': 'Próxima Salida',
    'dest.bookNow': 'Reservar Este Viaje',

    // Socorro
    'socorro.title': 'Islas Socorro',
    'socorro.subtitle': 'Las Galápagos de México',
    'socorro.description1': 'El Archipiélago de Revillagigedo, conocido como las Islas Socorro, es Patrimonio de la Humanidad por la UNESCO, ubicado a 250 millas al sur de Cabo San Lucas. Estas islas volcánicas emergen del océano profundo, creando un ecosistema único que atrae a las especies marinas más grandes del planeta.',
    'socorro.description2': 'Desde mantas oceánicas gigantes con envergaduras de más de 6 metros hasta bancos de tiburones martillo, delfines nariz de botella y encuentros estacionales con ballenas jorobadas — Socorro ofrece buceo de clase mundial que rivaliza con los mejores del planeta.',
    'socorro.highlights': 'Lo Que Verás',
    'socorro.h1': 'Mantas Oceánicas Gigantes',
    'socorro.h1d': 'Observa mantas con envergaduras de más de 6 metros planear graciosamente en aguas cristalinas, a menudo acercándose a los buzos con gentil curiosidad.',
    'socorro.h2': 'Bancos de Tiburones Martillo',
    'socorro.h2d': 'Buzca entre cientos de tiburones martillo reunidos en estaciones de limpieza, un espectáculo impresionante único en estas aguas.',
    'socorro.h3': 'Ballenas Jorobadas',
    'socorro.h3d': 'Entre enero y abril, las ballenas jorobadas visitan estas aguas. Escucha sus cantos submarinos y presenciar espectaculares saltos.',
    'socorro.h4': 'Delfines y Pelágicos Grandes',
    'socorro.h4d': 'Delfines nariz de botella juguetones se acercan frecuentemente a los buzos, mientras atunes, wahoos y otros pelágicos grandes patrullan el azul.',

    // Sea of Cortez
    'cortez.title': 'Mar de Cortés',
    'cortez.subtitle': 'El Acuario del Mundo',
    'cortez.description1': 'Jacques Cousteau llamó al Mar de Cortés "el acuario del mundo", y con razón. Este estrecho cuerpo de agua entre la península de Baja California y el México continental es uno de los ambientes marinos más biodiversos del planeta.',
    'cortez.description2': 'Más de 900 especies de peces, miles de invertebrados y un tercio de las especies de cetáceos del mundo habitan estas aguas. Desde colonias de lobos marinos hasta avistamiento de ballenas, desde nudibranquios coloridos hasta tiburones ballena — el Mar de Cortés ofrece una diversidad inigualable.',
    'cortez.highlights': 'Lo Que Verás',
    'cortez.h1': 'Colonias de Lobos Marinos',
    'cortez.h1d': 'Juega con curiosos lobos marinos en la Isla Espíritu Santo — les encanta girar, dar vueltas y soplar burbujas alrededor de los buzos.',
    'cortez.h2': 'Tiburones Ballena',
    'cortez.h2d': 'Nada junto al pez más grande del mundo en las aguas ricas en nutrientes de Bahía de La Paz, una experiencia verdaderamente humilde.',
    'cortez.h3': 'Vida Arrecifal Colorida',
    'cortez.h3d': 'Vibrantes nudibranquios, morenas, pulpos y más de 700 especies de peces de arrecife hacen de cada inmersión una búsqueda del tesoro.',
    'cortez.h4': 'Paisajes Impresionantes',
    'cortez.h4d': 'Dramáticos paisajes desérticos, caletas apartadas e islas montañosas crean un escenario impresionante sobre y bajo el agua.',

    // Magdalena Bay
    'magbay.title': 'Bahía Magdalena',
    'magbay.subtitle': 'Donde las Ballenas Encuentran el Desierto',
    'magbay.description1': 'Bahía Magdalena es uno de los mejores secretos de Baja California. Esta vasta laguna protegida en la costa del Pacífico es famosa mundialmente como guardería de ballenas grises, que viajan más de 16,000 kilómetros para parir en sus aguas cálidas.',
    'magbay.description2': 'Combinada con un viaje a Socorro, esta expedición ofrece la rara oportunidad de experimentar tanto la intimidad de los encuentros cercanos con ballenas en la bahía como la adrenalina del buceo de animales grandes en el archipiélago — dos mundos en un viaje inolvidable.',
    'magbay.highlights': 'Lo Que Verás',
    'magbay.h1': 'Encuentros con Ballenas Grises',
    'magbay.h1d': 'Llega a estar a un brazo de distancia de gentiles ballenas grises y sus crías — una de las experiencias de vida silvestre más profundas que existen.',
    'magbay.h2': 'Canales de Manglar',
    'magbay.h2d': 'Haga kayak por prístinos canales de manglar llenos de aves, rayas y peces tropicales en aguas cristalinas.',
    'magbay.h3': 'Vida Silvestre del Desierto',
    'magbay.h3d': 'Observa coyotes, águilas pescadoras y zorros del desierto a lo largo de las dunas y playas remotas de Isla Magdalena.',
    'magbay.h4': 'Buceo en Socorro',
    'magbay.h4d': 'La segunda mitad trae mantas, tiburones y delfines en el Archipiélago de Revillagigedo — lo mejor de ambos mundos.',

    // FAQ Page
    'faq.title': 'Preguntas Frecuentes',
    'faq.subtitle': 'Todo lo que necesitas saber antes de tu expedición.',
    'faq.booking.title': 'Reservaciones y Pagos',
    'faq.q1': '¿Cómo reservo un viaje?',
    'faq.a1': 'Puedes reservar directamente a través de nuestro formulario de contacto, enviarnos un correo electrónico o contactar a nuestros expertos en viajes que te ayudarán a encontrar la expedición perfecta.',
    'faq.q2': '¿Cuál es la política de cancelación?',
    'faq.a2': 'Cancelaciones hechas más de 120 días antes de la salida reciben un reembolso completo menos una tarifa de procesamiento de $200 USD. Entre 60–120 días, 50% de reembolso. Menos de 60 días, sin reembolso. Recomendamos encarecidamente un seguro de viaje.',
    'faq.q3': '¿Ofrecen descuentos grupales?',
    'faq.a3': '¡Sí! Grupos de 6 o más reciben un 10% de descuento. Para grupos más grandes o consultas de fletamento, contáctanos directamente para precios personalizados.',
    'faq.preparation.title': 'Preparación y Equipaje',
    'faq.q4': '¿Qué nivel de certificación necesito?',
    'faq.a4': 'La mayoría de las inmersiones requieren certificación Open Water con al menos 25 inmersiones registradas. Para Socorro, recomendamos Advanced Open Water debido a las corrientes y profundidad. Los no buzos también son bienvenidos para snorkel y actividades en la superficie.',
    'faq.q5': '¿Qué debo empacar?',
    'faq.a5': 'Proporcionamos una lista detallada de empaque al reservar. Lo esencial incluye: protector solar ecológico, medicación para mareos, traje de neopreno de 3mm (5mm para invierno), computadora de buceo y una cámara si tienes.',
    'faq.q6': '¿Necesito seguro de viaje?',
    'faq.a6': 'Recomendamos encarecidamente un seguro de viaje integral que incluya cobertura de evacuación de buceo (membresía DAN). Esto te protege contra cancelaciones, emergencias médicas y escenarios de evacuación.',
    'faq.onboard.title': 'Experiencia a Bordo',
    'faq.q7': '¿Cómo son las cabinas?',
    'faq.a7': 'Todas las cabinas son privadas con aire acondicionado, baños privados, enchufes de 110V y espacio de almacenamiento. Las categorías van de Estándar a Suite Master. Toda la ropa de cama y toallas están incluidas.',
    'faq.q8': '¿Cuántas inmersiones por día?',
    'faq.a8': 'Típicamente 3-4 inmersiones por día incluyendo una inmersión nocturna cuando las condiciones lo permiten. Los horarios de buceo son flexibles y dependen del clima.',
    'faq.q9': '¿Y las restricciones alimentarias?',
    'faq.a9': 'Nuestro chef puede acomodar la mayoría de las necesidades dietéticas incluyendo vegetariano, vegano, sin gluten y kosher. Por favor infórmanos al menos 2 semanas antes de la salida.',

    // About Page
    'about.title': 'Sobre Quetzal',
    'about.subtitle': 'Pasión por el océano, compromiso con la excelencia.',
    'about.story': 'Nuestra Historia',
    'about.storyText1': 'Quetzal nació de un romance con el Pacífico mexicano. Nuestros fundadores — buzos y navegantes experimentados — pasaron décadas explorando estas aguas antes de decidir compartirlas con el mundo.',
    'about.storyText2': 'Creemos que las experiencias extraordinarias merecen un barco extraordinario. El Quetzal fue diseñado especialmente para la comodidad, seguridad y acceso a los sitios de buceo más remotos y espectaculares de México.',
    'about.storyText3': 'Hoy, estamos orgullosos de recibir aventureros de más de 30 países que regresan año tras año — no solo por el buceo, sino por la calidez, profesionalismo y genuino cuidado que define cada expedición Quetzal.',
    'about.mission': 'Nuestra Misión',
    'about.missionText': 'Proporcionar expediciones de buceo en barco de clase mundial que conecten a las personas con los entornos oceánicos más extraordinarios, promoviendo la conservación marina y apoyando a las comunidades locales.',
    'about.values': 'Nuestros Valores',
    'about.v1': 'Seguridad Primero',
    'about.v1d': 'Protocolos rigurosos de seguridad, tripulación experimentada y equipo de última generación garantizan tu bienestar en todo momento.',
    'about.v2': 'Conservación Marina',
    'about.v2d': 'Colaboramos con organizaciones de investigación y seguimos guías ecológicas estrictas para proteger los ecosistemas que visitamos.',
    'about.v3': 'Servicio Excepcional',
    'about.v3d': 'Desde comidas gourmet hasta breifings personalizados de buceo, cada detalle está curado para una experiencia inolvidable.',
    'about.v4': 'Comunidad',
    'about.v4d': 'Contratamos localmente, consumimos responsablemente e invertimos en las comunidades costeras que hacen posibles nuestras expediciones.',

    // Collaborations Page
    'collab.title': 'Nuestras Colaboraciones',
    'collab.subtitle': 'Trabajando juntos por un océano más sano.',
    'collab.intro': 'Creemos en el poder de la colaboración. Nuestras alianzas abarcan investigación marina, conservación y desarrollo comunitario — asegurando que cada expedición devuelva algo al océano y a las personas que dependen de él.',
    'collab.p1.name': 'Sylvia Earle Alliance',
    'collab.p1.desc': 'Apoyando Hope Spots de Mission Blue en el Archipiélago de Revillagigedo y el Mar de Cortés, contribuyendo datos a esfuerzos globales de conservación marina.',
    'collab.p2.name': 'Conservación PADI',
    'collab.p2.desc': 'Socio oficial de PADI AWARE. Realizamos encuestas de salud de arrecifes, limpiezas de desechos y ayudamos a certificar nuevos buzos en prácticas de conservación.',
    'collab.p3.name': 'Cooperativas Pesqueras Locales',
    'collab.p3.desc': 'Obtenemos nuestros mariscos de cooperativas locales sostenibles y proporcionamos oportunidades de ingresos alternativos a través de capacitación en ecoturismo.',
    'collab.p4.name': 'Investigación CICIMAR',
    'collab.p4.desc': 'Colaborando con el Centro de Investigación Científica y de Educación Superior de México para monitorear poblaciones de ballenas y la salud del océano.',
    'collab.cta': '¿Interesado en colaborar con nosotros?',
    'collab.ctaButton': 'Contáctanos',

    // Testimonials Page
    'testimonials.pageTitle': 'Testimonios de Huéspedes',
    'testimonials.pageSubtitle': 'Historias reales de aventureros reales.',
    'testimonials.all': 'Todos',
    'testimonials.socorro': 'Socorro',
    'testimonials.cortez': 'Mar de Cortés',
    'testimonials.magBay': 'Bahía Magdalena',

    // Blog Page
    'blog.title': 'El Diario Quetzal',
    'blog.subtitle': 'Historias, guías e insights del Pacífico Mexicano.',
    'blog.readMore': 'Leer Más',
    'blog.comingSoon': 'Próximamente',
    'blog.comingSoonDesc': 'Estamos preparando increíbles historias sobre nuestras expediciones, encuentros con vida marina y guías de viaje. ¡Mantente atento!',
    'blog.category': 'Categoría',
    'blog.catAll': 'Todas',
    'blog.catExpeditions': 'Expediciones',
    'blog.catMarine': 'Vida Marina',
    'blog.catGuides': 'Guías de Viaje',
    'blog.catConservation': 'Conservación',

    // Contact Page
    'contact.pageTitle': 'Contáctanos',
    'contact.pageSubtitle': '¿Listo para emprender la aventura de tu vida? Estamos aquí para ayudarte.',
    'contact.phone': 'Teléfono',
    'contact.phoneVal': '+52 624 123 4567',
    'contact.hours': 'Horario',
    'contact.hoursVal': 'Lun–Sáb, 9am–6pm MT',
    'contact.location': 'Ubicación',
    'contact.locationVal': 'Cabo San Lucas, BCS, México',
    'contact.social': 'Síguenos',

    // Shared
    'shared.backHome': 'Volver al Inicio',

    // Nav dropdown
    'nav.socorro': 'Islas Socorro',
    'nav.cortez': 'Mar de Cortés',
    'nav.magbay': 'Bahía Magdalena',

    // Legal
    'privacy.title': 'Política de Privacidad',
    'privacy.content': 'Estamos comprometidos con la protección de tu privacidad. Esta política describe cómo recopilamos, usamos y protegemos tu información personal al utilizar nuestro sitio web y reservar nuestros servicios. Para la política completa, contáctanos directamente.',
    'terms.title': 'Términos de Servicio',
    'terms.content': 'Al utilizar nuestro sitio web y reservar nuestros servicios, aceptas estos términos. Todas las reservaciones están sujetas a nuestra política de cancelación. Para los términos completos, contáctanos directamente.',

    // Booking Page
    'booking.title': 'Reserva Tu Expedición',
    'booking.steps.login': 'Acceso',
    'booking.steps.selectCruise': 'Seleccionar Crucero',
    'booking.steps.payment': 'Pago',
    'booking.flow.back': 'Atrás',
    'booking.flow.next': 'Siguiente',
    'booking.login.title': 'Accede a Tu Cuenta',
    'booking.login.email': 'Correo Electrónico',
    'booking.login.password': 'Contraseña',
    'booking.login.submit': 'Acceder',
    'booking.login.error': 'Correo electrónico o contraseña inválidos',
    'booking.login.invalid': 'Por favor ingresa una dirección de correo válida',
    'booking.cruise.title': 'Selecciona Tu Crucero',
    'booking.cruise.select': 'Seleccionar',
    'booking.cruise.signIn': 'Inicia sesión',
    'booking.cruise.selected': 'Seleccionado',
    'booking.cruise.departure': 'Salida',
    'booking.cruise.route': 'Ruta',
    'booking.cruise.pricePerPerson': 'por persona',
    'booking.cruise.boat': 'Barco',
    'booking.cruise.tripDetails': 'Detalles del viaje',
    'booking.guest.title': 'Número de Huéspedes',
    'booking.guest.label': 'Huéspedes',
    'booking.guest.increment': 'Agregar huésped',
    'booking.guest.decrement': 'Quitar huésped',
    'booking.guest.minReached': 'Se requiere mínimo 1 huésped',
    'booking.guest.maxReached': 'Máximo 18 huéspedes permitidos',
    'booking.payment.title': 'Completa Tu Reserva',
    'booking.payment.summary': 'Resumen de Reserva',
    'booking.payment.cruise': 'Crucero',
    'booking.payment.guests': 'Huéspedes',
    'booking.payment.total': 'Total',
    'booking.payment.payWithCard': 'Pagar con Tarjeta de Crédito',
    'booking.payment.payWithPaypal': 'Pagar con PayPal',
    'booking.payment.payWithBank': 'Pagar con Transferencia Bancaria',
    'booking.payment.confirming': 'Procesando...',
    'booking.payment.success': '¡Reserva confirmada! Nos pondremos en contacto contigo pronto.',
    'booking.confirmation.title': 'Reserva Confirmada',
    'booking.confirmation.message': 'Gracias por tu reserva. Nuestro equipo se pondrá en contacto contigo con los siguientes pasos.',
    'booking.confirmation.backHome': 'Volver al Inicio',

    // Account Page
    'account.title': 'Mi Cuenta',
    'account.profile': 'Perfil',
    'account.reservations': 'Historial de Reservas',
    'account.save': 'Guardar',
    'account.edit': 'Editar',
    'account.name': 'Nombre',
    'account.email': 'Correo Electrónico',
    'account.phone': 'Teléfono',
    'account.noReservations': 'Sin reservas aún',
    'account.saveSuccess': 'Perfil actualizado correctamente',
    'account.status.pending': 'Pendiente',
    'account.status.confirmed': 'Confirmado',
    'account.status.completed': 'Completado',
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
