// src/components/profile/ProfileDashboard.jsx
'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileHeader } from './ProfileHeader'
import { ProfileStats } from './ProfileStats'
import { AccountStatus } from './AccountStatus'
import { ProfileForm } from './ProfileForm'
import { PasswordChangeForm } from './PasswordChangeForm'
import { LoginHistory } from './LoginHistory'
import { Card } from '@/components/ui/card'
import { useRouter, useSearchParams } from 'next/navigation'
import { User, Bell, Key, History, Mail } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'

// Lazy load heavy components
const DynamicNotificationSettings = dynamic(
  () => import('../notifications/NotificationSettings').then(mod => mod.NotificationSettings),
  { ssr: true, loading: () => <SettingsSkeleton /> }
)

function SettingsSkeleton() {
  return <Card className='w-full h-[600px] flex items-center justify-center'>Loading settings...</Card>
}

// ProfileInfoItem component for DRY principle
const ProfileInfoItem = ({ label, value }) => (
  <div>
    <p className='text-sm text-muted-foreground'>{label}</p>
    <p className='font-medium'>{value || '-'}</p>
  </div>
)

export function ProfileDashboard({ initialProfile, initialStats }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'

  // Memoize handler to prevent unnecessary re-renders
  const handleTabChange = useCallback(
    value => {
      router.push(`/profile?tab=${value}`, { scroll: false })
    },
    [router]
  )

  // Memoize formatted date to avoid recalculation
  const joinDate = useMemo(() => {
    if (!initialProfile?.created_at) return '-'
    return new Date(initialProfile.created_at).toLocaleDateString('vi-VN')
  }, [initialProfile?.created_at])

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
                    <ProfileInfoItem label='Username' value={initialProfile?.username} />
                    <ProfileInfoItem label='Email' value={initialProfile?.email} />
                    <ProfileInfoItem label='Tên hiển thị' value={initialProfile?.display_name} />
                    <ProfileInfoItem label='Số điện thoại' value={initialProfile?.phone_number} />
                    <ProfileInfoItem label='Ngày tham gia' value={joinDate} />
                    <ProfileInfoItem label='Mã giới thiệu' value={initialProfile?.referral_code} />

                    {initialProfile?.bio && (
                      <div className='md:col-span-2'>
                        <p className='text-sm text-muted-foreground'>Giới thiệu</p>
                        <p className='font-medium whitespace-pre-line'>{initialProfile.bio}</p>
                      </div>
                    )}
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
              <DynamicNotificationSettings />
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
