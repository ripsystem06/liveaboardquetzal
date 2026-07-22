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
  it('socorro.h5d', () => testKey('en', 'socorro.h5d', 'Oceanic predators including tiger sharks, silky sharks, and oceanic white-tips patrol the deep blue waters around these volcanic islands.'))
  it('socorro.h6', () => testKey('en', 'socorro.h6', 'Whale Sharks & False Orcas'))
  it('socorro.h6d', () => testKey('en', 'socorro.h6d', 'Whale sharks visit in November, December, and May. May also brings giant bait balls and pods of false orcas.'))

  it('socorro.diveSites.title', () => testKey('en', 'socorro.diveSites.title', 'Dive Sites'))

  // San Benedicto — The Boiler
  it('socorro.diveSites.sanBenedicto.boiler.name', () => testKey('en', 'socorro.diveSites.sanBenedicto.boiler.name', 'The Boiler'))
  it('socorro.diveSites.sanBenedicto.boiler.description', () => testKey('en', 'socorro.diveSites.sanBenedicto.boiler.description', 'A submerged seamount rising from the ocean floor to about 50m — a renowned manta cleaning station where giants gather.'))
  it('socorro.diveSites.sanBenedicto.boiler.fauna', () => testKey('en', 'socorro.diveSites.sanBenedicto.boiler.fauna', 'Giant oceanic mantas (up to 6m+), bottlenose dolphins, amberjack, big eye jacks, black jacks, yellowfin tuna'))

  // San Benedicto — The Canyon
  it('socorro.diveSites.sanBenedicto.canyon.name', () => testKey('en', 'socorro.diveSites.sanBenedicto.canyon.name', 'The Canyon'))
  it('socorro.diveSites.sanBenedicto.canyon.description', () => testKey('en', 'socorro.diveSites.sanBenedicto.canyon.description', 'Large mantas wander this site — 4m+ wingspans circling overhead. Humpback whale songs are often audible underwater.'))
  it('socorro.diveSites.sanBenedicto.canyon.fauna', () => testKey('en', 'socorro.diveSites.sanBenedicto.canyon.fauna', 'Giant mantas, black mantas, humpback whales (songs), whale sharks'))

  // Roca Partida
  it('socorro.diveSites.rocaPartida.rocaPartida.name', () => testKey('en', 'socorro.diveSites.rocaPartida.rocaPartida.name', 'Roca Partida'))
  it('socorro.diveSites.rocaPartida.rocaPartida.description', () => testKey('en', 'socorro.diveSites.rocaPartida.rocaPartida.description', 'A huge reef towering in the middle of the open ocean with 70-80m walls. So remote it takes 6 hours by ship from San Benedicto.'))
  it('socorro.diveSites.rocaPartida.rocaPartida.fauna', () => testKey('en', 'socorro.diveSites.rocaPartida.rocaPartida.fauna', 'Schooling hammerhead sharks (hundreds), silver-tip sharks, black jacks, tiger sharks, whale sharks, Galapagos sharks'))

  // Socorro Island — Cabo Pearce
  it('socorro.diveSites.socorroIsland.caboPearce.name', () => testKey('en', 'socorro.diveSites.socorroIsland.caboPearce.name', 'Cabo Pearce'))
  it('socorro.diveSites.socorroIsland.caboPearce.description', () => testKey('en', 'socorro.diveSites.socorroIsland.caboPearce.description', 'A seamount stretching toward the open sea off Socorro Island. Multiple big-creature encounters on every dive.'))
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
  it('socorro.gallery.images', () => testKey('en', 'socorro.gallery.images', '[{"src":"/images/panoramicas/Isla Socorro.webp","alt":"Volcanic cliffs of Socorro Island rising from the Pacific"},{"src":"/images/panoramicas/Manta el Boiler 1.webp","alt":"Giant oceanic manta at The Boiler cleaning station"},{"src":"/images/panoramicas/Cabo Pearce .webp","alt":"Dramatic seascape at Cabo Pearce dive site"},{"src":"/images/panoramicas/Clariones.webp","alt":"The remote volcanic island of Clarion"},{"src":"/images/panoramicas/Pargos Roca.webp","alt":"School of snappers swarming Roca Partida"},{"src":"/images/panoramicas/Delfin Kike.webp","alt":"Bottlenose dolphins riding the bow wave"}]'))
})

