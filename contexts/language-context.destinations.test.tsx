import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { LanguageProvider, useLanguage } from '@/contexts/language-context'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
)

// Helper to test a key in a language
function testKey(lang: 'en' | 'es', key: string, expected: string) {
  const { result } = renderHook(() => useLanguage(), { wrapper })
  act(() => {
    result.current.setLanguage(lang)
  })
  expect(result.current.t(key)).toBe(expected)
}

describe('Destination translations — Socorro (EN)', () => {
  it('socorro.h5', () => testKey('en', 'socorro.h5', 'Tiger & Silky Sharks'))
  it('socorro.h5d', () => testKey('en', 'socorro.h5d', "As you drift along volcanic walls, you'll spot the unmistakable silhouettes of tiger sharks, oceanic white-tips, and silky sharks. They move with quiet confidence — and you get to witness it from arm's length."))
  it('socorro.h6', () => testKey('en', 'socorro.h6', 'Whale Sharks & False Orcas'))
  it('socorro.h6d', () => testKey('en', 'socorro.h6d', 'If your trip falls in November, December, or May, you might find yourself swimming beside a whale shark — the largest fish on Earth. May also brings giant bait balls and pods of false orcas that turn the ocean into a living spectacle.'))

  it('socorro.diveSites.title', () => testKey('en', 'socorro.diveSites.title', 'Dive Sites'))

  // San Benedicto — The Boiler
  it('socorro.diveSites.sanBenedicto.boiler.name', () => testKey('en', 'socorro.diveSites.sanBenedicto.boiler.name', 'The Boiler'))
  it('socorro.diveSites.sanBenedicto.boiler.description', () => testKey('en', 'socorro.diveSites.sanBenedicto.boiler.description', "You drop onto a submerged seamount that rises to about 50m, and instantly you know why they call it a cleaning station. Giant mantas hover above you, letting tiny reef fish tend to their skin while you float just feet away — an encounter so intimate it feels private."))
  it('socorro.diveSites.sanBenedicto.boiler.fauna', () => testKey('en', 'socorro.diveSites.sanBenedicto.boiler.fauna', 'Giant oceanic mantas (6m+), bottlenose dolphins, amberjack, big eye jacks, black jacks, yellowfin tuna'))

  // San Benedicto — The Canyon
  it('socorro.diveSites.sanBenedicto.canyon.name', () => testKey('en', 'socorro.diveSites.sanBenedicto.canyon.name', 'The Canyon'))
  it('socorro.diveSites.sanBenedicto.canyon.description', () => testKey('en', 'socorro.diveSites.sanBenedicto.canyon.description', "The current carries you through a volcanic channel where mantas circle overhead with 4m+ wingspans. You might hear humpback whale songs vibrating through the water — an underwater soundtrack that follows your entire dive."))
  it('socorro.diveSites.sanBenedicto.canyon.fauna', () => testKey('en', 'socorro.diveSites.sanBenedicto.canyon.fauna', 'Giant mantas, black mantas, humpback whales (songs), whale sharks'))

  // Roca Partida
  it('socorro.diveSites.rocaPartida.rocaPartida.name', () => testKey('en', 'socorro.diveSites.rocaPartida.rocaPartida.name', 'Roca Partida'))
  it('socorro.diveSites.rocaPartida.rocaPartida.description', () => testKey('en', 'socorro.diveSites.rocaPartida.rocaPartida.description', "You're in the middle of the open ocean, six hours from the nearest island, floating beside a towering pinnacle with 70-80m vertical walls. The isolation is staggering — and so is the life it attracts. Hundreds of hammerheads swarm past as you hover at the reef edge."))
  it('socorro.diveSites.rocaPartida.rocaPartida.fauna', () => testKey('en', 'socorro.diveSites.rocaPartida.rocaPartida.fauna', 'Schooling hammerhead sharks (hundreds), silver-tip sharks, black jacks, tiger sharks, whale sharks, Galapagos sharks'))

  // Socorro Island — Cabo Pearce
  it('socorro.diveSites.socorroIsland.caboPearce.name', () => testKey('en', 'socorro.diveSites.socorroIsland.caboPearce.name', 'Cabo Pearce'))
  it('socorro.diveSites.socorroIsland.caboPearce.description', () => testKey('en', 'socorro.diveSites.socorroIsland.caboPearce.description', "This seamount stretches from Socorro Island into the open sea, and it delivers on every dive. You might watch dolphins hunting alongside mantas, hammerheads cruising past you, or — if you're incredibly lucky — a humpback breaching overhead as you ascend."))
  it('socorro.diveSites.socorroIsland.caboPearce.fauna', () => testKey('en', 'socorro.diveSites.socorroIsland.caboPearce.fauna', 'Bottlenose dolphins, hammerhead sharks, Galapagos sharks, silver-tip sharks, giant mantas (predation scenes), humpback whales'))

  // Calendar
  it('socorro.calendar.jan', () => testKey('en', 'socorro.calendar.jan', 'Humpback whales, giant mantas, hammerhead sharks, bottlenose dolphins'))
  it('socorro.calendar.feb', () => testKey('en', 'socorro.calendar.feb', 'Humpback whales (peak), giant mantas, hammerhead sharks, bottlenose dolphins'))
  it('socorro.calendar.mar', () => testKey('en', 'socorro.calendar.mar', 'Humpback whales (peak), giant mantas, hammerhead sharks, bottlenose dolphins'))
  it('socorro.calendar.apr', () => testKey('en', 'socorro.calendar.apr', 'Humpback whales, giant mantas, hammerhead sharks, bottlenose dolphins'))
  it('socorro.calendar.may', () => testKey('en', 'socorro.calendar.may', 'Giant mantas, hammerhead sharks, dolphins, whale sharks, false orcas, giant bait balls'))
  it('socorro.calendar.jun', () => testKey('en', 'socorro.calendar.jun', 'Giant mantas, hammerhead sharks, bottlenose dolphins'))
  it('socorro.calendar.jul', () => testKey('en', 'socorro.calendar.jul', 'Giant mantas, hammerhead sharks, bottlenose dolphins'))
  it('socorro.calendar.nov', () => testKey('en', 'socorro.calendar.nov', 'Giant mantas, hammerhead sharks, bottlenose dolphins, whale sharks'))
  it('socorro.calendar.dec', () => testKey('en', 'socorro.calendar.dec', 'Giant mantas, hammerhead sharks, bottlenose dolphins, whale sharks'))

  // Conservation
  it('socorro.conservation.unesco', () => testKey('en', 'socorro.conservation.unesco', 'UNESCO World Heritage Site'))
  it('socorro.conservation.protectedArea', () => testKey('en', 'socorro.conservation.protectedArea', 'Revillagigedo Archipelago National Park'))
  it('socorro.conservation.designation', () => testKey('en', 'socorro.conservation.designation', 'Designated in 2016'))

  // Gallery
  it('socorro.gallery.title', () => testKey('en', 'socorro.gallery.title', 'Gallery'))
  it('socorro.gallery.images', () => testKey('en', 'socorro.gallery.images', '[{"src":"/images/panoramicas/Isla Socorro.webp","alt":"Volcanic cliffs of Socorro Island rising from the Pacific"},{"src":"/images/panoramicas/Manta el Boiler 1.webp","alt":"Giant oceanic manta at The Boiler cleaning station"},{"src":"/images/panoramicas/Cabo Pearce .webp","alt":"Dramatic seascape at Cabo Pearce dive site"},{"src":"/images/panoramicas/ROca Partida .webp","alt":"Roca Partida rising from the open Pacific"},{"src":"/images/panoramicas/Pargos Roca.webp","alt":"School of snappers swarming Roca Partida"},{"src":"/images/panoramicas/Delfin Kike.webp","alt":"Bottlenose dolphins riding the bow wave"}]'))
})

