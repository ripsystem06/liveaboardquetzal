import type { Metadata } from 'next'
import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: 'Upcoming Adventures — Quetzal Liveaboard',
  description: 'Quetzal Liveaboard is preparing its upcoming diving adventures in Baja California, Mexico. Online reservations will be available soon.',
}

export default function BookingPage() {
  return (
    <main className="min-h-screen">
      <Navigation />

      <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-muted/30 px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent/0 via-accent/50 to-accent/0" />
        <div className="container relative mx-auto max-w-4xl text-center">
          <p className="mb-5 font-sans text-xs font-semibold uppercase tracking-[0.24em] text-accent">
            Quetzal Liveaboard · Coming soon
          </p>
          <h1 className="mx-auto max-w-3xl font-serif text-4xl font-normal leading-tight text-foreground text-balance sm:text-5xl lg:text-6xl">
            Upcoming adventures are taking shape.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl font-sans text-lg leading-8 text-muted-foreground text-pretty">
            Our team is working on the next Quetzal adventures. Online reservations will be available here soon.
          </p>
          <div className="mx-auto mt-8 max-w-2xl border-t border-foreground/10 pt-8">
            <h2 className="font-serif text-2xl font-normal text-foreground sm:text-3xl">
              Próximas aventuras en preparación.
            </h2>
            <p className="mx-auto mt-4 max-w-xl font-sans text-base leading-7 text-muted-foreground text-pretty">
              Nuestro equipo está preparando las próximas aventuras de Quetzal. Las reservaciones en línea estarán disponibles aquí muy pronto.
            </p>
          </div>
          <Link
            href="/contacto"
            className="mt-10 inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-6 py-3 font-sans text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            Contact the team · Contactar al equipo
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
