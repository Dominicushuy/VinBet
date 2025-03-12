import React from 'react'
import { format } from 'date-fns'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { RefreshCw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Schema để cập nhật trạng thái game round
const updateGameRoundSchema = z.object({
  status: z.enum(['scheduled', 'active', 'completed', 'cancelled']),
  result: z.string().optional()
})

export function UpdateGameDialog({ open, onClose, onSubmit, isLoading, game }) {
  const form = useForm({
    resolver: zodResolver(updateGameRoundSchema),
    defaultValues: {
      status: game?.status || 'scheduled',
      result: game?.result || ''
    }
  })

  // Khi game thay đổi, cập nhật form values
  React.useEffect(() => {
    if (game) {
      form.reset({
        status: game.status,
        result: game.result || ''
      })
    }
  }, [game, form])

  const handleSubmit = data => {
    onSubmit(data)
  }

  // Format date
  const formatDate = date => {
    return format(new Date(date), 'HH:mm, dd/MM/yyyy')
  }

  if (!game) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cập nhật lượt chơi</DialogTitle>
          <DialogDescription>Cập nhật trạng thái và kết quả của lượt chơi</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
            <div>
              <p className='text-sm font-medium mb-1'>ID:</p>
              <p className='text-sm font-mono'>{game.id}</p>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <p className='text-sm font-medium mb-1'>Bắt đầu:</p>
                <p className='text-sm'>{formatDate(game.start_time)}</p>
              </div>
              <div>
                <p className='text-sm font-medium mb-1'>Kết thúc:</p>
                <p className='text-sm'>{formatDate(game.end_time)}</p>
              </div>
            </div>

            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Chọn trạng thái' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='scheduled'>Sắp diễn ra</SelectItem>
                      <SelectItem value='active'>Đang diễn ra</SelectItem>
                      <SelectItem value='completed'>Đã kết thúc</SelectItem>
                      <SelectItem value='cancelled'>Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('status') === 'completed' && (
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
            )}

            <DialogFooter>
              <Button type='button' variant='outline' onClick={onClose}>
                Hủy
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? (
                  <>
                    <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                    Đang cập nhật...
                  </>
                ) : (
                  'Cập nhật'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
