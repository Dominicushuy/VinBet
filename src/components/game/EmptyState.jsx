// src/app/(main)/games/components/EmptyState.jsx
import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Gamepad2 } from 'lucide-react'

const EmptyState = memo(function EmptyState({ onResetFilters }) {
  return (
    <div className='p-12 text-center bg-muted/50 rounded-lg'>
      <Gamepad2 className='mx-auto h-12 w-12 text-muted-foreground mb-4' />
      <h3 className='text-lg font-medium'>Không tìm thấy lượt chơi nào</h3>
      <p className='text-muted-foreground mt-1 mb-4'>Không có lượt chơi nào phù hợp với các bộ lọc hiện tại</p>
      <Button variant='outline' onClick={onResetFilters}>
        Xóa bộ lọc
      </Button>
    </div>
  )
})

export default EmptyState
