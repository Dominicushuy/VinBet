import { Bell, DollarSign, Gamepad, ShieldAlert } from 'lucide-react'

export function getNotificationIcon(type, options = { size: 5 }) {
  const size = options.size
  const className = `h-${size} w-${size}`

  switch (type) {
    case 'system':
      return <Bell className={`${className} text-blue-500`} />
    case 'transaction':
      return <DollarSign className={`${className} text-green-500`} />
    case 'game':
      return <Gamepad className={`${className} text-purple-500`} />
    case 'admin':
      return <ShieldAlert className={`${className} text-red-500`} />
    default:
      return <Bell className={`${className} text-gray-500`} />
  }
}

export function getNotificationTypeLabel(type) {
  switch (type) {
    case 'system':
      return 'Hệ thống'
    case 'transaction':
      return 'Giao dịch'
    case 'game':
      return 'Game'
    case 'admin':
      return 'Admin'
    default:
      return 'Khác'
  }
}

export function getNotificationTypeBadge(type, withBorder = true) {
  const typeBadges = {
    system: `bg-blue-100 text-blue-600 ${withBorder ? 'border-blue-200' : ''}`,
    transaction: `bg-green-100 text-green-600 ${withBorder ? 'border-green-200' : ''}`,
    game: `bg-purple-100 text-purple-600 ${withBorder ? 'border-purple-200' : ''}`,
    admin: `bg-red-100 text-red-600 ${withBorder ? 'border-red-200' : ''}`
  }

  return typeBadges[type] || `bg-gray-100 text-gray-600 ${withBorder ? 'border-gray-200' : ''}`
}

export function formatTimeAgo(dateString) {
  if (!dateString) return 'N/A'

  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'vừa xong'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`
  return `${Math.floor(diffInSeconds / 86400)} ngày trước`
}