describe('Destination translations — Socorro (ES)', () => {
  it('socorro.h5', () => testKey('es', 'socorro.h5', 'Tiburones Tigre y Sedosos'))
  it('socorro.h5d', () => testKey('es', 'socorro.h5d', 'Depredadores oceánicos como tiburones tigre, sedosos y puntas blancas oceánicos patrullan las aguas azules profundas alrededor de estas islas volcánicas.'))
  it('socorro.h6', () => testKey('es', 'socorro.h6', 'Tiburones Ballena y Falsas Orcas'))
  it('socorro.h6d', () => testKey('es', 'socorro.h6d', 'Los tiburones ballena visitan en noviembre, diciembre y mayo. Mayo también trae bolas de carnada gigantes y manadas de falsas orcas.'))

  it('socorro.diveSites.title', () => testKey('es', 'socorro.diveSites.title', 'Sitios de Buceo'))

  // San Benedicto — El Boiler
  it('socorro.diveSites.sanBenedicto.boiler.name', () => testKey('es', 'socorro.diveSites.sanBenedicto.boiler.name', 'El Boiler'))
  it('socorro.diveSites.sanBenedicto.boiler.description', () => testKey('es', 'socorro.diveSites.sanBenedicto.boiler.description', 'Un monte marino sumergido que se eleva desde el fondo del océano hasta unos 50m — una reconocida estación de limpieza de mantas donde los gigantes se reúnen.'))
  it('socorro.diveSites.sanBenedicto.boiler.fauna', () => testKey('es', 'socorro.diveSites.sanBenedicto.boiler.fauna', 'Mantas oceánicas gigantes (hasta 6m+), delfines nariz de botella, amberjack, jureles, atún aleta amarilla'))

  // San Benedicto — El Cañón
  it('socorro.diveSites.sanBenedicto.canyon.name', () => testKey('es', 'socorro.diveSites.sanBenedicto.canyon.name', 'El Cañón'))
  it('socorro.diveSites.sanBenedicto.canyon.description', () => testKey('es', 'socorro.diveSites.sanBenedicto.canyon.description', 'Mantas enormes deambulan por este sitio — envergaduras de 4m+ dando vueltas sobre los buzos. Los cantos de ballenas jorobadas se escuchan bajo el agua.'))
  it('socorro.diveSites.sanBenedicto.canyon.fauna', () => testKey('es', 'socorro.diveSites.sanBenedicto.canyon.fauna', 'Mantas gigantes, mantas negras, ballenas jorobadas (cantos), tiburones ballena'))

  // Roca Partida
  it('socorro.diveSites.rocaPartida.rocaPartida.name', () => testKey('es', 'socorro.diveSites.rocaPartida.rocaPartida.name', 'Roca Partida'))
  it('socorro.diveSites.rocaPartida.rocaPartida.description', () => testKey('es', 'socorro.diveSites.rocaPartida.rocaPartida.description', 'Un enorme arrecife que se eleva en medio del océano abierto con paredes de 70-80m. Tan remoto que toma 6 horas en barco desde San Benedicto.'))
  it('socorro.diveSites.rocaPartida.rocaPartida.fauna', () => testKey('es', 'socorro.diveSites.rocaPartida.rocaPartida.fauna', 'Bancos de tiburones martillo (cientos), tiburones punta plateada, jureles negros, tiburones tigre, tiburones ballena, tiburones Galápagos'))

  // Socorro Island — Cabo Pearce
  it('socorro.diveSites.socorroIsland.caboPearce.name', () => testKey('es', 'socorro.diveSites.socorroIsland.caboPearce.name', 'Cabo Pearce'))
  it('socorro.diveSites.socorroIsland.caboPearce.description', () => testKey('es', 'socorro.diveSites.socorroIsland.caboPearce.description', 'Un monte marino que se extiende hacia el mar abierto frente a la Isla Socorro. Múltiples encuentros con grandes criaturas en cada inmersión.'))
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
  it('socorro.gallery.images', () => testKey('es', 'socorro.gallery.images', '[{"src":"/images/panoramicas/Isla Socorro.webp","alt":"Acantilados volcánicos de la Isla Socorro emergiendo del Pacífico"},{"src":"/images/panoramicas/Manta el Boiler 1.webp","alt":"Manta oceánica gigante en la estación de limpieza de El Boiler"},{"src":"/images/panoramicas/Cabo Pearce .webp","alt":"Paisaje marino en el sitio de buceo Cabo Pearce"},{"src":"/images/panoramicas/Clariones.webp","alt":"La remota isla volcánica de Clarion"},{"src":"/images/panoramicas/Pargos Roca.webp","alt":"Cardumen de pargos en Roca Partida"},{"src":"/images/panoramicas/Delfin Kike.webp","alt":"Delfines nariz de botella jugando en la proa"}]'))
})

