import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest-setup.ts'],
    globals: true,
    include: ['**/*.test.{ts,tsx}'],
    server: {
      deps: {
        inline: ['next-auth'],
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
      // Next.js 16 ESM/CJS compat: help Vitest resolve next/server
      'next/server': path.resolve(__dirname, 'node_modules/next/server.js'),
    },
    conditions: ['node', 'import', 'module', 'default'],
  },
})