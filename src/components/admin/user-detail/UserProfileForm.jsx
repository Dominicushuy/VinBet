// src/components/admin/user-detail/UserProfileForm.jsx
import React from 'react'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { RefreshCw } from 'lucide-react'

const UserProfileForm = React.memo(function UserProfileForm({ form, onSubmit, setEditMode, updateUserMutation }) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='display_name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên hiển thị</FormLabel>
              <FormControl>
                <Input placeholder='Tên hiển thị' {...field} />
              </FormControl>
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
                <Input placeholder='Username' {...field} />
              </FormControl>
              <FormDescription>Chỉ sử dụng chữ cái, số và dấu gạch dưới.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='Email' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='phone_number'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số điện thoại</FormLabel>
              <FormControl>
                <Input placeholder='Số điện thoại' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='is_admin'
          render={({ field }) => (
            <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className='space-y-1 leading-none'>
                <FormLabel>Quyền admin</FormLabel>
                <FormDescription>Cấp quyền quản trị hệ thống cho người dùng này</FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='is_blocked'
          render={({ field }) => (
            <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className='space-y-1 leading-none'>
                <FormLabel>Khóa tài khoản</FormLabel>
                <FormDescription>Khóa tài khoản này và ngăn người dùng đăng nhập</FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className='flex justify-end space-x-2'>
          <Button type='button' variant='outline' onClick={() => setEditMode(false)}>
            Hủy
          </Button>
          <Button type='submit' disabled={updateUserMutation.isLoading || !form.formState.isDirty}>
            {updateUserMutation.isLoading ? (
              <>
                <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                Đang lưu...
              </>
            ) : (
              'Lưu thay đổi'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
})

export { UserProfileForm }
