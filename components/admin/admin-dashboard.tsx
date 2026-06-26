'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/language-context'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableHead, TableRow, TableCell, TableHeader, TableBody } from '@/components/ui/table'
import { DollarSign, Clock, CheckCircle, Loader2 } from 'lucide-react'

interface RevenueByCruise {
  cruiseId: string
  cruiseName: string
  departureDate: string
  count: number
  totalGuests: number
  revenue: number
}

interface DashboardData {
  confirmedRevenue: number
  pendingCount: number
  confirmedCount: number
  revenueByCruise: RevenueByCruise[]
}

export function AdminDashboard() {
  const { t } = useLanguage()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/dashboard', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load dashboard')
        return res.json()
      })
      .then((data) => {
        setData(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        {t('admin.dashboard.error')}: {error}
      </div>
    )
  }

  if (!data) return null

  const stats = [
    {
      icon: DollarSign,
      label: t('admin.dashboard.confirmedRevenue'),
      value: `$${(data.confirmedRevenue || 0).toLocaleString()}`,
    },
    {
      icon: Clock,
      label: t('admin.dashboard.pendingCount'),
      value: String(data.pendingCount || 0),
    },
    {
      icon: CheckCircle,
      label: t('admin.dashboard.confirmedCount'),
      value: String(data.confirmedCount || 0),
    },
  ]

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-accent/10 p-3">
                <stat.icon className="size-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-semibold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue by Cruise Table */}
      <div>
        <h2 className="text-lg font-semibold mb-4">{t('admin.dashboard.revenueByCruise')}</h2>
        {data.revenueByCruise && data.revenueByCruise.length > 0 ? (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.cruise.name')}</TableHead>
                  <TableHead>{t('admin.cruise.departureDate')}</TableHead>
                  <TableHead className="text-right">{t('admin.dashboard.confirmedReservations')}</TableHead>
                  <TableHead className="text-right">{t('admin.dashboard.totalGuests')}</TableHead>
                  <TableHead className="text-right">{t('admin.dashboard.revenue')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.revenueByCruise.map((cruise) => (
                  <TableRow key={`${cruise.cruiseId}-${cruise.departureDate}`}>
                    <TableCell className="font-medium">{cruise.cruiseName}</TableCell>
                    <TableCell>{cruise.departureDate}</TableCell>
                    <TableCell className="text-right">{cruise.count}</TableCell>
                    <TableCell className="text-right">{cruise.totalGuests}</TableCell>
                    <TableCell className="text-right font-semibold">
                      ${cruise.revenue.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {t('admin.dashboard.noCruiseData')}
          </div>
        )}
      </div>
    </div>
  )
}