describe('Destination translations — Socorro (ES)', () => {
  it('socorro.h5', () => testKey('es', 'socorro.h5', 'Tiburones Tigre y Sedosos'))
  it('socorro.h5d', () => testKey('es', 'socorro.h5d', 'Mientras derivás por paredes volcánicas, vas a reconocer las siluetas inconfundibles de tiburones tigre, puntas blancas oceánicos y tiburones sedosos. Se mueven con una confianza tranquila — y vos lo presenciás desde un brazo de distancia.'))
  it('socorro.h6', () => testKey('es', 'socorro.h6', 'Tiburones Ballena y Falsas Orcas'))
  it('socorro.h6d', () => testKey('es', 'socorro.h6d', 'Si tu viaje cae en noviembre, diciembre o mayo, podés encontrarte nadando al lado de un tiburón ballena — el pez más grande de la Tierra. Mayo también trae bolas de carnada gigantes y manadas de falsas orcas que transforman el océano en un espectáculo vivo.'))

  it('socorro.diveSites.title', () => testKey('es', 'socorro.diveSites.title', 'Sitios de Buceo'))

  // San Benedicto — El Boiler
  it('socorro.diveSites.sanBenedicto.boiler.name', () => testKey('es', 'socorro.diveSites.sanBenedicto.boiler.name', 'El Boiler'))
  it('socorro.diveSites.sanBenedicto.boiler.description', () => testKey('es', 'socorro.diveSites.sanBenedicto.boiler.description', 'Te dejás caer sobre un monte submarino que sube hasta unos 50m, y al instante entendés por qué le llaman estación de limpieza. Mantas gigantes flotan sobre vos, dejando que pequeños peces de arrecife les limpien la piel mientras vos flotás a metros — un encuentro tan íntimo que se siente privado.'))
  it('socorro.diveSites.sanBenedicto.boiler.fauna', () => testKey('es', 'socorro.diveSites.sanBenedicto.boiler.fauna', 'Mantas oceánicas gigantes (6m+), delfines nariz de botella, amberjack, jureles, atún aleta amarilla'))

  // San Benedicto — El Cañón
  it('socorro.diveSites.sanBenedicto.canyon.name', () => testKey('es', 'socorro.diveSites.sanBenedicto.canyon.name', 'El Cañón'))
  it('socorro.diveSites.sanBenedicto.canyon.description', () => testKey('es', 'socorro.diveSites.sanBenedicto.canyon.description', 'La corriente te lleva por un canal volcánico donde las mantas dan vueltas sobre tu cabeza con envergaduras de 4m+. Capaz que escuchás cantos de ballenas jorobadas vibrando en el agua — una banda sonora submarina que sigue toda tu inmersión.'))
  it('socorro.diveSites.sanBenedicto.canyon.fauna', () => testKey('es', 'socorro.diveSites.sanBenedicto.canyon.fauna', 'Mantas gigantes, mantas negras, ballenas jorobadas (cantos), tiburones ballena'))

  // Roca Partida
  it('socorro.diveSites.rocaPartida.rocaPartida.name', () => testKey('es', 'socorro.diveSites.rocaPartida.rocaPartida.name', 'Roca Partida'))
  it('socorro.diveSites.rocaPartida.rocaPartida.description', () => testKey('es', 'socorro.diveSites.rocaPartida.rocaPartida.description', 'Estás en medio del océano abierto, a seis horas de la isla más cercana, flotando al lado de un pináculo imponente con paredes verticales de 70-80m. El aislamiento es abrumador — y también lo es la vida que atrae. Cientos de tiburones martillo pasan en formación mientras vos flotás en el borde del arrecife.'))
  it('socorro.diveSites.rocaPartida.rocaPartida.fauna', () => testKey('es', 'socorro.diveSites.rocaPartida.rocaPartida.fauna', 'Bancos de tiburones martillo (cientos), tiburones punta plateada, jureles negros, tiburones tigre, tiburones ballena, tiburones Galápagos'))

  // Socorro Island — Cabo Pearce
  it('socorro.diveSites.socorroIsland.caboPearce.name', () => testKey('es', 'socorro.diveSites.socorroIsland.caboPearce.name', 'Cabo Pearce'))
  it('socorro.diveSites.socorroIsland.caboPearce.description', () => testKey('es', 'socorro.diveSites.socorroIsland.caboPearce.description', 'Este monte marino se extiende desde la Isla Socorro hacia el mar abierto, y entrega en cada inmersión. Vas a poder ver delfines cazando junto a mantas, tiburones martillo pasando a tu lado o — si tenés mucha suerte — una ballena jorobada saltando sobre tu cabeza mientras ascendés.'))
  it('socorro.diveSites.socorroIsland.caboPearce.fauna', () => testKey('es', 'socorro.diveSites.socorroIsland.caboPearce.fauna', 'Delfines nariz de botella, tiburones martillo, tiburones Galápagos, tiburones punta plateada, mantas gigantes (escenas de depredación), ballenas jorobadas'))

  // Calendar
  it('socorro.calendar.jan', () => testKey('es', 'socorro.calendar.jan', 'Ballenas jorobadas, mantas gigantes, tiburones martillo, delfines nariz de botella'))
  it('socorro.calendar.feb', () => testKey('es', 'socorro.calendar.feb', 'Ballenas jorobadas (pico), mantas gigantes, tiburones martillo, delfines nariz de botella'))
  it('socorro.calendar.mar', () => testKey('es', 'socorro.calendar.mar', 'Ballenas jorobadas (pico), mantas gigantes, tiburones martillo, delfines nariz de botella'))
  it('socorro.calendar.apr', () => testKey('es', 'socorro.calendar.apr', 'Ballenas jorobadas, mantas gigantes, tiburones martillo, delfines nariz de botella'))
  it('socorro.calendar.may', () => testKey('es', 'socorro.calendar.may', 'Mantas gigantes, tiburones martillo, delfines, tiburones ballena, falsas orcas, bolas de carnada gigantes'))
  it('socorro.calendar.jun', () => testKey('es', 'socorro.calendar.jun', 'Mantas gigantes, tiburones martillo, delfines nariz de botella'))
  it('socorro.calendar.jul', () => testKey('es', 'socorro.calendar.jul', 'Mantas gigantes, tiburones martillo, delfines nariz de botella'))
  it('socorro.calendar.nov', () => testKey('es', 'socorro.calendar.nov', 'Mantas gigantes, tiburones martillo, delfines nariz de botella, tiburones ballena'))
  it('socorro.calendar.dec', () => testKey('es', 'socorro.calendar.dec', 'Mantas gigantes, tiburones martillo, delfines nariz de botella, tiburones ballena'))

  // Conservation
  it('socorro.conservation.unesco', () => testKey('es', 'socorro.conservation.unesco', 'Patrimonio Mundial de la UNESCO'))
  it('socorro.conservation.protectedArea', () => testKey('es', 'socorro.conservation.protectedArea', 'Parque Nacional Archipiélago de Revillagigedo'))
  it('socorro.conservation.designation', () => testKey('es', 'socorro.conservation.designation', 'Designado en 2016'))

  // Gallery
  it('socorro.gallery.title', () => testKey('es', 'socorro.gallery.title', 'Galería'))
  it('socorro.gallery.images', () => testKey('es', 'socorro.gallery.images', '[{"src":"/images/panoramicas/Isla Socorro.webp","alt":"Acantilados volcánicos de la Isla Socorro emergiendo del Pacífico"},{"src":"/images/panoramicas/Manta el Boiler 1.webp","alt":"Manta oceánica gigante en la estación de limpieza de El Boiler"},{"src":"/images/panoramicas/Cabo Pearce .webp","alt":"Paisaje marino en el sitio de buceo Cabo Pearce"},{"src":"/images/panoramicas/ROca Partida .webp","alt":"Roca Partida emergiendo del Pacífico abierto"},{"src":"/images/panoramicas/Pargos Roca.webp","alt":"Cardumen de pargos en Roca Partida"},{"src":"/images/panoramicas/Delfin Kike.webp","alt":"Delfines nariz de botella jugando en la proa"}]'))
})

