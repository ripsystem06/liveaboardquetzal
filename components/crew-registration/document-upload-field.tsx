'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/language-context'
import { Trash2, Upload } from 'lucide-react'
import type { CrewDocumentKind } from '@/lib/validations'
import type { CrewGuestData } from './schema'

interface DocumentUploadFieldProps {
  reservationId: string
  guestId?: string
  kind: CrewDocumentKind
  documents?: CrewGuestData['documents']
  readOnly?: boolean
}

export function DocumentUploadField({
  reservationId,
  guestId,
  kind,
  documents,
  readOnly,
}: DocumentUploadFieldProps) {
  const { t } = useLanguage()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const existing = documents?.find((d) => d.kind === kind)
  const label = t(`crew.docs.${kind}`)

  const handleSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) void upload(file)
  }

  const upload = async (file: File) => {
    setBusy(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('guestId', guestId ?? '')
      formData.append('kind', kind)
      const response = await fetch(`/api/crew-registration/${reservationId}/documents`, {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) throw new Error('Upload failed')
      window.location.reload()
    } catch {
      setError(t('crew.form.error'))
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!existing) return
    setBusy(true)
    setError(null)
    try {
      const response = await fetch(
        `/api/crew-registration/${reservationId}/documents/${existing.id}`,
        { method: 'DELETE' }
      )
      if (!response.ok) throw new Error('Delete failed')
      window.location.reload()
    } catch {
      setError(t('crew.form.error'))
    } finally {
      setBusy(false)
    }
  }

  if (readOnly) {
    return (
      <div className="rounded-lg border border-border p-3">
        <span className="text-sm font-medium">{label}</span>
        <p className="mt-1 text-xs text-muted-foreground">
          {existing ? t('crew.docs.uploaded') : t('crew.docs.noFile')}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border p-3">
      <span className="text-sm font-medium">{label}</span>
      <p className="mt-1 text-xs text-muted-foreground">{t('crew.docs.hint')}</p>

      {existing ? (
        <p className="mt-2 text-xs font-medium text-green-700">
          {t('crew.docs.uploaded')}
        </p>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">{t('crew.docs.noFile')}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/jpeg,image/png"
        className="hidden"
        onChange={handleSelect}
        disabled={!guestId || busy}
      />

      <div className="mt-2 flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={!guestId || busy}
        >
          <Upload className="size-3.5" />
          {t('crew.docs.upload')}
        </Button>
        {existing && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={remove}
            disabled={busy}
            className="text-destructive"
          >
            <Trash2 className="size-3.5" />
            {t('crew.docs.remove')}
          </Button>
        )}
      </div>

      {!guestId && (
        <p className="mt-2 text-xs text-amber-600">{t('crew.docs.uploadDisabled')}</p>
      )}
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  )
}
