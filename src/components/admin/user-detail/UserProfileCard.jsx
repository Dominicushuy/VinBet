// Tạo file mới: src/components/admin/user-detail/UserProfileCard.jsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Edit } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { format, formatDistanceToNow } from 'date-fns'
import { formatCurrency } from '@/utils/formatUtils'
import { UserProfileForm } from './UserProfileForm'
import { ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { vi } from 'date-fns/locale'

export function UserProfileCard({ user, stats, form, onSubmit, isEditMode, setEditMode, updateUserMutation }) {
  const router = useRouter()

  return (
    <Card className='md:col-span-1'>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <CardTitle className='text-xl'>Hồ sơ người dùng</CardTitle>
        {!isEditMode && (
          <Button variant='ghost' size='sm' onClick={() => setEditMode(true)}>
            <Edit className='h-4 w-4 mr-1' />
            Sửa
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className='flex flex-col items-center mb-4'>
          <Avatar className='h-20 w-20 mb-2'>
            <AvatarImage src={user.avatar_url} />
            <AvatarFallback className='text-lg'>
              {(user.display_name || user.username || 'U')[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h3 className='text-lg font-semibold'>{user.display_name || user.username}</h3>
          <p className='text-sm text-muted-foreground'>{user.email}</p>
          <div className='flex mt-1 space-x-1'>
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

        <Separator className='my-4' />

        {isEditMode ? (
          <UserProfileForm
            form={form}
            onSubmit={onSubmit}
            setEditMode={setEditMode}
            updateUserMutation={updateUserMutation}
          />
        ) : (
          <div className='space-y-3'>
            <div className='grid grid-cols-2 gap-1'>
              <div className='text-sm text-muted-foreground'>User ID</div>
              <div className='text-sm font-medium overflow-hidden text-ellipsis'>
                <HoverCard>
                  <HoverCardTrigger className='cursor-help'>{user.id.substring(0, 8)}...</HoverCardTrigger>
                  <HoverCardContent side='right'>
                    <p className='text-xs font-mono'>{user.id}</p>
                  </HoverCardContent>
                </HoverCard>
              </div>

              <div className='text-sm text-muted-foreground'>Ngày đăng ký</div>
              <div className='text-sm'>{format(new Date(user.created_at), 'dd/MM/yyyy HH:mm')}</div>

              <div className='text-sm text-muted-foreground'>Hoạt động cuối</div>
              <div className='text-sm'>
                {stats.last_login ? (
                  <span title={format(new Date(stats.last_login), 'dd/MM/yyyy HH:mm')}>
                    {formatDistanceToNow(new Date(stats.last_login), { addSuffix: true, locale: vi })}
                  </span>
                ) : (
                  'Không có dữ liệu'
                )}
              </div>

              <div className='text-sm text-muted-foreground'>Số dư</div>
              <div className='text-sm font-semibold text-primary'>{formatCurrency(user.balance || 0)}</div>

              <div className='text-sm text-muted-foreground'>Mã giới thiệu</div>
              <div className='text-sm'>{user.referral_code || 'Chưa có mã'}</div>

              <div className='text-sm text-muted-foreground'>Telegram</div>
              <div className='text-sm'>
                {user.telegram_id ? (
                  <Badge variant='outline' className='bg-blue-50 text-blue-600'>
                    Đã kết nối
                  </Badge>
                ) : (
                  'Chưa kết nối'
                )}
              </div>

              <div className='text-sm text-muted-foreground'>Nguồn</div>
              <div className='text-sm'>
                {user.referred_by ? (
                  <div className='flex items-center'>
                    <span>Được giới thiệu</span>
                    <Button
                      variant='link'
                      size='sm'
                      className='h-4 p-0 ml-1'
                      onClick={() => router.push(`/admin/users/${user.referred_by}`)}
                    >
                      <ExternalLink className='h-3 w-3' />
                    </Button>
                  </div>
                ) : (
                  'Đăng ký trực tiếp'
                )}
              </div>
            </div>

            <Separator className='my-3' />

            <div className='flex flex-col space-y-2'>
              <h4 className='text-sm font-medium'>Ghi chú quản trị</h4>
              <textarea
                className='min-h-24 w-full rounded-md border border-input p-2 text-sm'
                placeholder='Thêm ghi chú về người dùng này (chỉ admin xem được)'
                defaultValue={user.admin_notes || ''}
              />
              <Button variant='outline' size='sm' className='self-end'>
                Lưu ghi chú
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
