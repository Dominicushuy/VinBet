// src/app/(admin)/admin/profile/page.jsx
'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdminProfileInfo } from '@/components/admin/profile/AdminProfileInfo'
import { AdminSecuritySettings } from '@/components/admin/profile/AdminSecuritySettings'
import { AdminPreferences } from '@/components/admin/profile/AdminPreferences'
import { AdminPageHeader } from '@/components/admin/layout/AdminPageHeader'

export default function AdminProfilePage() {
  return (
    <>
      <AdminPageHeader title='Thông tin tài khoản Admin' description='Xem và quản lý thông tin cá nhân và bảo mật' />

      <Tabs defaultValue='info' className='space-y-6'>
        <TabsList className='grid w-full md:w-auto grid-cols-3'>
          <TabsTrigger value='info'>Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value='security'>Bảo mật</TabsTrigger>
          <TabsTrigger value='preferences'>Tùy chỉnh</TabsTrigger>
        </TabsList>

        <TabsContent value='info'>
          <AdminProfileInfo />
        </TabsContent>

        <TabsContent value='security'>
          <AdminSecuritySettings />
        </TabsContent>

        <TabsContent value='preferences'>
          <AdminPreferences />
        </TabsContent>
      </Tabs>
    </>
  )
}
