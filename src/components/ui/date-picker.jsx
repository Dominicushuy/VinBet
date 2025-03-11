'use client'

import React from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export function DatePicker({ date, setDate, className, placeholder = 'Chọn ngày...' }) {
  return (
    <div className={cn('relative', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}
          >
            <CalendarIcon className='mr-2 h-4 w-4' />
            {date ? format(date, 'dd/MM/yyyy', { locale: vi }) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar mode='single' selected={date} onSelect={setDate} initialFocus locale={vi} />
        </PopoverContent>
      </Popover>
    </div>
  )
}
