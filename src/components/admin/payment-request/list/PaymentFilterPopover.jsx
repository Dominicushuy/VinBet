// src/components/admin/payment-request/list/PaymentFilterPopover.jsx
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Filter, Calendar } from 'lucide-react'

export function PaymentFilterPopover({ dateRange, setDateRange, onReset }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm'>
          <Filter className='mr-2 h-4 w-4' />
          Bộ lọc
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-80'>
        <div className='grid gap-4'>
          <div className='space-y-2'>
            <h4 className='font-medium leading-none'>Khoảng thời gian</h4>
            <DateRangePicker dateRange={dateRange} onChange={setDateRange} />
          </div>
          <div className='grid grid-cols-2 gap-2'>
            <Button
              variant='outline'
              className='justify-start'
              onClick={() => {
                const today = new Date()
                setDateRange({ from: today, to: today })
              }}
            >
              <Calendar className='mr-2 h-4 w-4' />
              Hôm nay
            </Button>
            <Button
              variant='outline'
              className='justify-start'
              onClick={() => {
                const today = new Date()
                const yesterday = new Date(today)
                yesterday.setDate(yesterday.getDate() - 1)
                setDateRange({ from: yesterday, to: yesterday })
              }}
            >
              <Calendar className='mr-2 h-4 w-4' />
              Hôm qua
            </Button>
          </div>
          <Button variant='outline' onClick={onReset}>
            Reset bộ lọc
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
