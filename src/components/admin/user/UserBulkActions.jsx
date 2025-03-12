// src/components/admin/UserBulkActions.jsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Mail, CheckCircle, Ban } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'

export function UserBulkActions({ selectedCount, onAction }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleAction = action => {
    onAction(action)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant='default' size='sm' disabled={selectedCount === 0}>
          Hành động ({selectedCount})
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thực hiện hành động hàng loạt</DialogTitle>
          <DialogDescription>Áp dụng hành động cho {selectedCount} người dùng đã chọn</DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          <Button variant='outline' className='justify-start' onClick={() => handleAction('gửi email')}>
            <Mail className='mr-2 h-4 w-4' />
            Gửi email thông báo
          </Button>
          <Button variant='outline' className='justify-start' onClick={() => handleAction('kích hoạt')}>
            <CheckCircle className='mr-2 h-4 w-4 text-green-500' />
            Kích hoạt tài khoản
          </Button>
          <Button variant='outline' className='justify-start text-red-500' onClick={() => handleAction('khóa')}>
            <Ban className='mr-2 h-4 w-4' />
            Khóa tài khoản
          </Button>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => setIsOpen(false)}>
            Hủy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
