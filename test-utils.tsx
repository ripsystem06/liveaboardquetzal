/// <reference types="vitest/globals" />

'use client'

import { render, type RenderOptions } from '@testing-library/react'
import { LanguageProvider } from '@/contexts/language-context'
import { UserProvider } from '@/contexts/user-context'

// Mock next/image
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    return <img {...props} />
  },
}))

// Mock next/navigation — push is exported so tests can assert redirects
export const routerPushMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: routerPushMock,
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

const AllProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <LanguageProvider>
      <UserProvider>{children}</UserProvider>
    </LanguageProvider>
  )
}

export const renderWithProviders = (ui: React.ReactElement, options?: RenderOptions) => {
  return render(ui, { wrapper: AllProviders, ...options })
}

// Re-export everything from testing-library
export * from '@testing-library/react'

// Re-export userEvent - need to access the .default property
import userEventDefault from '@testing-library/user-event'
export const userEvent = userEventDefault