describe('Destination translations — Cortez (EN)', () => {
  it('cortez.h5', () => testKey('en', 'cortez.h5', 'Mobula Rays'))
  it('cortez.h5d', () => testKey('en', 'cortez.h5d', 'From July through October, mobula rays gather in the thousands at Punta Lobo — jumping, rolling, and packing the water from surface to seafloor.'))
  it('cortez.h6', () => testKey('en', 'cortez.h6', 'Macro Life & Wrecks'))
  it('cortez.h6d', () => testKey('en', 'cortez.h6d', 'Bluespotted Jawfish, Signal blennies, giant jawfishes, nudibranchs — and the 80-meter Salvatierra ferry wreck teeming with oversized reef fish.'))

  it('cortez.diveSites.title', () => testKey('en', 'cortez.diveSites.title', 'Dive Sites'))

  // La Paz Bay — Los Islotes
  it('cortez.diveSites.laPazBay.losIslotes.name', () => testKey('en', 'cortez.diveSites.laPazBay.losIslotes.name', 'Los Islotes'))
  it('cortez.diveSites.laPazBay.losIslotes.description', () => testKey('en', 'cortez.diveSites.laPazBay.losIslotes.description', 'A rocky islet home to a colony of over 400 California sea lions. Pups start playing with divers in September — they nibble fins and snorkels in the south-side cave.'))
  it('cortez.diveSites.laPazBay.losIslotes.fauna', () => testKey('en', 'cortez.diveSites.laPazBay.losIslotes.fauna', '400+ California sea lions, Bluespotted Jawfish, sardine schools, mobula rays, Mexican barracudas, gobies, nudibranchs'))

  // La Paz Bay — La Paz Bay
  it('cortez.diveSites.laPazBay.laPazBay.name', () => testKey('en', 'cortez.diveSites.laPazBay.laPazBay.name', 'La Paz Bay'))
  it('cortez.diveSites.laPazBay.laPazBay.description', () => testKey('en', 'cortez.diveSites.laPazBay.laPazBay.description', 'The bay has become a reliable place to swim with whale sharks — the world\'s largest fish — in their natural feeding grounds.'))
  it('cortez.diveSites.laPazBay.laPazBay.fauna', () => testKey('en', 'cortez.diveSites.laPazBay.laPazBay.fauna', 'Whale sharks'))

  // La Paz Bay — Swannee Reef
  it('cortez.diveSites.laPazBay.swanneeReef.name', () => testKey('en', 'cortez.diveSites.laPazBay.swanneeReef.name', 'Swannee Reef'))
  it('cortez.diveSites.laPazBay.swanneeReef.description', () => testKey('en', 'cortez.diveSites.laPazBay.swanneeReef.description', 'An isolated reef in a white sand area — a fish paradise. Signal blennies pop out of holes, flashing their dorsal fins three times before retreating.'))
  it('cortez.diveSites.laPazBay.swanneeReef.fauna', () => testKey('en', 'cortez.diveSites.laPazBay.swanneeReef.fauna', 'Mexican goatfish, Spottail grunt, Signal blennies, barracudas, skip jacks, sea lions (occasional)'))

  // La Paz Bay — Salvatierra
  it('cortez.diveSites.laPazBay.salvatierra.name', () => testKey('en', 'cortez.diveSites.laPazBay.salvatierra.name', 'Salvatierra Wreck'))
  it('cortez.diveSites.laPazBay.salvatierra.description', () => testKey('en', 'cortez.diveSites.laPazBay.salvatierra.description', 'An 80-meter ferry sunk at about 20m depth, almost completely intact. It has become a thriving artificial reef.'))
  it('cortez.diveSites.laPazBay.salvatierra.fauna', () => testKey('en', 'cortez.diveSites.laPazBay.salvatierra.fauna', 'Unusually large grunts and angelfish, reef fish'))

  // La Paz Bay — El Corralito
  it('cortez.diveSites.laPazBay.elCorralito.name', () => testKey('en', 'cortez.diveSites.laPazBay.elCorralito.name', 'El Corralito'))
  it('cortez.diveSites.laPazBay.elCorralito.description', () => testKey('en', 'cortez.diveSites.laPazBay.elCorralito.description', 'Known for its uniquely giant jawfishes — noticeably larger than anywhere else in the Sea of Cortez.'))
  it('cortez.diveSites.laPazBay.elCorralito.fauna', () => testKey('en', 'cortez.diveSites.laPazBay.elCorralito.fauna', 'Giant jawfishes'))

  // Northern Islands — El Bajo
  it('cortez.diveSites.northernIslands.elBajo.name', () => testKey('en', 'cortez.diveSites.northernIslands.elBajo.name', 'El Bajo'))
  it('cortez.diveSites.northernIslands.elBajo.description', () => testKey('en', 'cortez.diveSites.northernIslands.elBajo.description', 'Three seamounts with pinnacles at 18-22m. Drift dives through hundreds of hammerheads snaking their heads and bodies past you.'))
  it('cortez.diveSites.northernIslands.elBajo.fauna', () => testKey('en', 'cortez.diveSites.northernIslands.elBajo.fauna', 'Hammerhead sharks (hundreds, adults and juveniles), bonitos, skip jacks, marlin, whale sharks'))

  // Northern Islands — Whale Island
  it('cortez.diveSites.northernIslands.whaleIsland.name', () => testKey('en', 'cortez.diveSites.northernIslands.whaleIsland.name', 'Whale Island'))
  it('cortez.diveSites.northernIslands.whaleIsland.description', () => testKey('en', 'cortez.diveSites.northernIslands.whaleIsland.description', 'A precipitous island shaped like a whale. Caves on the southwest side lead to the north through seafan-filled passages.'))
  it('cortez.diveSites.northernIslands.whaleIsland.fauna', () => testKey('en', 'cortez.diveSites.northernIslands.whaleIsland.fauna', 'Cortez angelfish, seafans, reef fish'))

  // Northern Islands — San Francisquito
  it('cortez.diveSites.northernIslands.sanFrancisquito.name', () => testKey('en', 'cortez.diveSites.northernIslands.sanFrancisquito.name', 'San Francisquito'))
  it('cortez.diveSites.northernIslands.sanFrancisquito.description', () => testKey('en', 'cortez.diveSites.northernIslands.sanFrancisquito.description', 'A dive site only reachable by liveaboard. Without the territorial competition of busier sites, the sea lions here are calmer and more relaxed.'))
  it('cortez.diveSites.northernIslands.sanFrancisquito.fauna', () => testKey('en', 'cortez.diveSites.northernIslands.sanFrancisquito.fauna', 'California sea lions (calm, relaxed), reef fish'))

  // East Cape — Las Ánimas
  it('cortez.diveSites.eastCape.lasAnimas.name', () => testKey('en', 'cortez.diveSites.eastCape.lasAnimas.name', 'Las Ánimas'))
  it('cortez.diveSites.eastCape.lasAnimas.description', () => testKey('en', 'cortez.diveSites.eastCape.lasAnimas.description', 'Only accessible by liveaboard. Giant diamond stingrays glide among colorful seafans while big eye trevallies swirl around.'))
  it('cortez.diveSites.eastCape.lasAnimas.fauna', () => testKey('en', 'cortez.diveSites.eastCape.lasAnimas.fauna', 'Longnose hawkfish, giant diamond stingrays, seafans, big eye trevallies, hammerhead sharks, sea turtles'))

  // East Cape — Cabo Pulmo / Gordo Banks
  it('cortez.diveSites.eastCape.caboPulmo.name', () => testKey('en', 'cortez.diveSites.eastCape.caboPulmo.name', 'Cabo Pulmo / Gordo Banks'))
  it('cortez.diveSites.eastCape.caboPulmo.description', () => testKey('en', 'cortez.diveSites.eastCape.caboPulmo.description', 'Eight miles offshore at depths up to 40m with powerful currents — for advanced divers only. One of the region\'s top dive spots.'))
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
  it('cortez.gallery.images', () => testKey('en', 'cortez.gallery.images', '[{"src":"/images/panoramicas/PuntaTosca.webp","alt":"Rugged coastline of Punta Tosca, Baja California Sur"},{"src":"/images/panoramicas/loreto-magdalena-bay.webp","alt":"Pristine waters of Loreto and Magdalena Bay"},{"src":"/images/panoramicas/ROca Partida .webp","alt":"The iconic pinnacle of Roca Partida in open ocean"},{"src":"/images/panoramicas/Quetzal San Bene.webp","alt":"The Quetzal anchored off San Benedicto Island"},{"src":"/images/panoramicas/Manta Clariones.webp","alt":"Manta ray gliding through crystal-clear waters"}]'))
})

