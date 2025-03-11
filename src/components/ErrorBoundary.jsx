// src/components/ErrorBoundary.jsx
'use client'

import { useEffect, useState } from 'react'

export function ErrorBoundary({ children, fallback }) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const errorHandler = error => {
      console.error('Error caught by ErrorBoundary:', error)
      setHasError(true)
    }

    window.addEventListener('error', errorHandler)
    return () => window.removeEventListener('error', errorHandler)
  }, [])

  if (hasError) {
    return fallback
  }

  return children
}
