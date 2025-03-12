import { useState, useCallback } from 'react'
import { format } from 'date-fns'
import { Filter, Calendar, ChevronDown, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export function GameFilters({ onSearch, onDateFilter, onPageSizeChange, pageSize, resetFilters }) {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearchChange = useCallback(e => {
    setSearchTerm(e.target.value)
  }, [])

  const handleSearchSubmit = useCallback(
    e => {
      e.preventDefault()
      onSearch(searchTerm)
    },
    [onSearch, searchTerm]
  )

  return (
    <div className='flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3'>
      <div className='flex flex-wrap items-center gap-2 w-full md:w-auto'>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant='outline' size='sm' className='w-full sm:w-auto'>
              <Filter className='mr-2 h-4 w-4' />
              <span className='hidden sm:inline'>Bộ lọc</span>
              <ChevronDown className='ml-2 h-4 w-4' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-80'>
            <div className='grid gap-4'>
              <div className='space-y-2'>
                <h4 className='font-medium leading-none'>Khoảng thời gian</h4>
                <div className='flex flex-col sm:flex-row items-center gap-2'>
                  <Input
                    type='date'
                    placeholder='Từ ngày'
                    onChange={e => onDateFilter(e.target.value, undefined)}
                    className='w-full'
                  />
                  <Input
                    type='date'
                    placeholder='Đến ngày'
                    onChange={e => onDateFilter(undefined, e.target.value)}
                    className='w-full'
                  />
                </div>
              </div>
              <div className='grid grid-cols-2 gap-2'>
                <Button
                  variant='outline'
                  className='justify-start'
                  onClick={() => {
                    const today = format(new Date(), 'yyyy-MM-dd')
                    onDateFilter(today, today)
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
                    const yesterdayStr = format(yesterday, 'yyyy-MM-dd')
                    onDateFilter(yesterdayStr, yesterdayStr)
                  }}
                >
                  <Calendar className='mr-2 h-4 w-4' />
                  Hôm qua
                </Button>
              </div>
              <div className='grid grid-cols-2 gap-2'>
                <Button
                  variant='outline'
                  className='justify-start'
                  onClick={() => {
                    const today = new Date()
                    const weekStart = new Date(today)
                    weekStart.setDate(today.getDate() - today.getDay())
                    onDateFilter(format(weekStart, 'yyyy-MM-dd'), format(today, 'yyyy-MM-dd'))
                  }}
                >
                  <Calendar className='mr-2 h-4 w-4' />
                  Tuần này
                </Button>
                <Button
                  variant='outline'
                  className='justify-start'
                  onClick={() => {
                    const today = new Date()
                    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
                    onDateFilter(format(monthStart, 'yyyy-MM-dd'), format(today, 'yyyy-MM-dd'))
                  }}
                >
                  <Calendar className='mr-2 h-4 w-4' />
                  Tháng này
                </Button>
              </div>
              <Button variant='outline' onClick={resetFilters}>
                Đặt lại bộ lọc
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <form onSubmit={handleSearchSubmit} className='flex items-center space-x-1 flex-1 sm:flex-auto'>
          <Input
            placeholder='Tìm kiếm...'
            className='w-full sm:w-[150px] h-8'
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <Button type='submit' variant='ghost' size='icon' className='h-8 w-8'>
            <Search className='h-4 w-4' />
            <span className='sr-only'>Tìm kiếm</span>
          </Button>
        </form>
      </div>

      <div className='flex items-center space-x-2 w-full md:w-auto'>
        <Select value={pageSize.toString()} onValueChange={onPageSizeChange}>
          <SelectTrigger className='w-full sm:w-[120px] h-8'>
            <SelectValue placeholder='10 mỗi trang' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='10'>10 mỗi trang</SelectItem>
            <SelectItem value='20'>20 mỗi trang</SelectItem>
            <SelectItem value='50'>50 mỗi trang</SelectItem>
            <SelectItem value='100'>100 mỗi trang</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