describe('Destination translations — Cortez (ES)', () => {
  it('cortez.h5', () => testKey('es', 'cortez.h5', 'Mantarrayas Mobula'))
  it('cortez.h5d', () => testKey('es', 'cortez.h5d', 'De julio a octubre, las mantarrayas mobula se reúnen por miles en Punta Lobo — saltando, girando y llenando el agua de superficie a fondo.'))
  it('cortez.h6', () => testKey('es', 'cortez.h6', 'Vida Macro y Naufragios'))
  it('cortez.h6d', () => testKey('es', 'cortez.h6d', 'Bluespotted Jawfish, Signal blennies, jawfishes gigantes, nudibranquios — y el ferry Salvatierra de 80 metros rebosante de peces de arrecife de tamaño excepcional.'))

  it('cortez.diveSites.title', () => testKey('es', 'cortez.diveSites.title', 'Sitios de Buceo'))

  // La Paz Bay — Los Islotes
  it('cortez.diveSites.laPazBay.losIslotes.name', () => testKey('es', 'cortez.diveSites.laPazBay.losIslotes.name', 'Los Islotes'))
  it('cortez.diveSites.laPazBay.losIslotes.description', () => testKey('es', 'cortez.diveSites.laPazBay.losIslotes.description', 'Un islote rocoso hogar de una colonia de más de 400 lobos marinos de California. Las crías empiezan a jugar con los buzos en septiembre — mordisquean aletas y snorkels en la cueva del lado sur.'))
  it('cortez.diveSites.laPazBay.losIslotes.fauna', () => testKey('es', 'cortez.diveSites.laPazBay.losIslotes.fauna', '400+ lobos marinos de California, Bluespotted Jawfish, cardúmenes de sardinas, mantarrayas mobula, barracudas mexicanas, gobios, nudibranquios'))

  // La Paz Bay — Bahía de La Paz
  it('cortez.diveSites.laPazBay.laPazBay.name', () => testKey('es', 'cortez.diveSites.laPazBay.laPazBay.name', 'Bahía de La Paz'))
  it('cortez.diveSites.laPazBay.laPazBay.description', () => testKey('es', 'cortez.diveSites.laPazBay.laPazBay.description', 'La bahía se ha convertido en un lugar confiable para nadar con tiburones ballena — el pez más grande del mundo — en sus zonas naturales de alimentación.'))
  it('cortez.diveSites.laPazBay.laPazBay.fauna', () => testKey('es', 'cortez.diveSites.laPazBay.laPazBay.fauna', 'Tiburones ballena'))

  // La Paz Bay — Arrecife Swannee
  it('cortez.diveSites.laPazBay.swanneeReef.name', () => testKey('es', 'cortez.diveSites.laPazBay.swanneeReef.name', 'Arrecife Swannee'))
  it('cortez.diveSites.laPazBay.swanneeReef.description', () => testKey('es', 'cortez.diveSites.laPazBay.swanneeReef.description', 'Un arrecife aislado en un área de arena blanca — un paraíso de peces. Los Signal blennies salen de sus agujeros, emitiendo su aleta dorsal tres veces antes de retirarse.'))
  it('cortez.diveSites.laPazBay.swanneeReef.fauna', () => testKey('es', 'cortez.diveSites.laPazBay.swanneeReef.fauna', 'Goatfish mexicanos, Spottail grunt, Signal blennies, barracudas, skip jacks, lobos marinos (ocasionales)'))

  // La Paz Bay — Naufragio Salvatierra
  it('cortez.diveSites.laPazBay.salvatierra.name', () => testKey('es', 'cortez.diveSites.laPazBay.salvatierra.name', 'Naufragio Salvatierra'))
  it('cortez.diveSites.laPazBay.salvatierra.description', () => testKey('es', 'cortez.diveSites.laPazBay.salvatierra.description', 'Un ferry de 80 metros hundido a unos 20m de profundidad, casi completamente intacto. Se ha convertido en un próspero arrecife artificial.'))
  it('cortez.diveSites.laPazBay.salvatierra.fauna', () => testKey('es', 'cortez.diveSites.laPazBay.salvatierra.fauna', 'Grunts y peces ángel de tamaño excepcional, peces de arrecife'))

  // La Paz Bay — El Corralito
  it('cortez.diveSites.laPazBay.elCorralito.name', () => testKey('es', 'cortez.diveSites.laPazBay.elCorralito.name', 'El Corralito'))
  it('cortez.diveSites.laPazBay.elCorralito.description', () => testKey('es', 'cortez.diveSites.laPazBay.elCorralito.description', 'Conocido por sus jawfishes singularmente gigantes — notablemente más grandes que en cualquier otro lugar del Mar de Cortés.'))
  it('cortez.diveSites.laPazBay.elCorralito.fauna', () => testKey('es', 'cortez.diveSites.laPazBay.elCorralito.fauna', 'Jawfishes gigantes'))

  // Northern Islands — El Bajo
  it('cortez.diveSites.northernIslands.elBajo.name', () => testKey('es', 'cortez.diveSites.northernIslands.elBajo.name', 'El Bajo'))
  it('cortez.diveSites.northernIslands.elBajo.description', () => testKey('es', 'cortez.diveSites.northernIslands.elBajo.description', 'Tres montes marinos con cimas a 18-22m. Derivas entre cientos de tiburones martillo serpenteando sus cabezas y cuerpos a tu alrededor.'))
  it('cortez.diveSites.northernIslands.elBajo.fauna', () => testKey('es', 'cortez.diveSites.northernIslands.elBajo.fauna', 'Tiburones martillo (cientos, adultos y juveniles), bonitos, skip jacks, marlines, tiburones ballena'))

  // Northern Islands — Isla Ballena
  it('cortez.diveSites.northernIslands.whaleIsland.name', () => testKey('es', 'cortez.diveSites.northernIslands.whaleIsland.name', 'Isla Ballena'))
  it('cortez.diveSites.northernIslands.whaleIsland.description', () => testKey('es', 'cortez.diveSites.northernIslands.whaleIsland.description', 'Una isla escarpada con forma de ballena. Cuevas en el lado suroeste llevan al norte a través de pasajes llenos de abanicos de mar.'))
  it('cortez.diveSites.northernIslands.whaleIsland.fauna', () => testKey('es', 'cortez.diveSites.northernIslands.whaleIsland.fauna', 'Pez ángel de Cortés, abanicos de mar, peces de arrecife'))

  // Northern Islands — San Francisquito
  it('cortez.diveSites.northernIslands.sanFrancisquito.name', () => testKey('es', 'cortez.diveSites.northernIslands.sanFrancisquito.name', 'San Francisquito'))
  it('cortez.diveSites.northernIslands.sanFrancisquito.description', () => testKey('es', 'cortez.diveSites.northernIslands.sanFrancisquito.description', 'Un sitio de buceo solo accesible por liveaboard. Sin la competencia territorial de sitios más concurridos, los lobos marinos aquí son más tranquilos y relajados.'))
  it('cortez.diveSites.northernIslands.sanFrancisquito.fauna', () => testKey('es', 'cortez.diveSites.northernIslands.sanFrancisquito.fauna', 'Lobos marinos de California (tranquilos, relajados), peces de arrecife'))

  // East Cape — Las Ánimas
  it('cortez.diveSites.eastCape.lasAnimas.name', () => testKey('es', 'cortez.diveSites.eastCape.lasAnimas.name', 'Las Ánimas'))
  it('cortez.diveSites.eastCape.lasAnimas.description', () => testKey('es', 'cortez.diveSites.eastCape.lasAnimas.description', 'Solo accesible por liveaboard. Rayas diamante gigantes se deslizan entre coloridos abanicos de mar mientras big eye trevallies giran en remolinos.'))
  it('cortez.diveSites.eastCape.lasAnimas.fauna', () => testKey('es', 'cortez.diveSites.eastCape.lasAnimas.fauna', 'Longnose hawkfish, rayas diamante gigantes, abanicos de mar, big eye trevallies, tiburones martillo, tortugas marinas'))

  // East Cape — Cabo Pulmo / Gordo Banks
  it('cortez.diveSites.eastCape.caboPulmo.name', () => testKey('es', 'cortez.diveSites.eastCape.caboPulmo.name', 'Cabo Pulmo / Gordo Banks'))
  it('cortez.diveSites.eastCape.caboPulmo.description', () => testKey('es', 'cortez.diveSites.eastCape.caboPulmo.description', 'A ocho millas de la costa, profundidades de hasta 40m con corrientes poderosas — solo para buzos avanzados. Uno de los mejores sitios de buceo de la región.'))
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
  it('cortez.gallery.images', () => testKey('es', 'cortez.gallery.images', '[{"src":"/images/panoramicas/PuntaTosca.webp","alt":"Escarpada costa de Punta Tosca, Baja California Sur"},{"src":"/images/panoramicas/loreto-magdalena-bay.webp","alt":"Aguas prístinas de Loreto y Bahía Magdalena"},{"src":"/images/panoramicas/ROca Partida .webp","alt":"El icónico pináculo de Roca Partida en mar abierto"},{"src":"/images/panoramicas/Quetzal San Bene.webp","alt":"El Quetzal anclado frente a la Isla San Benedicto"},{"src":"/images/panoramicas/Manta Clariones.webp","alt":"Manta raya deslizándose en aguas cristalinas"}]'))
})

