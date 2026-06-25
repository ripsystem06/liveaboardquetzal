import '@testing-library/jest-dom'

// Mock fetch globally for session cookie endpoint
vi.stubGlobal('fetch', vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ ok: true }),
  })
))