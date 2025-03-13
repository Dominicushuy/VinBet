// src/app/(main)/games/components/FilterBadges.jsx
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { memo } from 'react'

const FilterBadges = memo(function FilterBadges({
  activeFiltersCount,
  status,
  searchQuery,
  fromDate,
  toDate,
  jackpotOnly,
  onRemoveFilter,
  onResetAllFilters
}) {
  if (activeFiltersCount === 0) return null

  return (
    <div className='flex flex-wrap gap-2 items-center p-2 bg-muted/50 rounded-lg'>
      <span className='text-sm text-muted-foreground font-medium px-2'>Bộ lọc:</span>

      {status !== 'all' && (
        <Badge variant='secondary' className='gap-1 group'>
          Trạng thái: {status === 'active' ? 'Đang diễn ra' : status === 'scheduled' ? 'Sắp diễn ra' : 'Đã kết thúc'}
          <X className='h-3 w-3 cursor-pointer' onClick={() => onRemoveFilter('status')} />
        </Badge>
      )}

      {searchQuery && (
        <Badge variant='secondary' className='gap-1'>
          Tìm kiếm: {searchQuery}
          <X className='h-3 w-3 cursor-pointer' onClick={() => onRemoveFilter('query')} />
        </Badge>
      )}

      {fromDate && (
        <Badge variant='secondary' className='gap-1'>
          Từ: {fromDate.toLocaleDateString('vi-VN')}
          <X className='h-3 w-3 cursor-pointer' onClick={() => onRemoveFilter('fromDate')} />
        </Badge>
      )}

      {toDate && (
        <Badge variant='secondary' className='gap-1'>
          Đến: {toDate.toLocaleDateString('vi-VN')}
          <X className='h-3 w-3 cursor-pointer' onClick={() => onRemoveFilter('toDate')} />
        </Badge>
      )}

      {jackpotOnly && (
        <Badge variant='secondary' className='gap-1'>
          Chỉ Jackpot
          <X className='h-3 w-3 cursor-pointer' onClick={() => onRemoveFilter('jackpotOnly')} />
        </Badge>
      )}

      <Button variant='ghost' size='sm' onClick={onResetAllFilters} className='ml-auto'>
        <X className='mr-1 h-3 w-3' />
        Xóa tất cả
      </Button>
    </div>
  )
})

export default FilterBadges