describe('Destination translations — Magbay (EN)', () => {
  it('magbay.h5', () => testKey('en', 'magbay.h5', 'Mexico Sardine Run'))
  it('magbay.h5d', () => testKey('en', 'magbay.h5d', 'From October through December, the Pacific side of Baja explodes with life during the annual sardine run — attracting striped marlin, seabirds, and cetaceans in spectacular feeding frenzies.'))
  it('magbay.h6', () => testKey('en', 'magbay.h6', '14-Day Expedition'))
  it('magbay.h6d', () => testKey('en', 'magbay.h6d', 'Two worlds in one unforgettable trip: the intimacy of close whale encounters in the bay, followed by big-animal diving with mantas, sharks, and dolphins at the Revillagigedo Archipelago.'))

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
  it('magbay.gallery.images', () => testKey('en', 'magbay.gallery.images', '[{"src":"/images/panoramicas/loreto-magdalena-bay.webp","alt":"The protected lagoon of Bahía Magdalena at sunset"},{"src":"/images/panoramicas/Puntas blancas 1.webp","alt":"Whitetip reef sharks resting on the sandy bottom"},{"src":"/images/panoramicas/Puntas blancas 4.webp","alt":"Curious whitetip sharks patrolling the reef"},{"src":"/images/panoramicas/Puntas blancas Balcón.webp","alt":"Panoramic view from the Balcón dive site"}]'))
})

