import React from "react"
import type { Metadata } from 'next'
import { Roboto, Old_Standard_TT } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { LanguageProvider } from '@/contexts/language-context'
import { HtmlLangSetter } from '@/components/html-lang-setter'
import './globals.css'

const _roboto = Roboto({ 
  subsets: ["latin"],
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto'
});

const _oldStandardTT = Old_Standard_TT({ 
  subsets: ["latin"],
  weight: ['400', '700'],
  variable: '--font-old-standard'
});

export const metadata: Metadata = {
  title: 'Quetzal Liveaboard - Luxury Diving Expeditions',
  description: 'Experience the greatest liveaboard adventure in the Pacific Ocean. Diving expeditions to Socorro Islands, Sea of Cortez, and Bahía Magdalena.',
  
  icons: {
    icon: [
      {
        url: '/favicon-black.svg',
        type: 'image/svg+xml',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/favicon-white.svg',
        type: 'image/svg+xml',
        media: '(prefers-color-scheme: dark)',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <LanguageProvider>
          {children}
          <HtmlLangSetter />
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  )
}
