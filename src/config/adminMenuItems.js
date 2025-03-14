// src/config/adminMenuItems.js
import { MessageSquare } from 'lucide-react'
import {
  LayoutDashboard,
  Users,
  Dices,
  CreditCard,
  Bell,
  Gift,
  Settings,
  FileText,
  BarChart2,
  HelpCircle,
  UserCog // New import for profile management
} from 'lucide-react'

export const adminMenuItems = [
  {
    title: 'Dashboard',
    icon: <LayoutDashboard className='w-5 h-5' />,
    href: '/admin/dashboard'
  },
  {
    title: 'Người dùng',
    icon: <Users className='w-5 h-5' />,
    href: '/admin/users'
  },
  {
    title: 'Trò chơi',
    icon: <Dices className='w-5 h-5' />,
    href: '/admin/games'
  },
  {
    title: 'Thanh toán',
    icon: <CreditCard className='w-5 h-5' />,
    group: 'payments',
    subitems: [
      {
        title: 'Yêu cầu nạp tiền',
        href: '/admin/payments?type=deposit'
      },
      {
        title: 'Yêu cầu rút tiền',
        href: '/admin/payments?type=withdrawal'
      },
      {
        title: 'Lịch sử giao dịch',
        href: '/admin/payments?type=transactions'
      }
    ]
  },
  {
    title: 'Thông báo',
    icon: <Bell className='w-5 h-5' />,
    href: '/admin/notifications'
  },
  {
    title: 'Giới thiệu',
    icon: <Gift className='w-5 h-5' />,
    href: '/admin/referrals'
  },
  {
    title: 'Báo cáo & Thống kê',
    icon: <BarChart2 className='w-5 h-5' />,
    group: 'reports',
    subitems: [
      {
        title: 'Báo cáo doanh thu',
        href: '/admin/reports/revenue'
      },
      {
        title: 'Thống kê người dùng',
        href: '/admin/reports/users'
      },
      {
        title: 'Thống kê cá cược',
        href: '/admin/reports/bets'
      }
    ]
  },
  {
    title: 'Tài khoản Admin',
    icon: <UserCog className='w-5 h-5' />,
    group: 'admin-profile',
    subitems: [
      {
        title: 'Thông tin tài khoản',
        href: '/admin/profile/info'
      },
      {
        title: 'Nhật ký hoạt động',
        href: '/admin/profile/activity'
      }
    ]
  },
  // Thêm mục Telegram
  {
    title: 'Telegram',
    icon: <MessageSquare className='w-5 h-5' />,
    href: '/admin/telegram',
    group: 'telegram',
    subitems: [
      {
        title: 'Tổng quan',
        href: '/admin/telegram/oveview'
      },
      {
        title: 'Trạng thái Bot',
        href: '/admin/telegram/status'
      },
      {
        title: 'Kết nối',
        href: '/admin/telegram/connections'
      },
      {
        title: 'Thông báo',
        href: '/admin/telegram/notifications'
      },
      {
        title: 'Thống kê',
        href: '/admin/telegram/stats'
      }
    ]
  },

  {
    title: 'Cài đặt',
    icon: <Settings className='w-5 h-5' />,
    href: '/admin/settings'
  }
]

export const adminSupportMenuItems = [
  {
    title: 'Trợ giúp & Hỗ trợ',
    icon: <HelpCircle className='w-5 h-5' />,
    href: '/admin/support'
  },
  {
    title: 'Hướng dẫn sử dụng',
    icon: <FileText className='w-5 h-5' />,
    href: '/admin/guides'
  }
]

export const adminMobileMenuItems = [
  ...adminMenuItems
    .map(item =>
      item.subitems
        ? item.subitems.map(subitem => ({
            title: subitem.title,
            icon: item.icon,
            href: subitem.href
          }))
        : {
            title: item.title,
            icon: item.icon,
            href: item.href
          }
    )
    .flat(),
  {
    title: 'Trợ giúp',
    icon: <HelpCircle className='w-5 h-5' />,
    href: '/admin/support'
  }
]
