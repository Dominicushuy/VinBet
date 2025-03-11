import { redirect } from 'next/navigation'
import { getUserSession } from '@/lib/auth/session'
import { getSupabaseServer } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/layout/AdminHeader'
import { AdminSidebar } from '@/components/admin/layout/AdminSidebar'
import { AdminFooter } from '@/components/admin/layout/AdminFooter'

export default async function AdminLayout({ children }) {
  // Kiểm tra session
  const { session } = await getUserSession()
  if (!session) {
    redirect('/login')
  }

  // Kiểm tra quyền admin
  const supabase = getSupabaseServer()
  const { data, error } = await supabase
    .from('profiles')
    .select('is_admin, username, display_name, avatar_url')
    .eq('id', session.user.id)
    .single()

  if (error || !data?.is_admin) {
    redirect('/')
  }

  const userProfile = {
    id: session.user.id,
    email: session.user.email,
    name: data.display_name || data.username || 'Admin',
    avatar: data.avatar_url
  }

  return (
    <div className='min-h-screen bg-background flex flex-col'>
      <AdminHeader userProfile={userProfile} />
      <div className='flex-1 flex'>
        <AdminSidebar userProfile={userProfile} />
        <main className='flex-1 p-6 overflow-auto'>
          <div className='container mx-auto max-w-7xl'>{children}</div>
        </main>
      </div>
      <AdminFooter />
    </div>
  )
}
