'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { RefreshCw } from 'lucide-react'

export function ErrorBoundary({ children, fallback }) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleError = event => {
      event.preventDefault()
      console.error('Error caught by ErrorBoundary:', event.error)
      setHasError(true)
      setError(event.error || new Error('Unknown error'))
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  const handleRetry = () => {
    setHasError(false)
    setError(null)
    window.location.reload()
  }

  if (hasError) {
    if (fallback) {
      return fallback
    }

    return (
      <Alert variant='destructive' className='mb-6'>
        <AlertTitle className='text-lg font-semibold mb-2'>Có lỗi xảy ra</AlertTitle>
        <AlertDescription className='space-y-4'>
          <p>Đã có lỗi khi tải dữ liệu. Vui lòng thử lại sau.</p>
          {error && process.env.NODE_ENV === 'development' && (
            <pre className='p-2 bg-red-50 dark:bg-red-900/20 rounded-md text-sm overflow-auto'>{error.toString()}</pre>
          )}
          <div>
            <Button variant='outline' onClick={handleRetry} className='mt-2'>
              <RefreshCw className='h-4 w-4 mr-2' />
              Tải lại trang
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return children
}

// ErrorBoundary cũng hỗ trợ fallback component được truyền vào
// ví dụ: <ErrorBoundary fallback={<CustomError />}>...</ErrorBoundary>
