'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/contexts/language-context'
import { Table, TableHead, TableRow, TableCell, TableHeader, TableBody } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CruiseFormModal } from '@/components/admin/cruise-form-modal'
import { Loader2, Plus, Pencil, Trash2, RefreshCw } from 'lucide-react'

interface Cruise {
  id: string
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
  createdAt: string
}

export function AdminCruises() {
  const { t } = useLanguage()
  const [cruises, setCruises] = useState<Cruise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCruise, setEditingCruise] = useState<Cruise | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchCruises = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/cruises', { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to load cruises')
      const data = await res.json()
      setCruises(data.cruises || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCruises()
  }, [fetchCruises])

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.cruises.confirmDelete'))) return
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/cruises/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Delete failed')
      }
      await fetchCruises()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setActionLoading(null)
    }
  }

  const openEdit = (cruise: Cruise) => {
    setEditingCruise(cruise)
    setModalOpen(true)
  }

  const openAdd = () => {
    setEditingCruise(null)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingCruise(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-lg font-semibold">{t('admin.cruises.title')}</h2>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={fetchCruises}>
            <RefreshCw className="size-4" />
          </Button>
          <Button size="sm" onClick={openAdd}>
            <Plus className="size-4" />
            {t('admin.cruises.add')}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-destructive">{error}</div>
      ) : cruises.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {t('admin.cruises.empty')}
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.cruise.name')}</TableHead>
                <TableHead>{t('admin.cruise.departureDate')}</TableHead>
                <TableHead>{t('admin.cruise.route')}</TableHead>
                <TableHead>{t('admin.cruise.boat')}</TableHead>
                <TableHead className="text-right">{t('admin.cruise.basic')}</TableHead>
                <TableHead className="text-right">{t('admin.cruise.standard')}</TableHead>
                <TableHead className="text-right">{t('admin.cruise.premium')}</TableHead>
                <TableHead>{t('admin.cruise.status')}</TableHead>
                <TableHead>{t('admin.common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cruises.map((cruise) => (
                <TableRow key={cruise.id}>
                  <TableCell className="font-medium">{cruise.name}</TableCell>
                  <TableCell>{cruise.departureDate}</TableCell>
                  <TableCell className="text-muted-foreground">{cruise.route}</TableCell>
                  <TableCell>{cruise.boat}</TableCell>
                  <TableCell className="text-right">${cruise.basicPrice.toLocaleString()}</TableCell>
                  <TableCell className="text-right">${cruise.standardPrice.toLocaleString()}</TableCell>
                  <TableCell className="text-right">${cruise.premiumPrice.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={cruise.isActive ? 'default' : 'secondary'}>
                      {cruise.isActive ? t('admin.cruise.active') : t('admin.cruise.inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(cruise)}
                        title={t('admin.common.edit')}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(cruise.id)}
                        disabled={actionLoading === cruise.id}
                        title={t('admin.common.delete')}
                      >
                        {actionLoading === cruise.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {modalOpen && (
        <CruiseFormModal
          cruise={editingCruise}
          onClose={closeModal}
          onSuccess={fetchCruises}
        />
      )}
    </div>
  )
}
