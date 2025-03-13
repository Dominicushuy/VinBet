import { Suspense } from 'react'
import { getUserSession } from '@/lib/auth/session'
import { getSupabaseServer } from '@/lib/supabase/server'
import { ProfileDashboard } from '@/components/profile/ProfileDashboard'
import { Skeleton } from '@/components/ui/skeleton'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Hồ sơ cá nhân | VinBet',
  description: 'Quản lý thông tin tài khoản VinBet của bạn'
}

async function getUserStats(userId) {
  try {
    const supabase = getSupabaseServer()

    // Sử dụng RPC function đã định nghĩa trong database
    const { data, error } = await supabase.rpc('get_user_admin_stats', {
      p_user_id: userId
    })

    if (error) {
      console.error('Error fetching user stats:', error)
      return {}
    }

    return data || {}
  } catch (error) {
    console.error('Unexpected error in getUserStats:', error)
    return {}
  }
}

export default async function ProfilePage() {
  // Get user session
  const { session, profile, error } = await getUserSession()

  // Redirect to login if no session
  if (!session || error) {
    redirect('/login?redirectTo=/profile')
  }

  // Get user stats
  const stats = await getUserStats(session.user.id)

  return (
    <div className='container max-w-screen-xl mx-auto py-6 px-4 sm:px-6'>
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileDashboard initialProfile={profile} initialStats={stats} />
      </Suspense>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className='space-y-8'>
      <Skeleton className='h-40 w-full rounded-xl' />
      <div className='grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6'>
        <div className='space-y-6'>
          <Skeleton className='h-60 w-full rounded-lg' />
          <Skeleton className='h-80 w-full rounded-lg' />
        </div>
        <div>
          <Skeleton className='h-12 w-full rounded-lg mb-6' />
          <Skeleton className='h-[500px] w-full rounded-lg' />
        </div>
      </div>
    </div>
  )
}
