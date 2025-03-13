// src/components/admin/profile/AdminProfileInfo.jsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AvatarUploader } from '@/components/profile/AvatarUploader'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { useAdminProfileQuery, useUpdateAdminProfileMutation } from '@/hooks/queries/useAdminProfileQueries'
import { Loader2 } from 'lucide-react'

const profileFormSchema = z.object({
  display_name: z.string().min(3, 'Tên hiển thị phải có ít nhất 3 ký tự'),
  phone_number: z.string().optional().nullable(),
  bio: z.string().max(500, 'Giới thiệu không được vượt quá 500 ký tự').optional().nullable(),
  telegram_id: z.string().optional().nullable()
})

export function AdminProfileInfo() {
  const { data: profile, isLoading } = useAdminProfileQuery()
  const updateMutation = useUpdateAdminProfileMutation()
  const [avatarUrl, setAvatarUrl] = useState('')

  const form = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      display_name: '',
      phone_number: '',
      bio: '',
      telegram_id: ''
    }
  })

  // Cập nhật form khi data load xong
  useEffect(() => {
    if (profile) {
      form.reset({
        display_name: profile.display_name || '',
        phone_number: profile.phone_number || '',
        bio: profile.bio || '',
        telegram_id: profile.telegram_id || ''
      })
      setAvatarUrl(profile.avatar_url || '')
    }
  }, [profile, form])

  const onSubmit = async data => {
    try {
      await updateMutation.mutateAsync({
        ...data,
        avatar_url: avatarUrl
      })
      toast.success('Thông tin cá nhân đã được cập nhật')
    } catch (error) {
      toast.error('Không thể cập nhật thông tin')
      console.error(error)
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-12'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin cá nhân</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <div className='flex flex-col items-center md:flex-row md:items-start gap-6'>
            <AvatarUploader currentAvatar={avatarUrl} onAvatarChange={setAvatarUrl} size='lg' />

            <div className='space-y-4 w-full'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='username'>Tài khoản</Label>
                  <Input id='username' value={profile?.username || ''} disabled className='opacity-60' />
                </div>
                <div>
                  <Label htmlFor='email'>Email</Label>
                  <Input id='email' value={profile?.email || ''} disabled className='opacity-60' />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='display_name'>Tên hiển thị</Label>
                  <Input
                    id='display_name'
                    {...form.register('display_name')}
                    error={form.formState.errors.display_name?.message}
                  />
                  {form.formState.errors.display_name && (
                    <p className='text-sm text-destructive mt-1'>{form.formState.errors.display_name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor='phone_number'>Số điện thoại</Label>
                  <Input id='phone_number' {...form.register('phone_number')} />
                </div>
              </div>

              <div>
                <Label htmlFor='telegram_id'>Telegram ID</Label>
                <Input id='telegram_id' {...form.register('telegram_id')} placeholder='@yourusername' />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor='bio'>Giới thiệu bản thân</Label>
            <Textarea id='bio' {...form.register('bio')} placeholder='Thông tin về bạn...' className='h-32' />
            {form.formState.errors.bio && (
              <p className='text-sm text-destructive mt-1'>{form.formState.errors.bio.message}</p>
            )}
          </div>

          <div className='flex justify-end'>
            <Button type='submit' disabled={updateMutation.isPending || !form.formState.isDirty}>
              {updateMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Lưu thông tin
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
