// src/components/profile/ProfileDashboard.jsx
'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileHeader } from './ProfileHeader'
import { ProfileStats } from './ProfileStats'
import { AccountStatus } from './AccountStatus'
import { ProfileForm } from './ProfileForm'
import { PasswordChangeForm } from './PasswordChangeForm'
import { LoginHistory } from './LoginHistory'
import { NotificationSettings } from '../notifications/NotificationSettings'
import { Card } from '@/components/ui/card'
import { useRouter, useSearchParams } from 'next/navigation'
import { User, Bell, Key, History, Mail } from 'lucide-react'

export function ProfileDashboard({ initialProfile, initialStats }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'

  const handleTabChange = value => {
    router.push(`/profile?tab=${value}`, { scroll: false })
  }

  return (
    <div className='space-y-8'>
      <ProfileHeader profile={initialProfile} />

      <div className='grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6'>
        {/* Left sidebar */}
        <div className='space-y-6'>
          <AccountStatus profile={initialProfile} />
          <ProfileStats stats={initialStats} />
        </div>

        {/* Main content */}
        <div className='space-y-6'>
          <Tabs value={activeTab} onValueChange={handleTabChange} className='w-full'>
            <TabsList className='grid grid-cols-3 lg:grid-cols-5 w-full'>
              <TabsTrigger value='overview' className='flex items-center gap-2'>
                <User className='h-4 w-4' />
                <span className='hidden sm:inline'>Tổng quan</span>
              </TabsTrigger>
              <TabsTrigger value='edit' className='flex items-center gap-2'>
                <Mail className='h-4 w-4' />
                <span className='hidden sm:inline'>Chỉnh sửa</span>
              </TabsTrigger>
              {/* <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Bảo mật</span>
              </TabsTrigger> */}
              <TabsTrigger value='passwords' className='flex items-center gap-2'>
                <Key className='h-4 w-4' />
                <span className='hidden sm:inline'>Mật khẩu</span>
              </TabsTrigger>
              <TabsTrigger value='notifications' className='flex items-center gap-2'>
                <Bell className='h-4 w-4' />
                <span className='hidden sm:inline'>Thông báo</span>
              </TabsTrigger>
              <TabsTrigger value='activity' className='flex items-center gap-2'>
                <History className='h-4 w-4' />
                <span className='hidden sm:inline'>Hoạt động</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value='overview' className='mt-6'>
              <Card className='p-6'>
                <h3 className='text-lg font-medium mb-4'>Thông tin tài khoản</h3>
                <div className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <p className='text-sm text-muted-foreground'>Username</p>
                      <p className='font-medium'>{initialProfile?.username}</p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>Email</p>
                      <p className='font-medium'>{initialProfile?.email}</p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>Tên hiển thị</p>
                      <p className='font-medium'>{initialProfile?.display_name || '-'}</p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>Số điện thoại</p>
                      <p className='font-medium'>{initialProfile?.phone_number || '-'}</p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>Ngày tham gia</p>
                      <p className='font-medium'>{new Date(initialProfile?.created_at).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>Mã giới thiệu</p>
                      <p className='font-medium'>{initialProfile?.referral_code}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value='edit' className='mt-6'>
              <ProfileForm initialProfile={initialProfile} />
            </TabsContent>

            <TabsContent value='passwords' className='mt-6'>
              <PasswordChangeForm />
            </TabsContent>

            <TabsContent value='notifications' className='mt-6'>
              <NotificationSettings />
            </TabsContent>

            <TabsContent value='activity' className='mt-6'>
              <LoginHistory />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
