'use client'

import { Button } from '@/components/ui/button'

function AdminErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className='p-8 text-center'>
      <h3 className='text-xl font-semibold mb-3'>Đã xảy ra lỗi</h3>
      <p className='mb-4 text-muted-foreground'>Có lỗi khi hiển thị nội dung, vui lòng thử lại sau.</p>
      {error && (
        <div className='bg-destructive/10 rounded-lg p-4 mb-4 max-w-md mx-auto'>
          <p className='text-destructive text-sm'>{error.message}</p>
        </div>
      )}
      <Button
        onClick={() => {
          // Option 1: Reload the page
          window.location.reload()

          // Option 2: If using error boundary reset
          // resetErrorBoundary()
        }}
        variant='destructive'
      >
        Tải lại trang
      </Button>
    </div>
  )
}

export default AdminErrorFallback
