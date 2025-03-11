// src/app/(main)/referrals/page.jsx

import { ReferralCodeCard } from '@/components/referrals/ReferralCodeCard'
import { ReferralShareLinks } from '@/components/referrals/ReferralShareLinks'
import { ReferralStatistics } from '@/components/referrals/ReferralStatistics'
import { ReferralsList } from '@/components/referrals/ReferralsList'

export const metadata = {
  title: 'Giới thiệu bạn bè - VinBet',
  description: 'Giới thiệu bạn bè tham gia VinBet để nhận thưởng'
}

export default function ReferralsPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>Giới thiệu bạn bè</h2>
        <p className='text-muted-foreground'>Giới thiệu bạn bè tham gia VinBet để nhận thưởng</p>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        <ReferralCodeCard />
        <ReferralShareLinks />
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        <ReferralStatistics />
        <ReferralsList />
      </div>
    </div>
  )
}
