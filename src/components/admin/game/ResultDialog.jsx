import { format } from 'date-fns'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, RefreshCw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const gameResultSchema = z.object({
  result: z.string().min(1, 'Kết quả là bắt buộc'),
  notes: z.string().optional()
})

export function ResultDialog({ open, onClose, onSubmit, isLoading, game }) {
  const form = useForm({
    resolver: zodResolver(gameResultSchema),
    defaultValues: {
      result: '',
      notes: ''
    }
  })

  const handleSubmit = data => {
    onSubmit(data)
  }

  if (!game) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nhập kết quả lượt chơi</DialogTitle>
          <DialogDescription>Nhập kết quả trò chơi để xác định người thắng cuộc</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
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
                    <p>{game.bets_count || 0}</p>
                  </div>
                  <div>
                    <p className='text-muted-foreground'>Bắt đầu:</p>
                    <p>{format(new Date(game.start_time), 'HH:mm - dd/MM/yyyy')}</p>
                  </div>
                  <div>
                    <p className='text-muted-foreground'>Kết thúc:</p>
                    <p>{format(new Date(game.end_time), 'HH:mm - dd/MM/yyyy')}</p>
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
                  <FormDescription>
                    Kết quả sẽ được dùng để xác định người thắng cuộc và phân phối tiền thưởng
                  </FormDescription>
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
                  <FormDescription>Ghi chú nội bộ, chỉ admin có thể xem</FormDescription>
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
        </Form>
      </DialogContent>
    </Dialog>
  )
}
