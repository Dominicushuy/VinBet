// src/components/profile/ProfileForm.jsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { toast } from 'react-hot-toast'
import { Loader, Save } from 'lucide-react'
import { useUpdateProfileMutation } from '@/hooks/queries/useProfileQueries'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Define validation schema
const profileSchema = z.object({
  display_name: z
    .string()
    .min(2, 'Tên hiển thị phải có ít nhất 2 ký tự')
    .max(50, 'Tên hiển thị không được vượt quá 50 ký tự'),
  username: z
    .string()
    .min(3, 'Username phải có ít nhất 3 ký tự')
    .max(20, 'Username không được vượt quá 20 ký tự')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username chỉ chứa chữ cái, số và dấu gạch dưới'),
  phone_number: z
    .string()
    .regex(/^[0-9+]+$/, 'Số điện thoại chỉ chứa số và dấu +')
    .optional()
    .or(z.literal('')),
  bio: z.string().max(200, 'Giới thiệu không được vượt quá 200 ký tự').optional().or(z.literal(''))
})

export function ProfileForm({ initialProfile }) {
  const updateProfileMutation = useUpdateProfileMutation()

  // Initialize form with validation schema and default values
  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: initialProfile?.display_name || '',
      username: initialProfile?.username || '',
      phone_number: initialProfile?.phone_number || '',
      bio: initialProfile?.bio || ''
    }
  })

  // Handle form submission
  async function onSubmit(data) {
    try {
      await updateProfileMutation.mutateAsync(data)
      toast.success('Cập nhật thông tin thành công')
    } catch (error) {
      toast.error(error.message || 'Cập nhật thông tin thất bại')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chỉnh sửa hồ sơ</CardTitle>
        <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='space-y-6'>
            <div className='space-y-4'>
              <h3 className='text-sm font-medium'>Thông tin cơ bản</h3>

              <FormField
                control={form.control}
                name='display_name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên hiển thị</FormLabel>
                    <FormControl>
                      <Input placeholder='Nhập tên hiển thị' {...field} />
                    </FormControl>
                    <FormDescription>Tên này sẽ hiển thị cho người dùng khác</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='username'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='username'
                        {...field}
                        className='text-muted-foreground'
                        disabled={!!initialProfile?.username} // Username can only be set once
                      />
                    </FormControl>
                    {initialProfile?.username && (
                      <FormDescription>Username không thể thay đổi sau khi đã đặt</FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='bio'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giới thiệu</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Hãy giới thiệu một chút về bản thân bạn...'
                        className='resize-none'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Tối đa 200 ký tự</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className='space-y-4'>
              <h3 className='text-sm font-medium'>Thông tin liên hệ</h3>

              <Alert variant='outline' className='bg-muted/50'>
                <AlertDescription className='text-xs'>
                  Email và số điện thoại được dùng để khôi phục tài khoản khi cần thiết. Chúng tôi sẽ không chia sẻ
                  thông tin này với bên thứ ba.
                </AlertDescription>
              </Alert>

              <FormField
                control={form.control}
                name='phone_number'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input placeholder='+84 xxx xxx xxx' {...field} />
                    </FormControl>
                    <FormDescription>Số điện thoại dùng để xác thực và nhận thông báo</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Email</FormLabel>
                <Input value={initialProfile?.email || ''} disabled className='text-muted-foreground' />
                <p className='text-xs text-muted-foreground mt-1'>
                  Email không thể thay đổi trực tiếp.
                  <a href='/profile/email-change' className='text-primary hover:underline ml-1'>
                    Yêu cầu thay đổi email
                  </a>
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter className='flex justify-between'>
            <Button type='button' variant='ghost' onClick={() => form.reset()}>
              Hủy thay đổi
            </Button>
            <Button type='submit' disabled={updateProfileMutation.isLoading || !form.formState.isDirty}>
              {updateProfileMutation.isLoading ? (
                <>
                  <Loader className='mr-2 h-4 w-4 animate-spin' />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className='mr-2 h-4 w-4' />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
