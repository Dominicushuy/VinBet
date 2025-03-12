import { Dices } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function EmptyState({ activeTab, onViewAll, statusLabels }) {
  const getStatusLabel = status => {
    return statusLabels[status] || status
  }

  return (
    <div className='text-center py-10 border rounded-md'>
      <div className='flex flex-col items-center space-y-3'>
        <Dices className='h-12 w-12 text-muted-foreground' />
        <h3 className='font-medium text-lg'>Không tìm thấy lượt chơi nào</h3>
        <p className='text-muted-foreground max-w-sm px-4'>
          {activeTab !== 'all'
            ? `Không có lượt chơi nào ở trạng thái "${getStatusLabel(activeTab)}"`
            : 'Bạn có thể tạo lượt chơi mới bằng cách nhấn nút "Tạo lượt chơi mới"'}
        </p>
        {activeTab !== 'all' && (
          <Button variant='outline' size='sm' onClick={onViewAll}>
            Xem tất cả lượt chơi
          </Button>
        )}
      </div>
    </div>
  )
}
