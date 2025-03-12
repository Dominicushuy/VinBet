// src/components/admin/game-detail/dialogs/ResultDialog.jsx
'use client'

import { useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'

const gameResultSchema = z.object({
  result: z.string().min(1, 'Kết quả là bắt buộc'),
  notes: z.string().optional()
})

export function ResultDialog({ open, onClose, onSubmit, isLoading, game, betStats }) {
  const form = useForm({
    resolver: zodResolver(gameResultSchema),
    defaultValues: {
      result: '',
      notes: ''
    }
  })

  // Reset form khi dialog mở
  useEffect(() => {
    if (open) {
      form.reset({ result: '', notes: '' })
    }
  }, [open, form])

  const formatDate = date => {
    if (!date) return 'N/A'
    return format(new Date(date), 'HH:mm, dd/MM/yyyy')
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Nhập kết quả lượt chơi</DialogTitle>
          <DialogDescription>Nhập kết quả trò chơi để xác định người thắng cuộc</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <h3 className='text-sm font-medium'>Thông tin lượt chơi</h3>
              <Badge>{game.status}</Badge>
            </div>
            <div className='bg-muted p-3 rounded-md text-sm'>
              <div className='grid grid-cols-2 gap-2'>
                <div>
                  <p className='text-muted-foreground'>ID:</p>
                  <p className='font-mono text-xs'>{game.id.substring(0, 12)}...</p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Số lượt cược:</p>
                  <p>{betStats.total_bets || 0}</p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Bắt đầu:</p>
                  <p>{formatDate(game.start_time)}</p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Kết thúc:</p>
                  <p>{formatDate(game.end_time)}</p>
                </div>
              </div>
            </div>
          </div>
          <FormField
            control={form.control}
            name='result'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kết quả</FormLabel>
                <FormControl>
                  <Input placeholder='Nhập kết quả' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='notes'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ghi chú</FormLabel>
                <FormControl>
                  <Input placeholder='Ghi chú (tùy chọn)' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800'>
            <div className='flex items-center'>
              <AlertCircle className='h-4 w-4 mr-2' />
              <p className='font-medium'>Lưu ý quan trọng</p>
            </div>
            <p className='mt-1 text-xs'>
              Sau khi nhập kết quả, hệ thống sẽ tự động xác định người thắng cuộc và phân phối tiền thưởng. Hành động
              này không thể hoàn tác.
            </p>
          </div>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={onClose}>
              Hủy
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                  Đang xử lý...
                </>
              ) : (
                'Xác nhận kết quả'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
