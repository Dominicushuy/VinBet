// src/components/ui/date-range-picker.jsx
'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export function DateRangePicker({ className, dateRange, onChange }) {
  const [date, setDate] = React.useState(
    dateRange || {
      from: undefined,
      to: undefined
    }
  )

  // Update local state when the props change
  React.useEffect(() => {
    if (dateRange?.from !== date?.from || dateRange?.to !== date?.to) {
      setDate(dateRange || { from: undefined, to: undefined })
    }
  }, [dateRange, date])

  const handleSelect = newDate => {
    setDate(newDate)
    if (onChange && newDate.from && newDate.to) {
      onChange(newDate)
    }
  }

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id='date'
            variant={'outline'}
            className={cn('w-full justify-start text-left font-normal', !date?.from && 'text-muted-foreground')}
          >
            <CalendarIcon className='mr-2 h-4 w-4' />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'dd/MM/yyyy', { locale: vi })} - {format(date.to, 'dd/MM/yyyy', { locale: vi })}
                </>
              ) : (
                format(date.from, 'dd/MM/yyyy', { locale: vi })
              )
            ) : (
              <span>Chọn khoảng thời gian</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar
            initialFocus
            mode='range'
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            locale={vi}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
