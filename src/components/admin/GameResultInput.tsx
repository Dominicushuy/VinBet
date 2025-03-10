'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Loader2, Trophy } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useSetGameResultMutation } from '@/hooks/queries/useAdminQueries'

const gameResultSchema = z.object({
  result: z.string().min(1, 'Kết quả không được để trống'),
  notes: z.string().optional(),
})

type GameResultSchema = z.infer<typeof gameResultSchema>

interface GameResultInputProps {
  gameId: string
  disabled?: boolean
  onSuccess?: () => void
}

export function GameResultInput({
  gameId,
  disabled = false,
  onSuccess,
}: GameResultInputProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)

  const form = useForm<GameResultSchema>({
    resolver: zodResolver(gameResultSchema),
    defaultValues: {
      result: '',
      notes: '',
    },
  })

  const setGameResultMutation = useSetGameResultMutation()

  const onSubmit = (data: GameResultSchema) => {
    setConfirmDialogOpen(true)
  }

  const confirmSetResult = () => {
    const data = form.getValues()
    setGameResultMutation.mutate(
      {
        gameId,
        data,
      },
      {
        onSuccess: () => {
          setDialogOpen(false)
          setConfirmDialogOpen(false)
          form.reset()
          if (onSuccess) onSuccess()
        },
      }
    )
  }

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button disabled={disabled} variant='outline'>
            <Trophy className='mr-2 h-4 w-4' />
            Nhập kết quả
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nhập kết quả lượt chơi</DialogTitle>
            <DialogDescription>
              Kết quả sau khi nhập sẽ được công bố và xác định người thắng cuộc.
              Thao tác này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='result'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kết quả</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Nhập kết quả (ví dụ: 27)'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Kết quả sẽ được so sánh với các lượt đặt cược để xác định
                      người thắng.
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
                    <FormLabel>Ghi chú (không bắt buộc)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Ghi chú thêm về kết quả này'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type='submit'>Tiếp tục</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận kết quả</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn xác nhận kết quả của lượt chơi này là:{' '}
              <span className='font-bold'>{form.getValues().result}</span>
              <br />
              Thao tác này sẽ:
              <ul className='list-disc ml-5 mt-2'>
                <li>{`Chuyển trạng thái lượt chơi sang "đã kết thúc"`}</li>
                <li>Tự động xác định và thanh toán cho người thắng</li>
                <li>Không thể hoàn tác sau khi xác nhận</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSetResult}
              disabled={setGameResultMutation.isLoading}>
              {setGameResultMutation.isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Đang xử lý...
                </>
              ) : (
                'Xác nhận'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
