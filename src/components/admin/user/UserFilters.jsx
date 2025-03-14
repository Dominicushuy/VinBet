// src/components/admin/UserFilters.jsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Filter } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function UserFilters({ filters, onFilterChange, onReset }) {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState(filters)

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleApply = () => {
    onFilterChange(localFilters)
    setIsOpen(false)
  }

  const handleReset = () => {
    const resetFilters = {
      role: 'all',
      status: 'all',
      sortBy: 'created_at',
      sortOrder: 'desc'
    }
    setLocalFilters(resetFilters)
    onReset(resetFilters)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>
          <Filter className='mr-2 h-4 w-4' />
          Bộ lọc
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bộ lọc người dùng</DialogTitle>
          <DialogDescription>Điều chỉnh các bộ lọc để tìm kiếm người dùng</DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <label htmlFor='role' className='text-right'>
              Vai trò
            </label>
            <Select value={localFilters.role || 'all'} onValueChange={value => handleFilterChange('role', value)}>
              <SelectTrigger className='col-span-3'>
                <SelectValue placeholder='Tất cả vai trò' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Tất cả vai trò</SelectItem>
                <SelectItem value='admin'>Admin</SelectItem>
                <SelectItem value='user'>Người dùng</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <label htmlFor='status' className='text-right'>
              Trạng thái
            </label>
            <Select value={localFilters.status || 'all'} onValueChange={value => handleFilterChange('status', value)}>
              <SelectTrigger className='col-span-3'>
                <SelectValue placeholder='Tất cả trạng thái' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Tất cả trạng thái</SelectItem>
                <SelectItem value='active'>Hoạt động</SelectItem>
                <SelectItem value='blocked'>Đã khóa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <label htmlFor='sort' className='text-right'>
              Sắp xếp theo
            </label>
            <div className='col-span-3 flex gap-2'>
              <Select
                value={localFilters.sortBy || 'created_at'}
                onValueChange={value => handleFilterChange('sortBy', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Sắp xếp theo' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='created_at'>Ngày đăng ký</SelectItem>
                  <SelectItem value='username'>Tên người dùng</SelectItem>
                  <SelectItem value='balance'>Số dư</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={localFilters.sortOrder || 'desc'}
                onValueChange={value => handleFilterChange('sortOrder', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Thứ tự' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='asc'>Tăng dần</SelectItem>
                  <SelectItem value='desc'>Giảm dần</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleApply}>Áp dụng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
