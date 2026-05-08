'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLanguage } from '@/contexts/language-context'

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { language, setLanguage, t } = useLanguage()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-sm border-b border-primary/20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/quetzal-logo.jpg"
              alt="Quetzal Liveaboard"
              width={50}
              height={50}
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <Link 
              href="/" 
              className="text-primary-foreground hover:text-accent transition-colors text-sm font-medium tracking-wide"
            >
              {t('nav.home')}
            </Link>
            <Link 
              href="/nuestro-barco" 
              className="text-primary-foreground hover:text-accent transition-colors text-sm font-medium tracking-wide"
            >
              {t('nav.ourBoat')}
            </Link>
            
            {/* Destinos Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-primary-foreground hover:text-accent transition-colors text-sm font-medium tracking-wide">
                {t('nav.destinations')}
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-card border-border">
                <DropdownMenuItem asChild>
                  <Link href="/destinos/islas-socorro">Socorro Islands</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/destinos/mar-de-cortes">Sea of Cortez</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/destinos/bahia-magdalena">Magdalena Bay</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link 
              href="/faqs" 
              className="text-primary-foreground hover:text-accent transition-colors text-sm font-medium tracking-wide"
            >
              {t('nav.faqs')}
            </Link>
            
            {/* About Us con Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-primary-foreground hover:text-accent transition-colors text-sm font-medium tracking-wide">
                {t('nav.aboutUs')}
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-card border-border">
                <DropdownMenuItem asChild>
                  <Link href="/about">{t('nav.aboutUs')}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/about/colaboraciones">{t('nav.collaborations')}</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link 
              href="/testimonios" 
              className="text-primary-foreground hover:text-accent transition-colors text-sm font-medium tracking-wide"
            >
              {t('nav.testimonials')}
            </Link>
            <Link 
              href="/blog" 
              className="text-primary-foreground hover:text-accent transition-colors text-sm font-medium tracking-wide"
            >
              {t('nav.blogs')}
            </Link>
            <Link 
              href="/contacto" 
              className="text-primary-foreground hover:text-accent transition-colors text-sm font-medium tracking-wide"
            >
              {t('nav.contact')}
            </Link>
          </div>

          {/* CTA Button & Language Switcher */}
          <div className="hidden lg:flex items-center gap-3">
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 font-medium whitespace-nowrap">
              <Link href="/calendario">{t('nav.calendar')}</Link>
            </Button>
            <button
              onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
              className="flex items-center justify-center w-10 h-10 hover:scale-110 transition-transform cursor-pointer rounded-full border-2 border-white/20 hover:border-accent bg-white/10"
              title={language === 'en' ? 'Cambiar a Español' : 'Switch to English'}
              aria-label={language === 'en' ? 'Switch to Spanish' : 'Cambiar a Inglés'}
            >
              <span className="text-2xl leading-none" role="img" aria-label={language === 'en' ? 'US Flag' : 'Mexico Flag'}>
                {language === 'en' ? '🇺🇸' : '🇲🇽'}
              </span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-primary-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden pb-4 space-y-3">
            <Link href="/" className="block text-primary-foreground hover:text-accent py-2" onClick={() => setIsOpen(false)}>
              {t('nav.home')}
            </Link>
            <Link href="/nuestro-barco" className="block text-primary-foreground hover:text-accent py-2" onClick={() => setIsOpen(false)}>
              {t('nav.ourBoat')}
            </Link>
            <div className="space-y-2 pl-4">
              <p className="text-primary-foreground font-medium">{t('nav.destinations')}</p>
              <Link href="/destinos/islas-socorro" className="block text-primary-foreground/80 hover:text-accent py-1" onClick={() => setIsOpen(false)}>
                Socorro Islands
              </Link>
              <Link href="/destinos/mar-de-cortes" className="block text-primary-foreground/80 hover:text-accent py-1" onClick={() => setIsOpen(false)}>
                Sea of Cortez
              </Link>
              <Link href="/destinos/bahia-magdalena" className="block text-primary-foreground/80 hover:text-accent py-1" onClick={() => setIsOpen(false)}>
                Magdalena Bay
              </Link>
            </div>
            <Link href="/faqs" className="block text-primary-foreground hover:text-accent py-2" onClick={() => setIsOpen(false)}>
              {t('nav.faqs')}
            </Link>
            <div className="space-y-2 pl-4">
              <p className="text-primary-foreground font-medium">{t('nav.aboutUs')}</p>
              <Link href="/about" className="block text-primary-foreground/80 hover:text-accent py-1" onClick={() => setIsOpen(false)}>
                {t('nav.aboutUs')}
              </Link>
              <Link href="/about/colaboraciones" className="block text-primary-foreground/80 hover:text-accent py-1" onClick={() => setIsOpen(false)}>
                {t('nav.collaborations')}
              </Link>
            </div>
            <Link href="/testimonios" className="block text-primary-foreground hover:text-accent py-2" onClick={() => setIsOpen(false)}>
              {t('nav.testimonials')}
            </Link>
            <Link href="/blog" className="block text-primary-foreground hover:text-accent py-2" onClick={() => setIsOpen(false)}>
              {t('nav.blogs')}
            </Link>
            <Link href="/contacto" className="block text-primary-foreground hover:text-accent py-2" onClick={() => setIsOpen(false)}>
              {t('nav.contact')}
            </Link>
            
            {/* Mobile Language & Calendar */}
            <div className="flex items-center gap-3 pt-4">
              <Button asChild className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/calendario" onClick={() => setIsOpen(false)}>{t('nav.calendar')}</Link>
              </Button>
              <button
                onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
                className="flex items-center justify-center w-12 h-12 hover:scale-110 transition-transform cursor-pointer rounded-full border-2 border-white/20 hover:border-accent bg-white/10"
                title={language === 'en' ? 'Cambiar a Español' : 'Switch to English'}
                aria-label={language === 'en' ? 'Switch to Spanish' : 'Cambiar a Inglés'}
              >
                <span className="text-2xl leading-none" role="img" aria-label={language === 'en' ? 'US Flag' : 'Mexico Flag'}>
                  {language === 'en' ? '🇺🇸' : '🇲🇽'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