describe('Destination translations — Cortez (EN)', () => {
  it('cortez.h5', () => testKey('en', 'cortez.h5', 'Mobula Rays'))
  it('cortez.h5d', () => testKey('en', 'cortez.h5d', 'From July through October, you\'ll witness one of the ocean\'s great spectacles: thousands of mobula rays gathering at Punta Lobo, leaping from the water and packing the sea from surface to floor. It\'s a show you won\'t believe until you see it.'))
  it('cortez.h6', () => testKey('en', 'cortez.h6', 'Macro Life & Wrecks'))
  it('cortez.h6d', () => testKey('en', 'cortez.h6d', 'You\'ll hover inches from the sand, watching Bluespotted Jawfish tend their burrows and Signal blennies flash their dorsal fins. Then you\'ll explore the 80-meter Salvatierra ferry wreck, where oversized reef fish have turned a sunken ship into their home.'))

  it('cortez.diveSites.title', () => testKey('en', 'cortez.diveSites.title', 'Dive Sites'))

  // La Paz Bay — Los Islotes
  it('cortez.diveSites.laPazBay.losIslotes.name', () => testKey('en', 'cortez.diveSites.laPazBay.losIslotes.name', 'Los Islotes'))
  it('cortez.diveSites.laPazBay.losIslotes.description', () => testKey('en', 'cortez.diveSites.laPazBay.losIslotes.description', 'You descend onto a rocky islet that\'s home to over 400 California sea lions — and they know you\'re coming. Pups start playing with you in September, nibbling your fins and snorkel in the south-side cave while you laugh into your regulator.'))
  it('cortez.diveSites.laPazBay.losIslotes.fauna', () => testKey('en', 'cortez.diveSites.laPazBay.losIslotes.fauna', '400+ California sea lions, Bluespotted Jawfish, sardine schools, mobula rays, Mexican barracudas, gobies, nudibranchs'))

  // La Paz Bay — La Paz Bay
  it('cortez.diveSites.laPazBay.laPazBay.name', () => testKey('en', 'cortez.diveSites.laPazBay.laPazBay.name', 'La Paz Bay'))
  it('cortez.diveSites.laPazBay.laPazBay.description', () => testKey('en', 'cortez.diveSites.laPazBay.laPazBay.description', 'La Paz Bay has become one of the most reliable places on Earth to swim with whale sharks. You\'ll find them feeding gently in these nutrient-rich waters — the world\'s largest fish, right beside you.'))
  it('cortez.diveSites.laPazBay.laPazBay.fauna', () => testKey('en', 'cortez.diveSites.laPazBay.laPazBay.fauna', 'Whale sharks'))

  // La Paz Bay — Swannee Reef
  it('cortez.diveSites.laPazBay.swanneeReef.name', () => testKey('en', 'cortez.diveSites.laPazBay.swanneeReef.name', 'Swannee Reef'))
  it('cortez.diveSites.laPazBay.swanneeReef.description', () => testKey('en', 'cortez.diveSites.laPazBay.swanneeReef.description', 'An isolated reef on a white sand bottom — a fish paradise where you\'ll float weightless above the coral. Watch Signal blennies pop out of their holes, flashing their dorsal fins three times before retreating, as if playing peek-a-boo with you.'))
  it('cortez.diveSites.laPazBay.swanneeReef.fauna', () => testKey('en', 'cortez.diveSites.laPazBay.swanneeReef.fauna', 'Mexican goatfish, Spottail grunt, Signal blennies, barracudas, skip jacks, sea lions (occasional)'))

  // La Paz Bay — Salvatierra
  it('cortez.diveSites.laPazBay.salvatierra.name', () => testKey('en', 'cortez.diveSites.laPazBay.salvatierra.name', 'Salvatierra Wreck'))
  it('cortez.diveSites.laPazBay.salvatierra.description', () => testKey('en', 'cortez.diveSites.laPazBay.salvatierra.description', 'You\'ll explore an 80-meter ferry sitting almost perfectly intact at 20m depth. It\'s become a thriving artificial reef, with unusually large grunts and angelfish that have claimed this sunken giant as their own.'))
  it('cortez.diveSites.laPazBay.salvatierra.fauna', () => testKey('en', 'cortez.diveSites.laPazBay.salvatierra.fauna', 'Unusually large grunts and angelfish, reef fish'))

  // La Paz Bay — El Corralito
  it('cortez.diveSites.laPazBay.elCorralito.name', () => testKey('en', 'cortez.diveSites.laPazBay.elCorralito.name', 'El Corralito'))
  it('cortez.diveSites.laPazBay.elCorralito.description', () => testKey('en', 'cortez.diveSites.laPazBay.elCorralito.description', 'You\'ll notice them immediately — giant jawfishes, noticeably larger here than anywhere else in the Sea of Cortez. They hover above their burrows like tiny submarines, watching you as curiously as you watch them.'))
  it('cortez.diveSites.laPazBay.elCorralito.fauna', () => testKey('en', 'cortez.diveSites.laPazBay.elCorralito.fauna', 'Giant jawfishes'))

  // Northern Islands — El Bajo
  it('cortez.diveSites.northernIslands.elBajo.name', () => testKey('en', 'cortez.diveSites.northernIslands.elBajo.name', 'El Bajo'))
  it('cortez.diveSites.northernIslands.elBajo.description', () => testKey('en', 'cortez.diveSites.northernIslands.elBajo.description', 'Three seamounts rise to 18-22m, and you\'ll drift through them surrounded by hundreds of hammerheads — adults and juveniles alike — snaking past you so close you could count the serrations on their cephalofoils.'))
  it('cortez.diveSites.northernIslands.elBajo.fauna', () => testKey('en', 'cortez.diveSites.northernIslands.elBajo.fauna', 'Hammerhead sharks (hundreds, adults and juveniles), bonitos, skip jacks, marlin, whale sharks'))

  // Northern Islands — Whale Island
  it('cortez.diveSites.northernIslands.whaleIsland.name', () => testKey('en', 'cortez.diveSites.northernIslands.whaleIsland.name', 'Whale Island'))
  it('cortez.diveSites.northernIslands.whaleIsland.description', () => testKey('en', 'cortez.diveSites.northernIslands.whaleIsland.description', 'Shaped like a whale and just as dramatic, this precipitous island hides caves on its southwest side. You\'ll swim through passages filled with seafans, spotting Cortez angelfish that exist only in these waters.'))
  it('cortez.diveSites.northernIslands.whaleIsland.fauna', () => testKey('en', 'cortez.diveSites.northernIslands.whaleIsland.fauna', 'Cortez angelfish, seafans, reef fish'))

  // Northern Islands — San Francisquito
  it('cortez.diveSites.northernIslands.sanFrancisquito.name', () => testKey('en', 'cortez.diveSites.northernIslands.sanFrancisquito.name', 'San Francisquito'))
  it('cortez.diveSites.northernIslands.sanFrancisquito.description', () => testKey('en', 'cortez.diveSites.northernIslands.sanFrancisquito.description', 'Only reachable by liveaboard — which means you\'ll have it to yourself. Without the territorial competition of busier sites, the sea lions here are calmer, more relaxed, and more curious about you.'))
  it('cortez.diveSites.northernIslands.sanFrancisquito.fauna', () => testKey('en', 'cortez.diveSites.northernIslands.sanFrancisquito.fauna', 'California sea lions (calm, relaxed), reef fish'))

  // East Cape — Las Ánimas
  it('cortez.diveSites.eastCape.lasAnimas.name', () => testKey('en', 'cortez.diveSites.eastCape.lasAnimas.name', 'Las Ánimas'))
  it('cortez.diveSites.eastCape.lasAnimas.description', () => testKey('en', 'cortez.diveSites.eastCape.lasAnimas.description', 'Also liveaboard-only — you\'ll watch giant diamond stingrays glide among colorful seafans while big eye trevallies swirl around you in tight formation. Hammerhead sharks and sea turtles make regular appearances.'))
  it('cortez.diveSites.eastCape.lasAnimas.fauna', () => testKey('en', 'cortez.diveSites.eastCape.lasAnimas.fauna', 'Longnose hawkfish, giant diamond stingrays, seafans, big eye trevallies, hammerhead sharks, sea turtles'))

  // East Cape — Cabo Pulmo / Gordo Banks
  it('cortez.diveSites.eastCape.caboPulmo.name', () => testKey('en', 'cortez.diveSites.eastCape.caboPulmo.name', 'Cabo Pulmo / Gordo Banks'))
  it('cortez.diveSites.eastCape.caboPulmo.description', () => testKey('en', 'cortez.diveSites.eastCape.caboPulmo.description', 'Eight miles offshore at depths up to 40m with powerful currents — this one\'s for advanced divers only. But if you\'re up for it, you\'ll be rewarded with massive schools of jacks and the silent presence of bull sharks at one of the region\'s top spots.'))
  it('cortez.diveSites.eastCape.caboPulmo.fauna', () => testKey('en', 'cortez.diveSites.eastCape.caboPulmo.fauna', 'Large schools of jacks, bull sharks, reef fish'))

  // Calendar
  it('cortez.calendar.aug', () => testKey('en', 'cortez.calendar.aug', 'Whale sharks, hammerhead sharks, mobula rays (season starts), sea lions'))
  it('cortez.calendar.sep', () => testKey('en', 'cortez.calendar.sep', 'Whale sharks, hammerhead sharks, mobula rays (peak — thousands), sea lions (pups start playing with divers)'))
  it('cortez.calendar.oct', () => testKey('en', 'cortez.calendar.oct', 'Whale sharks, hammerhead sharks, mobula rays (peak), sea lions'))
  it('cortez.calendar.nov', () => testKey('en', 'cortez.calendar.nov', 'Sea lions (high activity), hammerhead sharks, whale sharks (fading), mobula rays'))

  // Conservation
  it('cortez.conservation.unesco', () => testKey('en', 'cortez.conservation.unesco', 'UNESCO World Heritage Site'))
  it('cortez.conservation.protectedArea', () => testKey('en', 'cortez.conservation.protectedArea', 'Islands and Protected Areas of the Gulf of California'))
  it('cortez.conservation.designation', () => testKey('en', 'cortez.conservation.designation', 'Designated in 2005'))

  // Gallery
  it('cortez.gallery.title', () => testKey('en', 'cortez.gallery.title', 'Gallery'))
  it('cortez.gallery.images', () => testKey('en', 'cortez.gallery.images', '[{"src":"/images/panoramicas/PuntaTosca.webp","alt":"Rugged coastline of Punta Tosca, Baja California Sur"},{"src":"/seacortes.webp","alt":"Sea of Cortez"},{"src":"/images/panoramicas/Delfin Kike.webp","alt":"Bottlenose dolphin swimming beside a scuba diver"},{"src":"/images/panoramicas/Puntas blancas 1.webp","alt":"Whitetip reef shark swimming among reef fish"},{"src":"/images/panoramicas/Manta Clariones.webp","alt":"Manta ray gliding through crystal-clear waters"}]'))
})

