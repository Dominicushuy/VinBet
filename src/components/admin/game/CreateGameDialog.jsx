import { format, addHours } from 'date-fns'
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Improved validation schema
const createGameRoundSchema = z
  .object({
    startTime: z
      .string()
      .min(1, 'Thời gian bắt đầu là bắt buộc')
      .refine(val => new Date(val) >= new Date(), {
        message: 'Thời gian bắt đầu phải từ hiện tại trở đi'
      }),
    endTime: z.string().min(1, 'Thời gian kết thúc là bắt buộc')
  })
  .refine(data => new Date(data.endTime) > new Date(data.startTime), {
    message: 'Thời gian kết thúc phải sau thời gian bắt đầu',
    path: ['endTime']
  })
  .refine(
    data => {
      const startTime = new Date(data.startTime)
      const endTime = new Date(data.endTime)
      const diffMs = endTime - startTime
      const diffMinutes = diffMs / (1000 * 60)
      return diffMinutes >= 10 // Tối thiểu 10 phút
    },
    {
      message: 'Thời gian giữa bắt đầu và kết thúc phải ít nhất 10 phút',
      path: ['endTime']
    }
  )

export function CreateGameDialog({ open, onClose, onSubmit, isLoading }) {
  const form = useForm({
    resolver: zodResolver(createGameRoundSchema),
    defaultValues: {
      startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      endTime: format(addHours(new Date(), 1), "yyyy-MM-dd'T'HH:mm")
    }
  })

  const handleSubmit = data => {
    onSubmit(data)
  }

  const handleClose = () => {
    if (!isLoading) {
      form.reset()
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Tạo lượt chơi mới</DialogTitle>
          <DialogDescription>Thiết lập thông tin cho lượt chơi mới</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='startTime'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thời gian bắt đầu</FormLabel>
                  <FormControl>
                    <Input type='datetime-local' {...field} />
                  </FormControl>
                  <FormDescription>Thời điểm lượt chơi bắt đầu và người dùng có thể đặt cược</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='endTime'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thời gian kết thúc</FormLabel>
                  <FormControl>
                    <Input type='datetime-local' {...field} />
                  </FormControl>
                  <FormDescription>Thời điểm lượt chơi kết thúc và không thể đặt cược</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type='button' variant='outline' onClick={handleClose} disabled={isLoading}>
                Hủy
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? (
                  <>
                    <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                    Đang tạo...
                  </>
                ) : (
                  'Tạo lượt chơi'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
