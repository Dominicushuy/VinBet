import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { PlusCircle, Users, DollarSign, Bell, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function QuickActions() {
  const router = useRouter()

  const actions = [
    {
      title: 'Tạo lượt chơi mới',
      icon: <PlusCircle className='h-4 w-4 mr-2' />,
      onClick: () => router.push('/admin/games?action=create'),
      color: 'text-primary'
    },
    {
      title: 'Duyệt nạp tiền',
      icon: <CheckCircle className='h-4 w-4 mr-2' />,
      onClick: () => router.push('/admin/payments?type=deposit&status=pending'),
      color: 'text-success'
    },
    {
      title: 'Xử lý rút tiền',
      icon: <DollarSign className='h-4 w-4 mr-2' />,
      onClick: () => router.push('/admin/payments?type=withdrawal&status=pending'),
      color: 'text-warning'
    },
    {
      title: 'Quản lý người dùng',
      icon: <Users className='h-4 w-4 mr-2' />,
      onClick: () => router.push('/admin/users'),
      color: 'text-accent'
    },
    {
      title: 'Gửi thông báo',
      icon: <Bell className='h-4 w-4 mr-2' />,
      onClick: () => router.push('/admin/notifications'),
      color: 'text-secondary'
    }
  ]

  return (
    <div className='flex flex-col gap-2'>
      {actions.map((action, i) => (
        <Button
          key={i}
          variant='outline'
          className='justify-start text-left font-normal'
          onClick={action.onClick}
          aria-label={action.title}
        >
          <div className={cn(action.color)}>{action.icon}</div>
          {action.title}
        </Button>
      ))}
    </div>
  )
}