describe('Destination translations — Cortez (ES)', () => {
  it('cortez.h5', () => testKey('es', 'cortez.h5', 'Mantarrayas Mobula'))
  it('cortez.h5d', () => testKey('es', 'cortez.h5d', 'De julio a octubre, vas a presenciar uno de los grandes espectáculos del océano: miles de mantarrayas mobula reuniéndose en Punta Lobo, saltando del agua y llenando el mar de superficie a fondo. Es un show que no creés hasta que lo ves.'))
  it('cortez.h6', () => testKey('es', 'cortez.h6', 'Vida Macro y Naufragios'))
  it('cortez.h6d', () => testKey('es', 'cortez.h6d', 'Vas a flotar a centímetros de la arena, mirando Bluespotted Jawfish cuidar sus madrigueras y Signal blennies mostrando sus aletas dorsales. Después explorás el ferry Salvatierra de 80 metros, donde peces de arrecife de tamaño excepcional han convertido un barco hundido en su hogar.'))

  it('cortez.diveSites.title', () => testKey('es', 'cortez.diveSites.title', 'Sitios de Buceo'))

  // La Paz Bay — Los Islotes
  it('cortez.diveSites.laPazBay.losIslotes.name', () => testKey('es', 'cortez.diveSites.laPazBay.losIslotes.name', 'Los Islotes'))
  it('cortez.diveSites.laPazBay.losIslotes.description', () => testKey('es', 'cortez.diveSites.laPazBay.losIslotes.description', 'Descendés sobre un islote rocoso que es hogar de más de 400 lobos marinos de California — y ellos saben que venís. Las crías empiezan a jugar con vos en septiembre, mordisqueando tus aletas y tu snorkel en la cueva del lado sur mientras te reís dentro del regulador.'))
  it('cortez.diveSites.laPazBay.losIslotes.fauna', () => testKey('es', 'cortez.diveSites.laPazBay.losIslotes.fauna', '400+ lobos marinos de California, Bluespotted Jawfish, cardúmenes de sardinas, mantarrayas mobula, barracudas mexicanas, gobios, nudibranquios'))

  // La Paz Bay — Bahía de La Paz
  it('cortez.diveSites.laPazBay.laPazBay.name', () => testKey('es', 'cortez.diveSites.laPazBay.laPazBay.name', 'Bahía de La Paz'))
  it('cortez.diveSites.laPazBay.laPazBay.description', () => testKey('es', 'cortez.diveSites.laPazBay.laPazBay.description', 'La Bahía de La Paz se ha convertido en uno de los lugares más confiables del mundo para nadar con tiburones ballena. Los vas a encontrar alimentándose suavemente en estas aguas ricas en nutrientes — el pez más grande del mundo, justo al lado tuyo.'))
  it('cortez.diveSites.laPazBay.laPazBay.fauna', () => testKey('es', 'cortez.diveSites.laPazBay.laPazBay.fauna', 'Tiburones ballena'))

  // La Paz Bay — Arrecife Swannee
  it('cortez.diveSites.laPazBay.swanneeReef.name', () => testKey('es', 'cortez.diveSites.laPazBay.swanneeReef.name', 'Arrecife Swannee'))
  it('cortez.diveSites.laPazBay.swanneeReef.description', () => testKey('es', 'cortez.diveSites.laPazBay.swanneeReef.description', 'Un arrecife aislado sobre un fondo de arena blanca — un paraíso de peces donde vas a flotar ingrávido sobre el coral. Mirá los Signal blennies salir de sus agujeros, mostrando sus aletas dorsales tres veces antes de esconderse, como jugando a las escondidas con vos.'))
  it('cortez.diveSites.laPazBay.swanneeReef.fauna', () => testKey('es', 'cortez.diveSites.laPazBay.swanneeReef.fauna', 'Goatfish mexicanos, Spottail grunt, Signal blennies, barracudas, skip jacks, lobos marinos (ocasionales)'))

  // La Paz Bay — Naufragio Salvatierra
  it('cortez.diveSites.laPazBay.salvatierra.name', () => testKey('es', 'cortez.diveSites.laPazBay.salvatierra.name', 'Naufragio Salvatierra'))
  it('cortez.diveSites.laPazBay.salvatierra.description', () => testKey('es', 'cortez.diveSites.laPazBay.salvatierra.description', 'Vas a explorar un ferry de 80 metros sentado casi perfectamente intacto a 20m de profundidad. Se ha convertido en un arrecife artificial próspero, con grunts y peces ángel de tamaño excepcional que han reclamado este gigante hundido como propio.'))
  it('cortez.diveSites.laPazBay.salvatierra.fauna', () => testKey('es', 'cortez.diveSites.laPazBay.salvatierra.fauna', 'Grunts y peces ángel de tamaño excepcional, peces de arrecife'))

  // La Paz Bay — El Corralito
  it('cortez.diveSites.laPazBay.elCorralito.name', () => testKey('es', 'cortez.diveSites.laPazBay.elCorralito.name', 'El Corralito'))
  it('cortez.diveSites.laPazBay.elCorralito.description', () => testKey('es', 'cortez.diveSites.laPazBay.elCorralito.description', 'Los vas a notar inmediatamente — jawfishes gigantes, notablemente más grandes acá que en cualquier otro lugar del Mar de Cortés. Flotan sobre sus madrigueras como submarinos diminutos, mirándote con tanta curiosidad como vos a ellos.'))
  it('cortez.diveSites.laPazBay.elCorralito.fauna', () => testKey('es', 'cortez.diveSites.laPazBay.elCorralito.fauna', 'Jawfishes gigantes'))

  // Northern Islands — El Bajo
  it('cortez.diveSites.northernIslands.elBajo.name', () => testKey('es', 'cortez.diveSites.northernIslands.elBajo.name', 'El Bajo'))
  it('cortez.diveSites.northernIslands.elBajo.description', () => testKey('es', 'cortez.diveSites.northernIslands.elBajo.description', 'Tres montes marinos suben hasta 18-22m, y vas a derivar entre ellos rodeado de cientos de tiburones martillo — adultos y juveniles — pasando tan cerca que podrías contar las serraciones en sus cabezas.'))
  it('cortez.diveSites.northernIslands.elBajo.fauna', () => testKey('es', 'cortez.diveSites.northernIslands.elBajo.fauna', 'Tiburones martillo (cientos, adultos y juveniles), bonitos, skip jacks, marlines, tiburones ballena'))

  // Northern Islands — Isla Ballena
  it('cortez.diveSites.northernIslands.whaleIsland.name', () => testKey('es', 'cortez.diveSites.northernIslands.whaleIsland.name', 'Isla Ballena'))
  it('cortez.diveSites.northernIslands.whaleIsland.description', () => testKey('es', 'cortez.diveSites.northernIslands.whaleIsland.description', 'Con forma de ballena e igual de dramática, esta isla escarpada esconde cuevas en su lado suroeste. Vas a nadar por pasajes llenos de abanicos de mar, encontrando peces ángel de Cortés que solo existen en estas aguas.'))
  it('cortez.diveSites.northernIslands.whaleIsland.fauna', () => testKey('es', 'cortez.diveSites.northernIslands.whaleIsland.fauna', 'Pez ángel de Cortés, abanicos de mar, peces de arrecife'))

  // Northern Islands — San Francisquito
  it('cortez.diveSites.northernIslands.sanFrancisquito.name', () => testKey('es', 'cortez.diveSites.northernIslands.sanFrancisquito.name', 'San Francisquito'))
  it('cortez.diveSites.northernIslands.sanFrancisquito.description', () => testKey('es', 'cortez.diveSites.northernIslands.sanFrancisquito.description', 'Solo accesible por liveaboard — lo que significa que lo vas a tener para vos solo. Sin la competencia territorial de sitios más concurridos, los lobos marinos acá son más tranquilos, más relajados, y más curiosos con vos.'))
  it('cortez.diveSites.northernIslands.sanFrancisquito.fauna', () => testKey('es', 'cortez.diveSites.northernIslands.sanFrancisquito.fauna', 'Lobos marinos de California (tranquilos, relajados), peces de arrecife'))

  // East Cape — Las Ánimas
  it('cortez.diveSites.eastCape.lasAnimas.name', () => testKey('es', 'cortez.diveSites.eastCape.lasAnimas.name', 'Las Ánimas'))
  it('cortez.diveSites.eastCape.lasAnimas.description', () => testKey('es', 'cortez.diveSites.eastCape.lasAnimas.description', 'También solo por liveaboard — vas a ver rayas diamante gigantes deslizarse entre coloridos abanicos de mar mientras big eye trevallies giran a tu alrededor en formación cerrada. Tiburones martillo y tortugas marinas aparecen regularmente.'))
  it('cortez.diveSites.eastCape.lasAnimas.fauna', () => testKey('es', 'cortez.diveSites.eastCape.lasAnimas.fauna', 'Longnose hawkfish, rayas diamante gigantes, abanicos de mar, big eye trevallies, tiburones martillo, tortugas marinas'))

  // East Cape — Cabo Pulmo / Gordo Banks
  it('cortez.diveSites.eastCape.caboPulmo.name', () => testKey('es', 'cortez.diveSites.eastCape.caboPulmo.name', 'Cabo Pulmo / Gordo Banks'))
  it('cortez.diveSites.eastCape.caboPulmo.description', () => testKey('es', 'cortez.diveSites.eastCape.caboPulmo.description', 'A ocho millas de la costa, profundidades de hasta 40m con corrientes poderosas — esto es solo para buzos avanzados. Pero si te animás, la recompensa son cardúmenes masivos de jureles y la presencia silenciosa de tiburones toro en uno de los mejores sitios de la región.'))
  it('cortez.diveSites.eastCape.caboPulmo.fauna', () => testKey('es', 'cortez.diveSites.eastCape.caboPulmo.fauna', 'Grandes cardúmenes de jureles, tiburones toro, peces de arrecife'))

  // Calendar
  it('cortez.calendar.aug', () => testKey('es', 'cortez.calendar.aug', 'Tiburones ballena, tiburones martillo, mantarrayas mobula (inicio de temporada), lobos marinos'))
  it('cortez.calendar.sep', () => testKey('es', 'cortez.calendar.sep', 'Tiburones ballena, tiburones martillo, mantarrayas mobula (pico — miles), lobos marinos (crías empiezan a jugar con buzos)'))
  it('cortez.calendar.oct', () => testKey('es', 'cortez.calendar.oct', 'Tiburones ballena, tiburones martillo, mantarrayas mobula (pico), lobos marinos'))
  it('cortez.calendar.nov', () => testKey('es', 'cortez.calendar.nov', 'Lobos marinos (alta actividad), tiburones martillo, tiburones ballena (disminuyendo), mantarrayas mobula'))

  // Conservation
  it('cortez.conservation.unesco', () => testKey('es', 'cortez.conservation.unesco', 'Patrimonio Mundial de la UNESCO'))
  it('cortez.conservation.protectedArea', () => testKey('es', 'cortez.conservation.protectedArea', 'Islas y Áreas Protegidas del Golfo de California'))
  it('cortez.conservation.designation', () => testKey('es', 'cortez.conservation.designation', 'Designado en 2005'))

  // Gallery
  it('cortez.gallery.title', () => testKey('es', 'cortez.gallery.title', 'Galería'))
  it('cortez.gallery.images', () => testKey('es', 'cortez.gallery.images', '[{"src":"/images/panoramicas/PuntaTosca.webp","alt":"Escarpada costa de Punta Tosca, Baja California Sur"},{"src":"/seacortes.webp","alt":"Mar de Cortés"},{"src":"/images/panoramicas/Delfin Kike.webp","alt":"Delfín nariz de botella nadando junto a un buzo"},{"src":"/images/panoramicas/Puntas blancas 1.webp","alt":"Tiburón de arrecife de punta blanca nadando entre peces"},{"src":"/images/panoramicas/Manta Clariones.webp","alt":"Manta raya deslizándose en aguas cristalinas"}]'))
})

