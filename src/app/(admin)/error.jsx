'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

/**
 * Component xử lý lỗi cho Admin Layout
 * Được Next.js tự động sử dụng khi có lỗi xảy ra trong bất kỳ route nào thuộc admin
 */
export default function AdminError({ error, reset }) {
  useEffect(() => {
    // Log lỗi để debug
    console.error('Admin Layout error:', error)
  }, [error])

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-background text-center p-4'>
      <div className='max-w-md'>
        <h1 className='text-4xl font-bold mb-6 text-destructive'>Đã xảy ra lỗi</h1>

        <div className='mb-8 space-y-4'>
          <p className='text-lg'>Xin lỗi, đã có lỗi xảy ra khi tải trang quản trị. Vui lòng thử lại sau.</p>

          {/* Chỉ hiển thị thông tin lỗi trong dev mode */}
          {process.env.NODE_ENV === 'development' && (
            <div className='p-4 bg-destructive/10 rounded-lg text-left overflow-auto'>
              <p className='font-mono text-sm text-destructive mb-2'>
                {error?.name}: {error?.message}
              </p>
              {error?.stack && <pre className='text-xs text-destructive/80 overflow-auto max-h-40'>{error.stack}</pre>}
            </div>
          )}
        </div>

        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Button variant='default' size='lg' onClick={reset} className='w-full sm:w-auto'>
            <RefreshCw className='mr-2 h-4 w-4' />
            Thử lại
          </Button>

          <Button variant='outline' size='lg' asChild className='w-full sm:w-auto'>
            <Link href='/admin/dashboard'>
              <Home className='mr-2 h-4 w-4' />
              Quay lại Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
