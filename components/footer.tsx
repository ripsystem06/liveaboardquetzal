'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/contexts/language-context'

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/quetzal-logo.jpg"
                alt="Quetzal Liveaboard"
                width={50}
                height={50}
                className="h-12 w-auto rounded-full"
              />
            </Link>
            <p className="font-sans text-sm text-primary-foreground/80 leading-relaxed">
              {t('footer.brand')}
            </p>
          </div>

          {/* Destinations */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-normal">{t('footer.destinations')}</h3>
            <ul className="space-y-2 font-sans text-sm">
              <li>
                <Link href="/destinos/islas-socorro" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  {t('footer.socorro')}
                </Link>
              </li>
              <li>
                <Link href="/destinos/mar-de-cortes" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  {t('footer.cortez')}
                </Link>
              </li>
              <li>
                <Link href="/destinos/bahia-magdalena" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  {t('footer.magBay')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-normal">{t('footer.company')}</h3>
            <ul className="space-y-2 font-sans text-sm">
              <li>
                <Link href="/nuestro-barco" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  {t('nav.ourBoat')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  {t('nav.aboutUs')}
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  {t('nav.faqs')}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  {t('nav.blogs')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-normal">{t('nav.contact')}</h3>
            <ul className="space-y-2 font-sans text-sm">
              <li className="text-primary-foreground/80">
                contact@quetzalliveaboard.com
              </li>
              <li>
                <Link href="/contacto" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  {t('footer.contactForm')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-sans text-sm text-primary-foreground/60">
            &copy; {new Date().getFullYear()} Quetzal Liveaboard. {t('footer.rights')}
          </p>
          <div className="flex gap-6 font-sans text-sm">
            <Link href="/privacidad" className="text-primary-foreground/60 hover:text-accent transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link href="/terminos" className="text-primary-foreground/60 hover:text-accent transition-colors">
              {t('footer.terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}