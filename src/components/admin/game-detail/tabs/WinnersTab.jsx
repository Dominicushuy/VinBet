'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Trophy,
  UserCheck,
  Eye,
  Search,
  Download,
  BarChart2,
  Crown,
  Medal,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ListFilter,
  Gift,
  Sparkles,
  Flame,
  AlertCircle,
  X
} from 'lucide-react'
import { format } from 'date-fns'
import { formatCurrency } from '@/utils/formatUtils'
import { motion, AnimatePresence } from 'framer-motion'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Progress } from '@/components/ui/progress'

export function WinnersTab({ game, winners, isLoading, onViewUser }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('win') // 'win', 'time', 'amount'
  const [sortOrder, setSortOrder] = useState('desc') // 'asc', 'desc'
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [showStats, setShowStats] = useState(false)
  const [highlightWinner, setHighlightWinner] = useState(null)

  useEffect(() => {
    // Reset pagination when search changes
    setCurrentPage(1)
  }, [searchTerm])

  // Function to toggle sort
  const toggleSort = field => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  // Lọc danh sách người thắng theo từ khóa tìm kiếm
  const filteredWinners = useMemo(() => {
    if (!searchTerm.trim()) {
      return [...winners].sort((a, b) => {
        if (sortBy === 'win') {
          return sortOrder === 'asc'
            ? (a.potential_win || 0) - (b.potential_win || 0)
            : (b.potential_win || 0) - (a.potential_win || 0)
        } else if (sortBy === 'time') {
          return sortOrder === 'asc'
            ? new Date(a.created_at) - new Date(b.created_at)
            : new Date(b.created_at) - new Date(a.created_at)
        } else if (sortBy === 'amount') {
          return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount
        }
        return 0
      })
    }

    return winners
      .filter(winner => {
        const displayName = winner.profiles?.display_name || ''
        const username = winner.profiles?.username || ''
        const email = winner.profiles?.email || ''
        return (
          displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          winner.chosen_number.includes(searchTerm)
        )
      })
      .sort((a, b) => {
        if (sortBy === 'win') {
          return sortOrder === 'asc'
            ? (a.potential_win || 0) - (b.potential_win || 0)
            : (b.potential_win || 0) - (a.potential_win || 0)
        } else if (sortBy === 'time') {
          return sortOrder === 'asc'
            ? new Date(a.created_at) - new Date(b.created_at)
            : new Date(b.created_at) - new Date(a.created_at)
        } else if (sortBy === 'amount') {
          return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount
        }
        return 0
      })
  }, [winners, searchTerm, sortBy, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredWinners.length / perPage)
  const paginatedWinners = useMemo(() => {
    const start = (currentPage - 1) * perPage
    return filteredWinners.slice(start, start + perPage)
  }, [filteredWinners, currentPage, perPage])

  // Tính tổng số tiền thắng
  const totalWinAmount = useMemo(() => {
    return winners.reduce((sum, winner) => sum + (winner.potential_win || 0), 0)
  }, [winners])

  // Winner statistics for visualization
  const winnerStats = useMemo(() => {
    // Get top 3 winners by amount
    const topWinners = [...winners].sort((a, b) => (b.potential_win || 0) - (a.potential_win || 0)).slice(0, 3)

    // Get distribution by amount
    const winAmountDistribution = winners.reduce((acc, winner) => {
      const amountRange = Math.floor(winner.potential_win / 500000) * 500000
      const rangeKey = `${amountRange}-${amountRange + 500000}`

      if (!acc[rangeKey]) {
        acc[rangeKey] = {
          range: rangeKey,
          count: 0,
          totalAmount: 0
        }
      }

      acc[rangeKey].count++
      acc[rangeKey].totalAmount += winner.potential_win

      return acc
    }, {})

    return {
      topWinners,
      amountDistribution: Object.values(winAmountDistribution).sort(
        (a, b) => parseInt(a.range.split('-')[0]) - parseInt(b.range.split('-')[0])
      )
    }
  }, [winners])

  // Thêm hàm xuất danh sách
  const handleExportWinners = useCallback(() => {
    if (!winners.length) return

    // Tạo content CSV
    const headers = ['ID', 'Người chơi', 'Số đã chọn', 'Số tiền đặt', 'Tiền thắng', 'Thời gian']
    const rows = winners.map(winner => [
      winner.id,
      winner.profiles?.display_name || winner.profiles?.username,
      winner.chosen_number,
      winner.amount,
      winner.potential_win,
      format(new Date(winner.created_at), 'dd/MM/yyyy HH:mm:ss')
    ])

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')

    // Tạo file và download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `winners-${game.id.substring(0, 8)}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [winners, game.id])

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <div className='flex justify-between items-center'>
          <Skeleton className='h-10 w-48' />
          <Skeleton className='h-10 w-32' />
        </div>
        <Skeleton className='h-96 w-full rounded-lg' />
      </div>
    )
  }

  if (game.status !== 'completed') {
    return (
      <motion.div
        className='flex flex-col items-center justify-center py-16 px-4 text-center'
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className='w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4'>
          <Trophy className='h-8 w-8 text-slate-400' />
        </div>
        <h3 className='text-xl font-semibold mb-2'>Chưa có kết quả</h3>
        <p className='text-muted-foreground max-w-md'>
          Danh sách người thắng sẽ hiển thị sau khi lượt chơi kết thúc và có kết quả. Vui lòng quay lại sau.
        </p>
      </motion.div>
    )
  }

  if (winners.length === 0) {
    return (
      <motion.div
        className='flex flex-col items-center justify-center py-16 px-4 text-center'
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className='w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4'>
          <UserCheck className='h-8 w-8 text-slate-400' />
        </div>
        <h3 className='text-xl font-semibold mb-2'>Không có người thắng</h3>
        <p className='text-muted-foreground max-w-md'>
          Không có người chơi nào đoán đúng kết quả <strong>{game.result}</strong>. Tất cả tiền cược sẽ được giữ lại cho
          hệ thống.
        </p>
      </motion.div>
    )
  }

  return (
    <div className='space-y-5'>
      {/* Button to toggle stats view */}
      <div className='flex justify-end'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setShowStats(!showStats)}
          className={`transition-all ${showStats ? 'bg-primary text-primary-foreground' : ''}`}
        >
          {showStats ? (
            <>
              <UserCheck className='h-4 w-4 mr-2' />
              Danh sách người thắng
            </>
          ) : (
            <>
              <BarChart2 className='h-4 w-4 mr-2' />
              Phân tích người thắng
            </>
          )}
        </Button>
      </div>

      <AnimatePresence mode='wait'>
        {showStats ? (
          <motion.div
            key='stats'
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className='overflow-hidden'
          >
            <div className='border rounded-lg p-6 bg-card space-y-6'>
              {/* Summary box */}
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                <div className='p-4 rounded-lg border bg-yellow-50 dark:bg-yellow-950/30 flex items-center space-x-4'>
                  <div className='p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full'>
                    <Trophy className='h-6 w-6 text-yellow-600 dark:text-yellow-400' />
                  </div>
                  <div>
                    <div className='text-sm text-yellow-600 dark:text-yellow-400'>Tổng người thắng</div>
                    <div className='text-2xl font-bold'>{winners.length}</div>
                  </div>
                </div>

                <div className='p-4 rounded-lg border bg-green-50 dark:bg-green-950/30 flex items-center space-x-4'>
                  <div className='p-3 bg-green-100 dark:bg-green-900 rounded-full'>
                    <Gift className='h-6 w-6 text-green-600 dark:text-green-400' />
                  </div>
                  <div>
                    <div className='text-sm text-green-600 dark:text-green-400'>Tổng tiền thưởng</div>
                    <div className='text-2xl font-bold'>{formatCurrency(totalWinAmount)}</div>
                  </div>
                </div>

                <div className='p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/30 flex items-center space-x-4'>
                  <div className='p-3 bg-blue-100 dark:bg-blue-900 rounded-full'>
                    <Medal className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                  </div>
                  <div>
                    <div className='text-sm text-blue-600 dark:text-blue-400'>Tiền thưởng TB</div>
                    <div className='text-2xl font-bold'>{formatCurrency(totalWinAmount / winners.length)}</div>
                  </div>
                </div>
              </div>

              {/* Top winners section */}
              {winnerStats.topWinners.length > 0 && (
                <div>
                  <h3 className='text-lg font-semibold mb-4 flex items-center'>
                    <Crown className='h-5 w-5 mr-2 text-yellow-500' />
                    Top người thắng cao nhất
                  </h3>

                  <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                    {winnerStats.topWinners.map((winner, index) => (
                      <div
                        key={winner.id}
                        className={`rounded-lg border p-4 relative ${
                          index === 0
                            ? 'bg-gradient-to-b from-yellow-50 to-transparent dark:from-yellow-950/30 dark:to-transparent border-yellow-200 dark:border-yellow-800'
                            : index === 1
                            ? 'bg-gradient-to-b from-slate-50 to-transparent dark:from-slate-900/50 dark:to-transparent'
                            : 'bg-gradient-to-b from-amber-50 to-transparent dark:from-amber-950/30 dark:to-transparent'
                        }`}
                      >
                        {index === 0 && (
                          <div className='absolute -top-3 -right-2'>
                            <span className='text-yellow-500'>
                              <Crown className='h-6 w-6 drop-shadow' />
                            </span>
                          </div>
                        )}

                        <div className='flex items-center mb-3'>
                          <Avatar className='h-10 w-10 mr-3 border-2 border-muted'>
                            <AvatarImage src={winner.profiles?.avatar_url} alt={winner.profiles?.display_name} />
                            <AvatarFallback className='bg-primary/10 text-primary'>
                              {(winner.profiles?.display_name || winner.profiles?.username || 'U')[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className='font-medium line-clamp-1'>
                              {winner.profiles?.display_name || winner.profiles?.username}
                            </p>
                            <Badge
                              variant='outline'
                              className='mt-1 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800'
                            >
                              {winner.chosen_number}
                            </Badge>
                          </div>
                        </div>

                        <div className='mt-2'>
                          <p className='text-sm text-muted-foreground'>Tiền thưởng</p>
                          <p className='text-xl font-bold text-green-600 dark:text-green-400'>
                            {formatCurrency(winner.potential_win)}
                          </p>
                        </div>

                        <div className='mt-2 flex justify-between items-center text-xs text-muted-foreground'>
                          <span>Cược: {formatCurrency(winner.amount)}</span>
                          <span>{format(new Date(winner.created_at), 'dd/MM/yyyy')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Amount distribution */}
              <div>
                <h3 className='text-lg font-semibold mb-4 flex items-center'>
                  <BarChart2 className='h-5 w-5 mr-2 text-blue-500' />
                  Phân bố tiền thưởng
                </h3>

                <div className='space-y-3'>
                  {winnerStats.amountDistribution.map(range => {
                    const maxAmount = Math.max(...winnerStats.amountDistribution.map(r => r.totalAmount))
                    const percentage = (range.totalAmount / maxAmount) * 100

                    return (
                      <div key={range.range} className='space-y-1'>
                        <div className='flex justify-between items-center'>
                          <span className='text-sm'>
                            {formatCurrency(parseInt(range.range.split('-')[0]))} -{' '}
                            {formatCurrency(parseInt(range.range.split('-')[1]))}
                          </span>
                          <span className='text-sm font-medium'>
                            {range.count} người ({formatCurrency(range.totalAmount)})
                          </span>
                        </div>
                        <div className='overflow-hidden h-2 text-xs flex rounded bg-slate-200 dark:bg-slate-700'>
                          <div
                            style={{ width: `${Math.max(percentage, 3)}%` }}
                            className='shadow-none flex flex-col text-center whitespace-nowrap justify-center bg-blue-500'
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key='table'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0 mb-4'>
              <div className='flex items-center space-x-2 bg-muted rounded-md px-3 sm:w-auto w-full'>
                <Search className='h-4 w-4 text-muted-foreground flex-shrink-0' />
                <Input
                  placeholder='Tìm người thắng...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent h-10'
                />
                {searchTerm && (
                  <Button variant='ghost' size='icon' className='h-6 w-6' onClick={() => setSearchTerm('')}>
                    <span className='sr-only'>Clear</span>
                    <X className='h-3 w-3 text-muted-foreground' />
                  </Button>
                )}
              </div>

              <Button
                variant='outline'
                size='sm'
                className='w-full sm:w-auto h-10'
                onClick={handleExportWinners}
                disabled={!winners.length}
              >
                <Download className='h-4 w-4 mr-2' />
                Xuất danh sách người thắng
              </Button>
            </div>

            <div className='border rounded-lg overflow-hidden shadow-sm bg-card'>
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader className='bg-muted/50'>
                    <TableRow>
                      <TableHead className='w-[250px] font-medium'>Người chơi</TableHead>
                      <TableHead className='font-medium'>Số đã chọn</TableHead>
                      <TableHead className='font-medium'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => toggleSort('amount')}
                          className='font-medium h-8 px-2'
                        >
                          Số tiền đặt
                          <ArrowUpDown
                            className={`ml-1 h-3.5 w-3.5 ${
                              sortBy === 'amount' ? 'text-primary' : 'text-muted-foreground'
                            }`}
                          />
                        </Button>
                      </TableHead>
                      <TableHead className='font-medium'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => toggleSort('win')}
                          className='font-medium h-8 px-2'
                        >
                          Tiền thắng
                          <ArrowUpDown
                            className={`ml-1 h-3.5 w-3.5 ${
                              sortBy === 'win' ? 'text-primary' : 'text-muted-foreground'
                            }`}
                          />
                        </Button>
                      </TableHead>
                      <TableHead className='font-medium'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => toggleSort('time')}
                          className='font-medium h-8 px-2'
                        >
                          Thời gian
                          <ArrowUpDown
                            className={`ml-1 h-3.5 w-3.5 ${
                              sortBy === 'time' ? 'text-primary' : 'text-muted-foreground'
                            }`}
                          />
                        </Button>
                      </TableHead>
                      <TableHead className='text-right'>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedWinners.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className='h-32 text-center'>
                          <div className='flex flex-col items-center justify-center text-muted-foreground'>
                            <AlertCircle className='h-8 w-8 mb-2' />
                            <p>Không tìm thấy người thắng phù hợp</p>
                            {searchTerm && (
                              <Button variant='link' className='mt-2' onClick={() => setSearchTerm('')}>
                                Xóa từ khóa tìm kiếm
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedWinners.map((winner, index) => (
                        <TableRow
                          key={winner.id}
                          className={`group hover:bg-muted/50 transition-colors ${
                            highlightWinner === winner.id ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                          }`}
                          onMouseEnter={() => setHighlightWinner(winner.id)}
                          onMouseLeave={() => setHighlightWinner(null)}
                        >
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <Avatar className='h-9 w-9 border-2 border-muted'>
                                <AvatarImage src={winner.profiles?.avatar_url} alt={winner.profiles?.display_name} />
                                <AvatarFallback className='bg-primary/10 text-primary font-medium'>
                                  {(winner.profiles?.display_name || winner.profiles?.username || 'U')[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className='text-sm font-medium'>
                                  {winner.profiles?.display_name || winner.profiles?.username}
                                </p>
                                <p className='text-xs text-muted-foreground truncate max-w-[180px]'>
                                  {winner.profiles?.email}
                                </p>
                              </div>
                              {index === 0 && (
                                <span className='ml-1'>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Crown className='h-4 w-4 text-yellow-500' />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Người thắng lớn nhất</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className='font-medium'>
                            <Badge
                              variant='default'
                              className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                            >
                              <Sparkles className='h-3 w-3 mr-1' />
                              {winner.chosen_number}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(winner.amount)}</TableCell>
                          <TableCell className='font-medium'>
                            <span className='text-green-600 dark:text-green-400 flex items-center'>
                              {formatCurrency(winner.potential_win)}
                              {winner.potential_win > 10000000 && <Flame className='h-4 w-4 ml-1 text-amber-500' />}
                            </span>
                          </TableCell>
                          <TableCell className='text-sm text-muted-foreground'>
                            {format(new Date(winner.created_at), 'HH:mm, dd/MM/yyyy')}
                          </TableCell>
                          <TableCell className='text-right'>
                            <Button
                              variant={highlightWinner === winner.id ? 'secondary' : 'ghost'}
                              size='sm'
                              onClick={() => onViewUser(winner.profiles?.id)}
                              className='opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100'
                            >
                              <Eye className='h-4 w-4 mr-1' />
                              Xem
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className='p-4 border-t flex items-center justify-between'>
                  <div className='text-sm text-muted-foreground'>
                    Hiển thị {(currentPage - 1) * perPage + 1} đến{' '}
                    {Math.min(currentPage * perPage, filteredWinners.length)} trong tổng số {filteredWinners.length}{' '}
                    người thắng
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Button
                      variant='outline'
                      size='icon'
                      className='h-8 w-8'
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className='h-4 w-4' />
                    </Button>
                    <div className='text-sm'>
                      Trang {currentPage} / {totalPages}
                    </div>
                    <Button
                      variant='outline'
                      size='icon'
                      className='h-8 w-8'
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className='h-4 w-4' />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='outline' size='sm' className='h-8'>
                          {perPage} dòng <ChevronLeft className='h-3.5 w-3.5 rotate-90 ml-1' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        {[5, 10, 20, 50].map(value => (
                          <DropdownMenuItem
                            key={value}
                            onClick={() => {
                              setPerPage(value)
                              setCurrentPage(1)
                            }}
                            className={value === perPage ? 'bg-primary/10 font-medium' : ''}
                          >
                            {value} dòng
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )}
            </div>

            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 mt-4'>
              <div className='flex items-center text-sm text-muted-foreground'>
                <BarChart2 className='h-4 w-4 mr-2' />
                <span>
                  {filteredWinners.length} người thắng với tổng tiền thưởng: {formatCurrency(totalWinAmount)}
                </span>
              </div>

              <div className='flex items-center bg-green-50 dark:bg-green-950 rounded-full px-4 py-2'>
                <Trophy className='h-5 w-5 text-yellow-500 mr-2' />
                <div className='text-sm font-medium text-green-700 dark:text-green-300'>Kết quả: {game.result}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
