'use client'

import { useState } from 'react'
import { LayoutDashboard, CalendarDays, Ship, FileText } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { AdminReservations } from '@/components/admin/admin-reservations'
import { AdminCruises } from '@/components/admin/admin-cruises'
import { AdminBlog } from '@/components/admin/admin-blog'

type AdminTab = 'dashboard' | 'reservations' | 'cruises' | 'blog'

export function AdminLayout() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')

  const navItems: { id: AdminTab; icon: typeof LayoutDashboard; label: string }[] = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('admin.dashboard') },
    { id: 'reservations', icon: CalendarDays, label: t('admin.reservations') },
    { id: 'cruises', icon: Ship, label: t('admin.cruises') },
    { id: 'blog', icon: FileText, label: t('admin.blog') },
  ]

  return (
    <div className="container mx-auto py-8 px-4 lg:px-8">
      {/* Header */}
      <div className="mb-10">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">
          {t('admin.title')}
        </p>
        <h1 className="font-serif text-3xl md:text-4xl font-normal text-foreground text-balance">
          {t('admin.heading')}
        </h1>
      </div>

      {/* Sidebar + Content Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-60 shrink-0">
          <nav className="rounded-2xl bg-card p-3 shadow-[0_2px_8px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)] space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-accent text-accent-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="size-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <div className="rounded-2xl bg-card p-8 shadow-[0_2px_8px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)]">
            {activeTab === 'dashboard' && <AdminDashboard />}
            {activeTab === 'reservations' && <AdminReservations />}
            {activeTab === 'cruises' && <AdminCruises />}
            {activeTab === 'blog' && <AdminBlog />}
          </div>
        </main>
      </div>
    </div>
  )
}
