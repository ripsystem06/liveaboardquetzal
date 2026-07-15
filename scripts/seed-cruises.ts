import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const today = new Date()
  
  const cruises = [
    {
      name: 'Socorro Islands — Giant Mantas Expedition',
      departureDate: `${today.getFullYear()}-${String(today.getMonth() + 2).padStart(2,'0')}-15`,
      returnDate: `${today.getFullYear()}-${String(today.getMonth() + 2).padStart(2,'0')}-24`,
      route: 'Socorro Islands',
      basicPrice: 3300,
      standardPrice: 3900,
      premiumPrice: 4600,
      dives: 18,
    },
    {
      name: 'Sea of Cortez — Whale Shark Adventure',
      departureDate: `${today.getFullYear()}-${String(today.getMonth() + 3).padStart(2,'0')}-05`,
      returnDate: `${today.getFullYear()}-${String(today.getMonth() + 3).padStart(2,'0')}-12`,
      route: 'Sea of Cortez',
      basicPrice: 2500,
      standardPrice: 3100,
      premiumPrice: 3800,
      dives: 14,
    },
    {
      name: 'Magdalena Bay — Sardine Run',
      departureDate: `${today.getFullYear()}-${String(today.getMonth() + 3).padStart(2,'0')}-22`,
      returnDate: `${today.getFullYear()}-${String(today.getMonth() + 3).padStart(2,'0')}-28`,
      route: 'Magdalena Bay',
      basicPrice: 2800,
      standardPrice: 3400,
      premiumPrice: 4100,
      dives: 12,
    },
    {
      name: 'Socorro Islands — Hammerhead Season',
      departureDate: `${today.getFullYear()}-${String(today.getMonth() + 4).padStart(2,'0')}-10`,
      returnDate: `${today.getFullYear()}-${String(today.getMonth() + 4).padStart(2,'0')}-19`,
      route: 'Socorro Islands',
      basicPrice: 3600,
      standardPrice: 4200,
      premiumPrice: 4900,
      dives: 20,
    },
    {
      name: 'Sea of Cortez — Mobula Ray Aggregation',
      departureDate: `${today.getFullYear()}-${String(today.getMonth() + 4).padStart(2,'0')}-25`,
      returnDate: `${today.getFullYear()}-${String(today.getMonth() + 5).padStart(2,'0')}-01`,
      route: 'Sea of Cortez',
      basicPrice: 2600,
      standardPrice: 3200,
      premiumPrice: 3900,
      dives: 14,
    },
  ]

  for (const cruise of cruises) {
    const existing = await prisma.cruise.findFirst({
      where: { departureDate: cruise.departureDate }
    })
    if (!existing) {
      await prisma.cruise.create({ data: cruise })
      console.log(`✅ ${cruise.name} — ${cruise.departureDate}`)
    } else {
      console.log(`⏭️  Ya existe: ${cruise.departureDate}`)
    }
  }

  const count = await prisma.cruise.count({ where: { departureDate: { gt: today.toISOString().split('T')[0] } } })
  console.log(`\n📅 ${count} expediciones activas en total`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
