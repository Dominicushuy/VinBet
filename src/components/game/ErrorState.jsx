// src/app/(main)/games/components/ErrorState.jsx
import { memo } from 'react'
import { Button } from '@/components/ui/button'

const ErrorState = memo(function ErrorState({ error, onRetry }) {
  return (
    <div className='p-8 text-center bg-destructive/10 rounded-lg'>
      <p className='text-destructive font-medium'>Không thể tải dữ liệu trò chơi.</p>
      <p className='text-sm text-muted-foreground mt-1'>{error.message}</p>
      <Button variant='outline' onClick={onRetry} className='mt-4'>
        Thử lại
      </Button>
    </div>
  )
})

export default ErrorState
