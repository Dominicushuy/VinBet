'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NotificationForm } from '@/components/admin/telegram/NotificationForm'
import { NotificationHistory } from '@/components/admin/telegram/NotificationHistory'
import { Bell } from 'lucide-react'

export default function TelegramNotificationsPage() {
  const [activeTab, setActiveTab] = useState('send')

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-2'>
        <Bell className='h-5 w-5 text-primary' />
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Thông báo Telegram</h1>
          <p className='text-muted-foreground'>Tạo và quản lý thông báo gửi đến người dùng qua Telegram</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='w-full sm:w-auto'>
          <TabsTrigger value='send'>Gửi thông báo</TabsTrigger>
          <TabsTrigger value='history'>Lịch sử thông báo</TabsTrigger>
        </TabsList>

        <TabsContent value='send' className='pt-4'>
          <NotificationForm />
        </TabsContent>

        <TabsContent value='history' className='pt-4'>
          <NotificationHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}
