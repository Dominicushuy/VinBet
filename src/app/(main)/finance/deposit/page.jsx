// src/app/(main)/finance/deposit/page.jsx

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DepositFlowSteps } from '@/components/finance/DepositFlowSteps'
import { PaymentRequestList } from '@/components/finance/PaymentRequestList'
import { getSupabaseServer } from '@/lib/supabase/server'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { InfoIcon } from 'lucide-react'

export const metadata = {
  title: 'Nạp tiền - VinBet',
  description: 'Nạp tiền vào tài khoản VinBet của bạn',
}

export default async function DepositPage() {
  const supabase = getSupabaseServer()

  // Lấy danh sách 5 yêu cầu nạp tiền gần nhất để SSR
  const { data: paymentRequests, count } = await supabase
    .from('payment_requests')
    .select(
      '*, approved_by:profiles!payment_requests_approved_by_fkey(username, display_name)',
      {
        count: 'exact',
      }
    )
    .eq('type', 'deposit')
    .order('created_at', { ascending: false })
    .range(0, 4)

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Nạp tiền</h2>
        <p className='text-muted-foreground'>
          Nạp tiền vào tài khoản để tham gia các lượt chơi
        </p>
      </div>

      <Alert
        variant='default'
        className='bg-blue-50 text-blue-800 border-blue-200'>
        <InfoIcon className='h-4 w-4' />
        <AlertTitle>Lưu ý khi nạp tiền</AlertTitle>
        <AlertDescription>
          Để đảm bảo giao dịch được xử lý nhanh chóng, vui lòng ghi đúng nội
          dung chuyển khoản và tải lên bằng chứng thanh toán.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue='deposit' className='w-full'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='deposit'>Nạp tiền</TabsTrigger>
          <TabsTrigger value='history'>Lịch sử nạp tiền</TabsTrigger>
        </TabsList>
        <TabsContent value='deposit' className='mt-6'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
            <div className='col-span-1 md:col-span-2'>
              <DepositFlowSteps />
            </div>
            <div className='col-span-1'>
              <Card>
                <CardHeader>
                  <CardTitle>Hướng dẫn nạp tiền</CardTitle>
                  <CardDescription>Các bước thực hiện nạp tiền</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2'>
                      <div className='flex-shrink-0 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-sm'>
                        1
                      </div>
                      <p className='text-sm'>
                        Chọn phương thức thanh toán và nhập số tiền muốn nạp
                      </p>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div className='flex-shrink-0 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-sm'>
                        2
                      </div>
                      <p className='text-sm'>
                        Thực hiện thanh toán theo thông tin được cung cấp
                      </p>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div className='flex-shrink-0 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-sm'>
                        3
                      </div>
                      <p className='text-sm'>
                        Tải lên ảnh chụp màn hình giao dịch hoặc biên lai chuyển
                        khoản
                      </p>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div className='flex-shrink-0 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-sm'>
                        4
                      </div>
                      <p className='text-sm'>
                        Chờ hệ thống xác nhận và cộng tiền vào tài khoản (thường
                        trong vòng 5-15 phút)
                      </p>
                    </div>
                  </div>

                  <div className='pt-4 border-t'>
                    <p className='font-medium text-sm mb-2'>Lưu ý:</p>
                    <ul className='text-xs text-muted-foreground space-y-1'>
                      <li>
                        • Nội dung chuyển khoản phải ghi chính xác theo hướng
                        dẫn
                      </li>
                      <li>
                        • Hệ thống chỉ ghi nhận giao dịch khi bạn tải lên bằng
                        chứng thanh toán
                      </li>
                      <li>
                        • Tiền sẽ được cộng vào tài khoản sau khi admin xác nhận
                        giao dịch
                      </li>
                      <li>
                        • Thời gian xử lý có thể kéo dài hơn vào cuối tuần hoặc
                        ngày lễ
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        <TabsContent value='history' className='mt-6'>
          <PaymentRequestList
            type='deposit'
            initialData={{
              paymentRequests: paymentRequests || [],
              pagination: {
                total: count || 0,
                page: 1,
                pageSize: 5,
                totalPages: Math.ceil((count || 0) / 5),
              },
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
