// src/components/finance/FinancialOverviewTabs.jsx
'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FinancialOverviewChart } from '@/components/finance/FinancialOverviewChart'

export function FinancialOverviewTabs({ userId }) {
  return (
    <Tabs defaultValue='all'>
      <TabsList className='mb-4 overflow-x-auto flex sm:grid sm:grid-cols-5 w-full'>
        <TabsTrigger value='all'>Tất cả</TabsTrigger>
        <TabsTrigger value='deposits'>Nạp tiền</TabsTrigger>
        <TabsTrigger value='withdrawals'>Rút tiền</TabsTrigger>
        <TabsTrigger value='bets'>Đặt cược</TabsTrigger>
        <TabsTrigger value='wins'>Thắng cược</TabsTrigger>
      </TabsList>
      <TabsContent value='all'>
        <FinancialOverviewChart userId={userId} period='month' filter='all' />
      </TabsContent>
      <TabsContent value='deposits'>
        <FinancialOverviewChart userId={userId} period='month' filter='deposit' />
      </TabsContent>
      <TabsContent value='withdrawals'>
        <FinancialOverviewChart userId={userId} period='month' filter='withdrawal' />
      </TabsContent>
      <TabsContent value='bets'>
        <FinancialOverviewChart userId={userId} period='month' filter='bet' />
      </TabsContent>
      <TabsContent value='wins'>
        <FinancialOverviewChart userId={userId} period='month' filter='win' />
      </TabsContent>
    </Tabs>
  )
}
