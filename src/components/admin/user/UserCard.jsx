// src/components/admin/UserCard.jsx
'use client'

import { format } from 'date-fns'
import { MoreVertical, UserCog, BarChart2, CheckCircle, Ban } from 'lucide-react'
import { formatCurrency } from '@/utils/formatUtils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

export function UserCard({
  user,
  isSelected,
  onSelect,
  onViewDetails,
  onViewTransactions,
  onBlockUser,
  onActivateUser
}) {
  return (
    <Card className='overflow-hidden'>
      <CardHeader className='pb-2'>
        <div className='flex items-center space-x-3'>
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(user.id)}
            aria-label={`Select ${user.username}`}
          />
          <Avatar className='h-9 w-9'>
            <AvatarImage src={user.avatar_url || ''} />
            <AvatarFallback>{(user.display_name || user.username || 'U').charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className='text-base'>{user.display_name || user.username}</CardTitle>
            <p className='text-xs text-muted-foreground'>{user.email}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className='pb-3'>
        <div className='grid grid-cols-2 gap-2 text-sm'>
          <div>
            <p className='font-medium text-muted-foreground'>Số dư:</p>
            <p>{formatCurrency(user.balance || 0)}</p>
          </div>
          <div>
            <p className='font-medium text-muted-foreground'>Trạng thái:</p>
            <div className='flex space-x-2'>
              {user.is_admin && (
                <Badge className='bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'>Admin</Badge>
              )}
              {user.is_blocked && <Badge variant='destructive'>Đã khóa</Badge>}
              {!user.is_blocked && !user.is_admin && (
                <Badge variant='outline' className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'>
                  Hoạt động
                </Badge>
              )}
            </div>
          </div>
          <div>
            <p className='font-medium text-muted-foreground'>Ngày đăng ký:</p>
            <p>{user.created_at ? format(new Date(user.created_at), 'dd/MM/yyyy') : 'N/A'}</p>
          </div>
          <div>
            <p className='font-medium text-muted-foreground'>Hoạt động:</p>
            <div className='flex items-center space-x-2'>
              <span className='flex h-2 w-2 rounded-full bg-green-500' />
              <span className='text-xs'>
                {user.last_active ? `${format(new Date(user.last_active), 'HH:mm')}` : 'Offline'}
              </span>
            </div>
          </div>
        </div>
        <div className='mt-3 flex justify-end'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='sm'>
                <MoreVertical className='h-4 w-4' />
                <span className='ml-2'>Thao tác</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onViewDetails(user.id)}>
                <UserCog className='mr-2 h-4 w-4' />
                Xem chi tiết
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewTransactions(user.id)}>
                <BarChart2 className='mr-2 h-4 w-4' />
                Xem giao dịch
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {user.is_blocked ? (
                <DropdownMenuItem onClick={() => onActivateUser(user.id)}>
                  <CheckCircle className='mr-2 h-4 w-4 text-green-500' />
                  Kích hoạt tài khoản
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onBlockUser(user.id)} className='text-red-500'>
                  <Ban className='mr-2 h-4 w-4' />
                  Khóa tài khoản
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