describe('Destination translations — Magbay (EN)', () => {
  it('magbay.h5', () => testKey('en', 'magbay.h5', 'Mexico Sardine Run'))
  it('magbay.h5d', () => testKey('en', 'magbay.h5d', 'If your trip falls between October and December, you\'ll witness the Pacific side of Baja explode with life during the annual sardine run. Striped marlin, seabirds, and cetaceans turn the water into a feeding frenzy — nature at its most raw and spectacular.'))
  it('magbay.h6', () => testKey('en', 'magbay.h6', '14-Day Expedition'))
  it('magbay.h6d', () => testKey('en', 'magbay.h6d', 'Two worlds in one trip: the quiet intimacy of whale encounters in the lagoon, followed by the adrenaline of big-animal diving with mantas, sharks, and dolphins at the Revillagigedo Archipelago. You get the full spectrum of what the Mexican Pacific has to offer.'))

  // Calendar
  it('magbay.calendar.jan', () => testKey('en', 'magbay.calendar.jan', 'Gray whales (peak), mothers and calves in the lagoon'))
  it('magbay.calendar.feb', () => testKey('en', 'magbay.calendar.feb', 'Gray whales (peak), intimate close encounters'))
  it('magbay.calendar.mar', () => testKey('en', 'magbay.calendar.mar', 'Gray whales (peak), mothers and calves'))
  it('magbay.calendar.apr', () => testKey('en', 'magbay.calendar.apr', 'Gray whales (final weeks)'))
  it('magbay.calendar.oct', () => testKey('en', 'magbay.calendar.oct', 'Sardine run begins — striped marlin, seabirds, cetaceans'))
  it('magbay.calendar.nov', () => testKey('en', 'magbay.calendar.nov', 'Sardine run (peak), Pacific explosion of life'))
  it('magbay.calendar.dec', () => testKey('en', 'magbay.calendar.dec', 'Sardine run, massive bait balls'))

  // Conservation
  it('magbay.conservation.unesco', () => testKey('en', 'magbay.conservation.unesco', 'UNESCO Whale Sanctuary'))
  it('magbay.conservation.protectedArea', () => testKey('en', 'magbay.conservation.protectedArea', 'Bahía Magdalena Protected Lagoon'))
  it('magbay.conservation.designation', () => testKey('en', 'magbay.conservation.designation', 'Part of the UNESCO World Heritage Site'))

  // Gallery
  it('magbay.gallery.title', () => testKey('en', 'magbay.gallery.title', 'Gallery'))
  it('magbay.gallery.images', () => testKey('en', 'magbay.gallery.images', '[{"src":"/balllenahero.webp","alt":"Gray whale breaching in the protected waters of Magdalena Bay"},{"src":"/espada.webp","alt":"Swordfish in the sardine run"},{"src":"/ballena1.jpeg","alt":"Gray whale tail at sunset in Magdalena Bay"},{"src":"/ballena2.jpeg","alt":"Gray whale spyhopping near the coast of Magdalena Bay"}]'))
})