describe('Destination translations — Magbay (ES)', () => {
  it('magbay.h5', () => testKey('es', 'magbay.h5', 'Corrida de Sardinas de México'))
  it('magbay.h5d', () => testKey('es', 'magbay.h5d', 'De octubre a diciembre, el lado Pacífico de Baja explota de vida durante la corrida anual de sardinas — atrayendo marlines rayados, aves marinas y cetáceos en espectaculares frenesíes alimenticios.'))
  it('magbay.h6', () => testKey('es', 'magbay.h6', 'Expedición de 14 Días'))
  it('magbay.h6d', () => testKey('es', 'magbay.h6d', 'Dos mundos en un viaje inolvidable: la intimidad de los encuentros cercanos con ballenas en la bahía, seguido del buceo de animales grandes con mantas, tiburones y delfines en el Archipiélago de Revillagigedo.'))

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
  it('magbay.gallery.images', () => testKey('es', 'magbay.gallery.images', '[{"src":"/images/panoramicas/loreto-magdalena-bay.webp","alt":"La laguna protegida de Bahía Magdalena al atardecer"},{"src":"/images/panoramicas/Puntas blancas 1.webp","alt":"Tiburones punta blanca descansando en el fondo arenoso"},{"src":"/images/panoramicas/Puntas blancas 4.webp","alt":"Curiosos tiburones punta blanca patrullando el arrecife"},{"src":"/images/panoramicas/Puntas blancas Balcón.webp","alt":"Vista panorámica desde el sitio de buceo El Balcón"}]'))
})
