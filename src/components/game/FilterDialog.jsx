// src/app/(main)/games/components/FilterDialog.jsx
import { memo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { Button } from '@/components/ui/button'
import { Filter, X } from 'lucide-react'

const FilterDialog = memo(function FilterDialog({
  open,
  onClose,
  status,
  sortBy,
  fromDate,
  toDate,
  jackpotOnly,
  onStatusChange,
  onSortByChange,
  onFromDateChange,
  onToDateChange,
  onJackpotOnlyChange,
  onApplyFilters,
  onResetFilters
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Bộ lọc nâng cao</DialogTitle>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Trạng thái</label>
              <Select value={status} onValueChange={onStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder='Tất cả trạng thái' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Tất cả</SelectItem>
                  <SelectItem value='active'>Đang diễn ra</SelectItem>
                  <SelectItem value='scheduled'>Sắp diễn ra</SelectItem>
                  <SelectItem value='completed'>Đã kết thúc</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>Sắp xếp theo</label>
              <Select value={sortBy} onValueChange={onSortByChange}>
                <SelectTrigger>
                  <SelectValue placeholder='Sắp xếp theo' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='newest'>Mới nhất</SelectItem>
                  <SelectItem value='endingSoon'>Sắp kết thúc</SelectItem>
                  <SelectItem value='mostPlayed'>Nhiều lượt chơi</SelectItem>
                  <SelectItem value='highestPot'>Tiền thưởng cao</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Từ ngày</label>
              <DatePicker date={fromDate} setDate={onFromDateChange} />
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>Đến ngày</label>
              <DatePicker date={toDate} setDate={onToDateChange} />
            </div>
          </div>

          <div className='flex items-center space-x-2'>
            <input
              type='checkbox'
              id='jackpotOnly'
              checked={jackpotOnly}
              onChange={e => onJackpotOnlyChange(e.target.checked)}
              className='rounded border-gray-300'
            />
            <label htmlFor='jackpotOnly' className='text-sm font-medium'>
              Chỉ hiển thị Jackpot
            </label>
          </div>
        </div>
        <div className='flex justify-between'>
          <Button variant='outline' onClick={onResetFilters}>
            <X className='mr-2 h-4 w-4' />
            Đặt lại
          </Button>
          <Button onClick={onApplyFilters}>
            <Filter className='mr-2 h-4 w-4' />
            Áp dụng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
})

export default FilterDialog
