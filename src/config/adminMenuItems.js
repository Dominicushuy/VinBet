// src/config/adminMenuItems.js
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
  HelpCircle
} from 'lucide-react'

/**
 * Cấu hình menu navigation cho Admin Dashboard
 * Được sử dụng trong cả AdminSidebar và ResponsiveAdminMenu
 */
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
        href: '/admin/transactions'
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
    title: 'Cài đặt',
    icon: <Settings className='w-5 h-5' />,
    href: '/admin/settings'
  }
]

/**
 * Menu items phụ trợ (hiển thị dưới cùng sidebar)
 */
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

/**
 * Menu items rút gọn cho mobile
 * Không bao gồm submenu, chỉ hiển thị trang chính
 */
export const adminMobileMenuItems = [
  ...adminMenuItems.map(item => ({
    title: item.title,
    icon: item.icon,
    href: item.href || item.subitems?.[0]?.href || '/admin/dashboard'
  })),
  {
    title: 'Trợ giúp',
    icon: <HelpCircle className='w-5 h-5' />,
    href: '/admin/support'
  }
]
