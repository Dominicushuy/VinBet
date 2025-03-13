'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { vi } from 'date-fns/locale'

import { cn } from '@/lib/utils'

import 'react-day-picker/dist/style.css'

function Calendar({ className, showOutsideDays = true, locale = vi, ...props }) {
  return (
    <DayPicker
      locale={locale}
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className='h-4 w-4' {...props} />,
        IconRight: ({ ...props }) => <ChevronRight className='h-4 w-4' {...props} />
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
