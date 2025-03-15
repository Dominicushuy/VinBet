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
import { Input } from '@/components/ui/input'
import { RefreshCw } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect, useState } from 'react'

// Cập nhật schema với trường result có điều kiện
const updateGameStatusSchema = z
  .object({
    status: z.enum(['scheduled', 'active', 'completed', 'cancelled']),
    // Thêm trường result chỉ bắt buộc khi status là 'completed'
    result: z.string().optional()
  })
  .refine(
    data => {
      // Nếu status là completed thì result phải có giá trị
      if (data.status === 'completed') {
        return !!data.result && data.result.trim() !== ''
      }
      return true
    },
    {
      message: "Số kết quả là bắt buộc khi trạng thái là 'Đã kết thúc'",
      path: ['result']
    }
  )

export function UpdateGameDialog({ open, onClose, onSubmit, isLoading, game }) {
  // State để theo dõi trạng thái đã chọn
  const [selectedStatus, setSelectedStatus] = useState(game?.status || 'scheduled')

  const form = useForm({
    resolver: zodResolver(updateGameStatusSchema),
    defaultValues: {
      status: game?.status || 'scheduled',
      result: game?.result || ''
    }
  })

  // Khi game thay đổi hoặc dialog mở ra, reset form
  useEffect(() => {
    if (game) {
      form.reset({
        status: game.status,
        result: game.result || ''
      })
      setSelectedStatus(game.status)
    }
  }, [game, form.reset, open])

  // Theo dõi khi status thay đổi để cập nhật state
  const watchStatus = form.watch('status')
  useEffect(() => {
    setSelectedStatus(watchStatus)
  }, [watchStatus])

  const handleFormSubmit = data => {
    // Nếu status không phải là completed, không gửi trường result
    if (data.status !== 'completed') {
      const { result, ...restData } = data
      onSubmit(restData)
    } else {
      onSubmit(data)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái lượt chơi</DialogTitle>
          <DialogDescription>Thay đổi trạng thái của lượt chơi này</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái</FormLabel>
                  <Select
                    onValueChange={value => {
                      field.onChange(value)
                      setSelectedStatus(value)
                    }}
                    value={field.value}
                  >
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

            {/* Hiển thị trường nhập kết quả chỉ khi status là completed */}
            {selectedStatus === 'completed' && (
              <FormField
                control={form.control}
                name='result'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số kết quả</FormLabel>
                    <FormControl>
                      <Input placeholder='Nhập số kết quả' {...field} />
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
