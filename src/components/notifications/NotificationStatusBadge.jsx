import { Badge } from '@/components/ui/badge'
import { getNotificationTypeBadge, getNotificationTypeLabel } from '@/utils/notificationUtils'

export function NotificationStatusBadge({ type, showLabel = true, className = '' }) {
  return (
    <Badge variant='outline' className={`${getNotificationTypeBadge(type)} ${className}`}>
      {showLabel && getNotificationTypeLabel(type)}
    </Badge>
  )
}
