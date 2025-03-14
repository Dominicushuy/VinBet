// src/app/(admin)/admin/telegram/notifications/page.jsx
'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NotificationForm } from '@/components/admin/telegram/NotificationForm'
import { NotificationHistory } from '@/components/admin/telegram/NotificationHistory'

export default function TelegramNotificationsPage() {
  const [activeTab, setActiveTab] = useState('send')

  return (
    <div className='space-y-6'>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value='send'>Gửi thông báo</TabsTrigger>
          <TabsTrigger value='history'>Lịch sử</TabsTrigger>
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
