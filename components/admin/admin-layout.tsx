'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, CalendarDays, Ship, FileText, ClipboardList, LogOut } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import { useUser } from '@/contexts/user-context'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { AdminReservations } from '@/components/admin/admin-reservations'
import { AdminCruises } from '@/components/admin/admin-cruises'
import { AdminBlog } from '@/components/admin/admin-blog'
import { AdminCrewReview } from '@/components/admin/admin-crew-review'

type AdminTab = 'dashboard' | 'reservations' | 'cruises' | 'blog' | 'crew'

export function AdminLayout() {
  const { t } = useLanguage()
  const { logout } = useUser()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const navItems: { id: AdminTab; icon: typeof LayoutDashboard; label: string }[] = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('admin.dashboard') },
    { id: 'reservations', icon: CalendarDays, label: t('admin.reservations') },
    { id: 'cruises', icon: Ship, label: t('admin.cruises') },
    { id: 'blog', icon: FileText, label: t('admin.blog') },
    { id: 'crew', icon: ClipboardList, label: t('admin.crewReview') },
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
          <nav className="rounded-2xl bg-card p-3 shadow-[0_2px_8px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)] space-y-1 flex flex-col min-h-[calc(100vh-16rem)]">
            <div className="space-y-1 flex-1">
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
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 mt-auto"
            >
              <LogOut className="size-5" />
              {t('admin.logout')}
            </button>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <div className="rounded-2xl bg-card p-8 shadow-[0_2px_8px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)]">
            {activeTab === 'dashboard' && <AdminDashboard />}
            {activeTab === 'reservations' && <AdminReservations />}
            {activeTab === 'cruises' && <AdminCruises />}
            {activeTab === 'blog' && <AdminBlog />}
            {activeTab === 'crew' && <AdminCrewReview />}
          </div>
        </main>
      </div>
    </div>
  )
}
