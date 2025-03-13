// src/app/(main)/referrals/page.jsx
import { ReferralCodeCard } from '@/components/referrals/ReferralCodeCard'
import { ReferralShareLinks } from '@/components/referrals/ReferralShareLinks'
import { ReferralStatistics } from '@/components/referrals/ReferralStatistics'
import { ReferralsList } from '@/components/referrals/ReferralsList'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { getSupabaseServer } from '@/lib/supabase/server'
import { Separator } from '@/components/ui/separator'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = {
  title: 'Giới thiệu bạn bè - VinBet',
  description: 'Giới thiệu bạn bè sử dụng VinBet và cả hai cùng nhận thưởng'
}

// async function getInitialData() {
//   try {
//     const supabase = getSupabaseServer()

//     // Không cần chạy api từ server, do dữ liệu sẽ được tải bởi client components
//     return {
//       stats: null,
//       referralCode: null
//     }
//   } catch (error) {
//     console.error('Error fetching initial referral data:', error)
//     return {
//       stats: null,
//       referralCode: null
//     }
//   }
// }

export default async function ReferralsPage() {
  // const initialData = await getInitialData()

  return (
    <div className='container pb-12'>
      <div className='py-6'>
        <h1 className='text-3xl font-bold mb-2'>Giới thiệu bạn bè</h1>
        <p className='text-muted-foreground'>Giới thiệu bạn bè sử dụng VinBet và cả hai cùng nhận thưởng</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
        {/* Phần mã giới thiệu */}
        <Suspense fallback={<Skeleton className='h-40' />}>
          <ReferralCodeCard />
        </Suspense>

        {/* Phần chia sẻ */}
        <Suspense fallback={<Skeleton className='h-40' />}>
          <ReferralShareLinks />
        </Suspense>
      </div>

      {/* Thống kê */}
      <div className='mb-6'>
        <Suspense fallback={<Skeleton className='h-64' />}>
          <ReferralStatistics />
        </Suspense>
      </div>

      {/* Cách hoạt động */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>Cách thức hoạt động</CardTitle>
          <CardDescription>Quy trình giới thiệu và nhận thưởng</CardDescription>
        </CardHeader>
        <CardContent className='pb-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='border rounded-lg p-4 text-center'>
              <div className='w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-xl font-bold text-primary'>1</span>
              </div>
              <h3 className='font-medium mb-2'>Chia sẻ mã giới thiệu</h3>
              <p className='text-sm text-muted-foreground'>Chia sẻ mã hoặc link giới thiệu với bạn bè</p>
            </div>

            <div className='border rounded-lg p-4 text-center'>
              <div className='w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-xl font-bold text-primary'>2</span>
              </div>
              <h3 className='font-medium mb-2'>Bạn bè đăng ký</h3>
              <p className='text-sm text-muted-foreground'>Bạn bè đăng ký và nạp tiền vào tài khoản</p>
            </div>

            <div className='border rounded-lg p-4 text-center'>
              <div className='w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-xl font-bold text-primary'>3</span>
              </div>
              <h3 className='font-medium mb-2'>Nhận thưởng</h3>
              <p className='text-sm text-muted-foreground'>Cả hai cùng nhận thưởng vào tài khoản</p>
            </div>
          </div>

          <Separator className='my-6' />

          <div className='space-y-2'>
            <h3 className='font-medium'>Điều khoản & điều kiện:</h3>
            <ul className='list-disc list-inside space-y-1 text-sm text-muted-foreground'>
              <li>Mỗi người bạn giới thiệu nạp tiền lần đầu, bạn sẽ nhận được 10.000₫</li>
              <li>Người được giới thiệu phải đăng ký thành công và nạp tối thiểu 50.000₫</li>
              <li>Phần thưởng sẽ được cộng trực tiếp vào tài khoản sau khi xác minh</li>
              <li>Không giới hạn số lượng người giới thiệu</li>
              <li>VinBet có quyền thay đổi chương trình mà không cần báo trước</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Danh sách người đã giới thiệu */}
      <Suspense fallback={<Skeleton className='h-64' />}>
        <ReferralsList />
      </Suspense>
    </div>
  )
}
