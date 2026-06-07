'use client'

import { useState, useEffect } from 'react'

export function useUserStorage(key: string): [unknown, (value: unknown) => void] {
  const [storedValue, setStoredValue] = useState<unknown>(null)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const item = localStorage.getItem(key)
      if (item !== null) {
        setStoredValue(JSON.parse(item))
      }
    } catch {
      // Corrupted JSON or other errors — return null gracefully
      setStoredValue(null)
    }
  }, [key])

  // Save to localStorage on state change
  const setValue = (value: unknown) => {
    try {
      if (value === null) {
        localStorage.removeItem(key)
      } else {
        localStorage.setItem(key, JSON.stringify(value))
      }
      setStoredValue(value)
    } catch {
      // Serialization failure — ignore silently
    }
  }

  return [storedValue, setValue]
}