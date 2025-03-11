import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { PlusCircle, Users, DollarSign, Clock, Bell, CheckCircle, XCircle } from 'lucide-react'

export function QuickActions() {
  const router = useRouter()

  const actions = [
    {
      title: 'Tạo lượt chơi mới',
      icon: <PlusCircle className='h-4 w-4 mr-2' />,
      onClick: () => router.push('/admin/games?action=create'),
      color: 'text-blue-500'
    },
    {
      title: 'Duyệt nạp tiền',
      icon: <CheckCircle className='h-4 w-4 mr-2' />,
      onClick: () => router.push('/admin/payments?type=deposit&status=pending'),
      color: 'text-green-500'
    },
    {
      title: 'Xử lý rút tiền',
      icon: <DollarSign className='h-4 w-4 mr-2' />,
      onClick: () => router.push('/admin/payments?type=withdrawal&status=pending'),
      color: 'text-orange-500'
    },
    {
      title: 'Quản lý người dùng',
      icon: <Users className='h-4 w-4 mr-2' />,
      onClick: () => router.push('/admin/users'),
      color: 'text-purple-500'
    },
    {
      title: 'Gửi thông báo',
      icon: <Bell className='h-4 w-4 mr-2' />,
      onClick: () => router.push('/admin/notifications'),
      color: 'text-indigo-500'
    }
  ]

  return (
    <div className='flex flex-col gap-2'>
      {actions.map((action, i) => (
        <Button key={i} variant='outline' className='justify-start text-left font-normal' onClick={action.onClick}>
          <div className={`${action.color}`}>{action.icon}</div>
          {action.title}
        </Button>
      ))}
    </div>
  )
}
