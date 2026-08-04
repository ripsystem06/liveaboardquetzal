import React from "react"
import type { Metadata } from 'next'
import { Montserrat, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { LanguageProvider } from '@/contexts/language-context'
import { UserProvider } from '@/contexts/user-context'
import { SessionProvider } from 'next-auth/react'
import { LoadingScreen } from '@/components/loading-screen'
import { HtmlLangSetter } from '@/components/html-lang-setter'
import './globals.css'

const _montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-montserrat'
});

const _playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-heading'
});

export const metadata: Metadata = {
  title: 'Quetzal Liveaboard - Luxury Diving Expeditions',
  description: 'Experience the greatest liveaboard adventure in the Pacific Ocean. Diving expeditions to Socorro Islands, Sea of Cortez, and Bahía Magdalena.',
  
  icons: {
    icon: '/isologo-blanco.svg',
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${_montserrat.variable} ${_playfairDisplay.variable} font-sans antialiased`}>
        <LanguageProvider>
          <SessionProvider>
            <UserProvider>
              <LoadingScreen />
              {children}
              <HtmlLangSetter />
            </UserProvider>
          </SessionProvider>
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  )
}
