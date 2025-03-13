// src/components/game/GameFilters.jsx
'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, X } from 'lucide-react'

export function GameFilters({ status, fromDate, toDate, onFilterChange }) {
  const [statusFilter, setStatusFilter] = useState(status || '')
  const [fromDateFilter, setFromDateFilter] = useState(fromDate || '')
  const [toDateFilter, setToDateFilter] = useState(toDate || '')

  const handleSubmit = e => {
    e.preventDefault()
    onFilterChange({
      // Nếu sử dụng giá trị "all" thì chuyển status sang undefined
      status: statusFilter === 'all' ? undefined : statusFilter,
      fromDate: fromDateFilter || undefined,
      toDate: toDateFilter || undefined
    })
  }

  const handleReset = () => {
    setStatusFilter('')
    setFromDateFilter('')
    setToDateFilter('')
    onFilterChange({
      status: undefined,
      fromDate: undefined,
      toDate: undefined
    })
  }

  return (
    <Card>
      <CardContent className='pt-6'>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div className='space-y-2'>
              <label className='text-sm font-medium' htmlFor='status'>
                Trạng thái
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id='status'>
                  <SelectValue placeholder='Tất cả' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Tất cả</SelectItem>
                  <SelectItem value='scheduled'>Sắp diễn ra</SelectItem>
                  <SelectItem value='active'>Đang diễn ra</SelectItem>
                  <SelectItem value='completed'>Đã kết thúc</SelectItem>
                  <SelectItem value='cancelled'>Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium' htmlFor='fromDate'>
                Từ ngày
              </label>
              <Input
                id='fromDate'
                type='date'
                value={fromDateFilter}
                onChange={e => setFromDateFilter(e.target.value)}
                className='w-full'
              />
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium' htmlFor='toDate'>
                Đến ngày
              </label>
              <Input
                id='toDate'
                type='date'
                value={toDateFilter}
                onChange={e => setToDateFilter(e.target.value)}
                className='w-full'
              />
            </div>
          </div>

          <div className='flex justify-end gap-2'>
            <Button type='button' variant='outline' onClick={handleReset}>
              <X className='mr-2 h-4 w-4' />
              Xóa bộ lọc
            </Button>
            <Button type='submit'>
              <Search className='mr-2 h-4 w-4' />
              Lọc
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
