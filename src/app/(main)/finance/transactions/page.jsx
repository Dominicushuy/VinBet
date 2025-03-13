import { redirect } from 'next/navigation'
import { getSupabaseServer } from '@/lib/supabase/server'
import { TransactionDashboard } from '@/components/finance/TransactionDashboard'

export const metadata = {
  title: 'Lịch sử giao dịch - VinBet',
  description: 'Xem lịch sử giao dịch và thống kê tài chính của bạn'
}

export default async function TransactionsPage() {
  const supabase = getSupabaseServer()

  // Kiểm tra session và redirect nếu chưa đăng nhập
  const { data: sessionData } = await supabase.auth.getSession()
  if (!sessionData.session) {
    redirect('/login?redirectTo=/finance/transactions')
  }

  const userId = sessionData.session.user.id

  // Sử dụng Promise.all để tối ưu hóa các concurrent requests
  const [profileResult, transactionsResult, summaryResult] = await Promise.all([
    supabase.from('profiles').select('balance, username, display_name').eq('id', userId).single(),

    supabase
      .from('transactions')
      .select('*')
      .eq('profile_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),

    supabase.rpc('get_transaction_summary', {
      p_profile_id: userId,
      p_start_date: null,
      p_end_date: null
    })
  ])

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>Lịch sử giao dịch</h2>
        <p className='text-muted-foreground'>Xem và quản lý lịch sử giao dịch tài chính của bạn</p>
      </div>

      <TransactionDashboard
        initialData={{
          transactions: transactionsResult.data || [],
          summary: summaryResult.data?.[0] || null,
          profile: profileResult.data || { balance: 0 }
        }}
      />
    </div>
  )
}
