import { format, isAfter } from 'date-fns'
import { Eye, Edit, Award, Users, DollarSign, ArrowUpDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Pagination } from '@/components/ui/pagination'
import { formatCurrency } from '@/utils/formatUtils'

export function GameTable({ gameRounds, pagination, onPageChange, onSort, onView, onUpdate, onResult }) {
  // Status badge component
  const getStatusBadge = status => {
    switch (status) {
      case 'active':
        return <Badge className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'>Đang diễn ra</Badge>
      case 'scheduled':
        return (
          <Badge variant='outline' className='bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'>
            Sắp diễn ra
          </Badge>
        )
      case 'completed':
        return <Badge variant='secondary'>Đã kết thúc</Badge>
      case 'cancelled':
        return <Badge variant='destructive'>Đã hủy</Badge>
      default:
        return <Badge variant='outline'>{status}</Badge>
    }
  }

  // Check if game can enter result
  const canEnterResult = game => {
    return game.status === 'active' && isAfter(new Date(), new Date(game.end_time))
  }

  return (
    <div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className='flex items-center space-x-1 cursor-pointer' onClick={() => onSort('id')}>
                  <span>ID</span>
                  <ArrowUpDown className='h-3 w-3' />
                </div>
              </TableHead>
              <TableHead>
                <div className='flex items-center space-x-1 cursor-pointer' onClick={() => onSort('start_time')}>
                  <span>Bắt đầu</span>
                  <ArrowUpDown className='h-3 w-3' />
                </div>
              </TableHead>
              <TableHead>
                <div className='flex items-center space-x-1 cursor-pointer' onClick={() => onSort('end_time')}>
                  <span>Kết thúc</span>
                  <ArrowUpDown className='h-3 w-3' />
                </div>
              </TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Kết quả</TableHead>
              <TableHead>Thống kê</TableHead>
              <TableHead className='text-right'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gameRounds.map(game => (
              <TableRow key={game.id}>
                <TableCell>
                  <HoverCard>
                    <HoverCardTrigger className='cursor-help font-mono text-xs'>
                      {game.id.substring(0, 8)}...
                    </HoverCardTrigger>
                    <HoverCardContent side='right' className='w-auto'>
                      <p className='text-xs font-mono'>{game.id}</p>
                    </HoverCardContent>
                  </HoverCard>
                </TableCell>
                <TableCell>
                  <div className='flex flex-col'>
                    <span>{format(new Date(game.start_time), 'HH:mm')}</span>
                    <span className='text-xs text-muted-foreground'>
                      {format(new Date(game.start_time), 'dd/MM/yyyy')}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex flex-col'>
                    <span>{format(new Date(game.end_time), 'HH:mm')}</span>
                    <span className='text-xs text-muted-foreground'>
                      {format(new Date(game.end_time), 'dd/MM/yyyy')}
                    </span>
                    {game.status === 'active' && isAfter(new Date(), new Date(game.end_time)) && (
                      <span className='text-xs text-red-500'>Đã hết thời gian</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(game.status)}</TableCell>
                <TableCell>
                  {game.result ? (
                    <span className='font-medium'>{game.result}</span>
                  ) : (
                    <span className='text-muted-foreground text-sm'>-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className='flex flex-col'>
                    <div className='flex items-center'>
                      <Users className='h-3 w-3 mr-1 text-blue-500' />
                      <span className='text-xs'>{game.bets_count || 0} lượt cược</span>
                    </div>
                    <div className='flex items-center'>
                      <DollarSign className='h-3 w-3 mr-1 text-green-500' />
                      <span className='text-xs'>{formatCurrency(game.total_amount || 0)}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className='text-right'>
                  <div className='flex items-center justify-end space-x-1'>
                    <Button variant='outline' size='sm' onClick={() => onView(game.id)} aria-label='Xem chi tiết'>
                      <Eye className='h-4 w-4' />
                    </Button>

                    {canEnterResult(game) && (
                      <Button
                        variant='outline'
                        size='sm'
                        className='bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                        onClick={() => onResult(game)}
                        aria-label='Nhập kết quả'
                      >
                        <Award className='h-4 w-4' />
                      </Button>
                    )}

                    <Button variant='outline' size='sm' onClick={() => onUpdate(game)} aria-label='Chỉnh sửa'>
                      <Edit className='h-4 w-4' />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination.totalPages > 1 && (
        <div className='mt-4 flex justify-center'>
          <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  )
}
