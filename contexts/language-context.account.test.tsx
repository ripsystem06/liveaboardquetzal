import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { LanguageProvider, useLanguage } from '@/contexts/language-context'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
)

describe('account translations', () => {
  describe('English', () => {
    it('has account.title in English', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      act(() => {
        result.current.setLanguage('en')
      })
      expect(result.current.t('account.title')).toBe('My Account')
    })

    it('has account.profile in English', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      act(() => {
        result.current.setLanguage('en')
      })
      expect(result.current.t('account.profile')).toBe('Profile')
    })

    it('has account.reservations in English', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      act(() => {
        result.current.setLanguage('en')
      })
      expect(result.current.t('account.reservations')).toBe('Reservation History')
    })

    it('has account.save in English', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      act(() => {
        result.current.setLanguage('en')
      })
      expect(result.current.t('account.save')).toBe('Save')
    })

    it('has account.edit in English', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      act(() => {
        result.current.setLanguage('en')
      })
      expect(result.current.t('account.edit')).toBe('Edit')
    })

    it('has account.name in English', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      act(() => {
        result.current.setLanguage('en')
      })
      expect(result.current.t('account.name')).toBe('Name')
    })

    it('has account.phone in English', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      act(() => {
        result.current.setLanguage('en')
      })
      expect(result.current.t('account.phone')).toBe('Phone')
    })

    it('has account.noReservations in English', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      act(() => {
        result.current.setLanguage('en')
      })
      expect(result.current.t('account.noReservations')).toBe('No reservations yet')
    })

    it('has account.saveSuccess in English', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      act(() => {
        result.current.setLanguage('en')
      })
      expect(result.current.t('account.saveSuccess')).toBe('Profile updated successfully')
    })

    it('has account.status.pending in English', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      act(() => {
        result.current.setLanguage('en')
      })
      expect(result.current.t('account.status.pending')).toBe('Pending')
    })

    it('has account.status.confirmed in English', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      act(() => {
        result.current.setLanguage('en')
      })
      expect(result.current.t('account.status.confirmed')).toBe('Confirmed')
    })

    it('has account.status.completed in English', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      act(() => {
        result.current.setLanguage('en')
      })
      expect(result.current.t('account.status.completed')).toBe('Completed')
    })
  })

  describe('Spanish', () => {
    it('has account.title in Spanish', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      act(() => {
        result.current.setLanguage('es')
      })
      expect(result.current.t('account.title')).toBe('Mi Cuenta')
    })

    it('has account.profile in Spanish', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      act(() => {
        result.current.setLanguage('es')
      })
      expect(result.current.t('account.profile')).toBe('Perfil')
    })

    it('has account.reservations in Spanish', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      act(() => {
        result.current.setLanguage('es')
      })
      expect(result.current.t('account.reservations')).toBe('Historial de Reservas')
    })

    it('has account.save in Spanish', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      act(() => {
        result.current.setLanguage('es')
      })
      expect(result.current.t('account.save')).toBe('Guardar')
    })

    it('has account.edit in Spanish', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      act(() => {
        result.current.setLanguage('es')
      })
      expect(result.current.t('account.edit')).toBe('Editar')
    })

    it('has account.name in Spanish', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      act(() => {
        result.current.setLanguage('es')
      })
      expect(result.current.t('account.name')).toBe('Nombre')
    })

    it('has account.email in Spanish', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      act(() => {
        result.current.setLanguage('es')
      })
      expect(result.current.t('account.email')).toBe('Correo Electrónico')
    })

    it('has account.phone in Spanish', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      act(() => {
        result.current.setLanguage('es')
      })
      expect(result.current.t('account.phone')).toBe('Teléfono')
    })

    it('has account.noReservations in Spanish', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      act(() => {
        result.current.setLanguage('es')
      })
      expect(result.current.t('account.noReservations')).toBe('Sin reservas aún')
    })

    it('has account.saveSuccess in Spanish', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      act(() => {
        result.current.setLanguage('es')
      })
      expect(result.current.t('account.saveSuccess')).toBe('Perfil actualizado correctamente')
    })

    it('has account.status.pending in Spanish', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      act(() => {
        result.current.setLanguage('es')
      })
      expect(result.current.t('account.status.pending')).toBe('Pendiente')
    })

    it('has account.status.confirmed in Spanish', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      act(() => {
        result.current.setLanguage('es')
      })
      expect(result.current.t('account.status.confirmed')).toBe('Confirmado')
    })

    it('has account.status.completed in Spanish', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      act(() => {
        result.current.setLanguage('es')
      })
      expect(result.current.t('account.status.completed')).toBe('Completado')
    })
  })
})