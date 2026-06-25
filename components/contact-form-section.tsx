'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Mail, MapPin, Send } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'

export function ContactFormSection() {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    destination: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Thank you for your message! We will contact you soon.')
  }

  return (
    <section className="relative bg-background overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[700px]">
        {/* Left — Visual + Info */}
        <div className="relative hidden lg:block">
          <Image
            src="/images/Exterior/quetzal-navegando-1.webp"
            alt="Quetzal Liveaboard"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-primary/80" />

          <div className="relative z-10 flex flex-col justify-end h-full p-12 lg:p-16">
            <p className="font-sans text-xs md:text-sm text-accent uppercase tracking-[0.2em] mb-4">
              {t('contact.title')}
            </p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-normal text-white mb-6 tracking-tight leading-tight">
              {t('contact.description')}
            </h2>

            <div className="space-y-5 mt-8">
              <a
                href="mailto:contact@quetzalliveaboard.com"
                className="flex items-center gap-3 text-white/90 hover:text-white transition-colors group"
              >
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="font-sans text-sm">contact@quetzalliveaboard.com</span>
              </a>

              <div className="flex items-center gap-3 text-white/70">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="font-sans text-sm">Cabo San Lucas, Baja California Sur</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Form */}
        <div className="flex items-center bg-muted/30">
          <div className="w-full max-w-lg mx-auto px-6 py-16 lg:py-24">
            {/* Mobile header (hidden on desktop) */}
            <div className="lg:hidden mb-10">
              <p className="font-sans text-xs text-accent uppercase tracking-[0.2em] mb-3">
                {t('contact.title')}
              </p>
              <h2 className="font-serif text-3xl font-normal text-foreground mb-4">
                {t('contact.description')}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name + Email row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-sans text-xs font-semibold text-foreground uppercase tracking-wide">
                    {t('contact.name')} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-12 bg-background border-border focus-visible:ring-accent"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-sans text-xs font-semibold text-foreground uppercase tracking-wide">
                    {t('contact.emailField')} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-12 bg-background border-border focus-visible:ring-accent"
                  />
                </div>
              </div>

              {/* Destination */}
              <div className="space-y-2">
                <Label htmlFor="destination" className="font-sans text-xs font-semibold text-foreground uppercase tracking-wide">
                  {t('contact.destinations')} <span className="text-destructive">*</span>
                </Label>
                <Select
                  required
                  value={formData.destination}
                  onValueChange={(value) => setFormData({ ...formData, destination: value })}
                >
                  <SelectTrigger id="destination" className="w-full h-12 bg-background border-border focus:ring-accent">
                    <SelectValue placeholder={t('contact.destinations')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="socorro">Socorro Islands (Revillagigedo)</SelectItem>
                    <SelectItem value="sea-of-cortez">Sea of Cortez</SelectItem>
                    <SelectItem value="mag-bay-socorro">Magdalena Bay & Socorro Islands</SelectItem>
                    <SelectItem value="custom">Custom Itinerary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message" className="font-sans text-xs font-semibold text-foreground uppercase tracking-wide">
                  {t('contact.message')} <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="resize-none bg-background border-border focus-visible:ring-accent"
                  placeholder="Tell us about your dream expedition..."
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-sans font-semibold text-base h-12 gap-2"
              >
                <Send className="w-4 h-4" />
                {t('contact.submit')}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