describe('Destination translations — Magbay (ES)', () => {
  it('magbay.h5', () => testKey('es', 'magbay.h5', 'Corrida de Sardinas de México'))
  it('magbay.h5d', () => testKey('es', 'magbay.h5d', 'Si tu viaje cae entre octubre y diciembre, vas a presenciar el lado Pacífico de Baja explotar de vida durante la corrida anual de sardinas. Marlines rayados, aves marinas y cetáceos transforman el agua en un frenesí alimenticio — la naturaleza en su estado más crudo y espectacular.'))
  it('magbay.h6', () => testKey('es', 'magbay.h6', 'Expedición de 14 Días'))
  it('magbay.h6d', () => testKey('es', 'magbay.h6d', 'Dos mundos en un solo viaje: la intimidad tranquila de los encuentros con ballenas en la laguna, seguida de la adrenalina del buceo con animales grandes — mantas, tiburones y delfines — en el Archipiélago de Revillagigedo. Te llevás el espectro completo de lo que el Pacífico mexicano tiene para ofrecer.'))

  // Calendar
  it('magbay.calendar.jan', () => testKey('es', 'magbay.calendar.jan', 'Ballenas grises (pico), madres y crías en la laguna'))
  it('magbay.calendar.feb', () => testKey('es', 'magbay.calendar.feb', 'Ballenas grises (pico), encuentros cercanos íntimos'))
  it('magbay.calendar.mar', () => testKey('es', 'magbay.calendar.mar', 'Ballenas grises (pico), madres y crías'))
  it('magbay.calendar.apr', () => testKey('es', 'magbay.calendar.apr', 'Ballenas grises (últimas semanas)'))
  it('magbay.calendar.oct', () => testKey('es', 'magbay.calendar.oct', 'Comienza la corrida de sardinas — marlines rayados, aves marinas, cetáceos'))
  it('magbay.calendar.nov', () => testKey('es', 'magbay.calendar.nov', 'Corrida de sardinas (pico), explosión de vida en el Pacífico'))
  it('magbay.calendar.dec', () => testKey('es', 'magbay.calendar.dec', 'Corrida de sardinas, bolas de carnada masivas'))

  // Conservation
  it('magbay.conservation.unesco', () => testKey('es', 'magbay.conservation.unesco', 'Santuario Ballenero de la UNESCO'))
  it('magbay.conservation.protectedArea', () => testKey('es', 'magbay.conservation.protectedArea', 'Laguna Protegida Bahía Magdalena'))
  it('magbay.conservation.designation', () => testKey('es', 'magbay.conservation.designation', 'Parte del Patrimonio Mundial de la UNESCO'))

  // Gallery
  it('magbay.gallery.title', () => testKey('es', 'magbay.gallery.title', 'Galería'))
  it('magbay.gallery.images', () => testKey('es', 'magbay.gallery.images', '[{"src":"/balllenahero.webp","alt":"Ballena gris emergiendo en las aguas protegidas de Bahía Magdalena"},{"src":"/espada.webp","alt":"Pez espada en la corrida de sardinas"},{"src":"/ballena1.jpeg","alt":"Cola de ballena gris al atardecer en Bahía Magdalena"},{"src":"/ballena2.jpeg","alt":"Ballena gris asomando la cabeza cerca de la costa de Bahía Magdalena"}]'))
})
