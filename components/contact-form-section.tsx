'use client'

import React from "react"

import { useState } from 'react'
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
    // TODO: Send form data to API
    alert('Thank you for your message! We will contact you soon.')
  }

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left Side - Information */}
          <div className="lg:sticky lg:top-32">
            <h2 className="font-serif text-4xl md:text-5xl font-normal text-foreground mb-6">
              {t('contact.title')}
            </h2>
            <p className="font-sans text-lg text-muted-foreground mb-8 leading-relaxed">
              {t('contact.description')}
            </p>
            
            <div className="border-t border-border pt-6">
              <p className="font-sans text-foreground mb-1">{t('contact.email')}</p>
              <a 
                href="mailto:contact@quetzalliveaboard.com" 
                className="font-sans text-accent hover:text-accent/80 transition-colors text-lg"
              >
                contact@quetzalliveaboard.com
              </a>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="bg-card rounded-lg shadow-lg p-8 lg:p-10 border border-border">
            <p className="font-sans text-sm text-muted-foreground mb-6 text-right">
              {t('contact.required')}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="font-sans font-semibold text-foreground">
                  {t('contact.name')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="font-sans font-semibold text-foreground">
                  {t('contact.emailField')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full"
                />
              </div>

              {/* Destinations Field */}
              <div className="space-y-2">
                <Label htmlFor="destination" className="font-sans font-semibold text-foreground">
                  {t('contact.destinations')} <span className="text-destructive">*</span>
                </Label>
                <Select
                  required
                  value={formData.destination}
                  onValueChange={(value) => setFormData({ ...formData, destination: value })}
                >
                  <SelectTrigger id="destination" className="w-full">
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

              {/* Message Field */}
              <div className="space-y-2">
                <Label htmlFor="message" className="font-sans font-semibold text-foreground">
                  {t('contact.message')} <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full resize-none"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-[#0066FF] hover:bg-[#0052CC] text-white font-sans font-semibold text-lg py-6"
              >
                {t('contact.submit')}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
