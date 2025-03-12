'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RefreshCw } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect } from 'react'

const updateGameStatusSchema = z.object({
  status: z.enum(['scheduled', 'active', 'completed', 'cancelled'])
})

export function UpdateGameDialog({ open, onClose, onSubmit, isLoading, game }) {
  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(updateGameStatusSchema),
    defaultValues: {
      status: game?.status || 'scheduled'
    }
  })

  // Khi game thay đổi hoặc dialog mở ra, có thể reset form nếu cần
  useEffect(() => {
    if (game) reset({ status: game.status })
  }, [game, reset])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái lượt chơi</DialogTitle>
          <DialogDescription>Thay đổi trạng thái của lượt chơi này</DialogDescription>
        </DialogHeader>
        <Form control={control}>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
