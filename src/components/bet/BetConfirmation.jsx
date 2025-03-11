'use client'

import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export function BetConfirmation({ open, onOpenChange, gameRound, chosenNumber, amount, onConfirm, isLoading }) {
  // Tiền thưởng tiềm năng (hệ số 9x)
  const potentialWin = amount * 9

  // Format tiền Việt Nam
  const formatMoney = value => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Xác nhận đặt cược</DialogTitle>
          <DialogDescription>Vui lòng kiểm tra thông tin cược của bạn trước khi xác nhận</DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <div className='grid grid-cols-2 gap-2 text-sm'>
            <div className='font-medium'>Lượt chơi:</div>
            <div>#{gameRound.id.substring(0, 8)}</div>

            <div className='font-medium'>Thời gian kết thúc:</div>
            <div>
              {format(new Date(gameRound.end_time), 'HH:mm, dd/MM/yyyy', {
                locale: vi
              })}
            </div>

            <div className='font-medium'>Số đã chọn:</div>
            <div className='font-bold text-primary'>{chosenNumber}</div>

            <div className='font-medium'>Số tiền cược:</div>
            <div>{formatMoney(amount)}</div>

            <div className='font-medium'>Tiền thưởng tiềm năng:</div>
            <div className='font-bold text-primary'>{formatMoney(potentialWin)}</div>
          </div>
        </div>

        <DialogFooter className='sm:justify-end'>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={isLoading}>
            Hủy
          </Button>
          <Button type='button' onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Đang xử lý...
              </>
            ) : (
              'Xác nhận đặt cược'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
