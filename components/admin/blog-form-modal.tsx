'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/language-context'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface BlogPost {
  id?: string
  title: string
  content: string
  imageUrl: string
  status: string
}

interface Props {
  post: BlogPost | null
  onClose: () => void
  onSuccess: () => void
}

export function BlogFormModal({ post, onClose, onSuccess }: Props) {
  const { t } = useLanguage()
  const isEditing = !!post?.id
  const [form, setForm] = useState<BlogPost>({
    title: post?.title || '',
    content: post?.content || '',
    imageUrl: post?.imageUrl || '',
    status: post?.status || 'draft',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: keyof BlogPost, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const url = isEditing ? `/api/admin/blog/${post.id}` : '/api/admin/blog'
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('admin.blog.edit') : t('admin.blog.add')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 rounded-md p-3">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-1 block">{t('admin.blog.formTitle')}</label>
            <Input
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder={t('admin.blog.formTitlePlaceholder')}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">{t('admin.blog.formContent')}</label>
            <Textarea
              value={form.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder={t('admin.blog.formContentPlaceholder')}
              rows={8}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">{t('admin.blog.formImageUrl')}</label>
            <Input
              value={form.imageUrl}
              onChange={(e) => handleChange('imageUrl', e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">{t('admin.blog.formStatus')}</label>
            <Select value={form.status} onValueChange={(v) => handleChange('status', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">{t('admin.blog.draft')}</SelectItem>
                <SelectItem value="published">{t('admin.blog.published')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.status === 'published' && (
            <div className="text-xs text-muted-foreground bg-accent/50 rounded-md p-3">
              {t('admin.blog.fifoWarning')}
            </div>
          )}

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
