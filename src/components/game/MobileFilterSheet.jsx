// src/app/(main)/games/components/MobileFilterSheet.jsx
import { memo } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Filter, X } from 'lucide-react'

const MobileFilterSheet = memo(function MobileFilterSheet({
  open,
  onOpenChange,
  activeFiltersCount,
  status,
  fromDate,
  toDate,
  jackpotOnly,
  onStatusChange,
  onFromDateChange,
  onToDateChange,
  onJackpotOnlyChange,
  onApplyFilters,
  onResetFilters
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant='outline' className='w-full flex justify-between'>
          <span className='flex items-center'>
            <Filter className='mr-2 h-4 w-4' />
            Bộ lọc
          </span>
          {activeFiltersCount > 0 && (
            <Badge variant='secondary' className='ml-2'>
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side='right' className='w-[90vw] sm:w-[400px]'>
        <div className='space-y-6 py-4'>
          <div>
            <h3 className='text-lg font-semibold'>Bộ lọc</h3>
            <p className='text-sm text-muted-foreground'>Lọc danh sách lượt chơi theo nhu cầu của bạn</p>
          </div>

          <Separator />

          <div className='space-y-4'>
            <div>
              <label className='text-sm font-medium'>Trạng thái</label>
              <Select value={status} onValueChange={onStatusChange}>
                <SelectTrigger className='w-full mt-1'>
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

            <div>
              <label className='text-sm font-medium'>Từ ngày</label>
              <DatePicker date={fromDate} setDate={onFromDateChange} className='w-full mt-1' />
            </div>

            <div>
              <label className='text-sm font-medium'>Đến ngày</label>
              <DatePicker date={toDate} setDate={onToDateChange} className='w-full mt-1' />
            </div>

            <div className='flex items-center space-x-2'>
              <input
                type='checkbox'
                id='jackpotOnly-mobile'
                checked={jackpotOnly}
                onChange={e => onJackpotOnlyChange(e.target.checked)}
                className='rounded border-gray-300'
              />
              <label htmlFor='jackpotOnly-mobile' className='text-sm font-medium'>
                Chỉ hiển thị Jackpot
              </label>
            </div>
          </div>

          <Separator />

          <div className='flex gap-2'>
            <Button variant='outline' onClick={onResetFilters} className='flex-1'>
              <X className='mr-2 h-4 w-4' />
              Đặt lại
            </Button>
            <Button onClick={onApplyFilters} className='flex-1'>
              <Filter className='mr-2 h-4 w-4' />
              Áp dụng
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
})

export default MobileFilterSheet
