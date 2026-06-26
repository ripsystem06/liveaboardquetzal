'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/language-context'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

interface Cruise {
  id?: string
  name: string
  departureDate: string
  returnDate: string
  route: string
  boat: string
  basicPrice: number
  standardPrice: number
  premiumPrice: number
  dives: number
  isActive: boolean
}

interface Props {
  cruise: Cruise | null
  onClose: () => void
  onSuccess: () => void
}

export function CruiseFormModal({ cruise, onClose, onSuccess }: Props) {
  const { t } = useLanguage()
  const isEditing = !!cruise?.id
  const [form, setForm] = useState<Cruise>({
    name: cruise?.name || '',
    departureDate: cruise?.departureDate || '',
    returnDate: cruise?.returnDate || '',
    route: cruise?.route || '',
    boat: cruise?.boat || 'Quetzal',
    basicPrice: cruise?.basicPrice || 0,
    standardPrice: cruise?.standardPrice || 0,
    premiumPrice: cruise?.premiumPrice || 0,
    dives: cruise?.dives || 5,
    isActive: cruise?.isActive ?? true,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: keyof Cruise, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const url = isEditing ? `/api/admin/cruises/${cruise.id}` : '/api/admin/cruises'
      const method = isEditing ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Save failed')
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('admin.cruises.edit') : t('admin.cruises.add')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 rounded-md p-3">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium mb-1 block">{t('admin.cruise.name')}</label>
              <Input
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder={t('admin.cruise.namePlaceholder')}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{t('admin.cruise.departureDate')}</label>
              <Input
                type="date"
                value={form.departureDate}
                onChange={(e) => handleChange('departureDate', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{t('admin.cruise.returnDate')}</label>
              <Input
                type="date"
                value={form.returnDate}
                onChange={(e) => handleChange('returnDate', e.target.value)}
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium mb-1 block">{t('admin.cruise.route')}</label>
              <Input
                value={form.route}
                onChange={(e) => handleChange('route', e.target.value)}
                placeholder={t('admin.cruise.routePlaceholder')}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{t('admin.cruise.boat')}</label>
              <Input
                value={form.boat}
                onChange={(e) => handleChange('boat', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{t('admin.cruise.dives')}</label>
              <Input
                type="number"
                min={1}
                value={form.dives}
                onChange={(e) => handleChange('dives', Number(e.target.value))}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{t('admin.cruise.basic')} ($)</label>
              <Input
                type="number"
                min={0}
                value={form.basicPrice}
                onChange={(e) => handleChange('basicPrice', Number(e.target.value))}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{t('admin.cruise.standard')} ($)</label>
              <Input
                type="number"
                min={0}
                value={form.standardPrice}
                onChange={(e) => handleChange('standardPrice', Number(e.target.value))}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{t('admin.cruise.premium')} ($)</label>
              <Input
                type="number"
                min={0}
                value={form.premiumPrice}
                onChange={(e) => handleChange('premiumPrice', Number(e.target.value))}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('admin.common.cancel')}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              {t('admin.common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
