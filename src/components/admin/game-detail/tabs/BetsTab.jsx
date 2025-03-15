'use client'

import { useState, useMemo, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Users,
  Search,
  Eye,
  BarChart2,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Trophy,
  PieChart,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { formatCurrency } from '@/utils/formatUtils'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useGameBetsQuery } from '@/hooks/queries/useGameQueries'
import { motion, AnimatePresence } from 'framer-motion'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export function BetsTab({ game, gameId, betStats, isLoading, onViewUser, onSelectNumber, selectedNumber }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('time') // 'time', 'amount', 'win'
  const [sortOrder, setSortOrder] = useState('desc') // 'asc', 'desc'
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [showStats, setShowStats] = useState(false)
  const [hoverRow, setHoverRow] = useState(null)

  // Fetch real bet data
  const { data: betsData, isLoading: isBetsLoading } = useGameBetsQuery(gameId)

  // Get real bets data
  const bets = useMemo(() => betsData?.bets || [], [betsData])

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, selectedNumber])

  // Number distribution for visualization
  const numberDistribution = useMemo(() => {
    const distribution = {}

    bets.forEach(bet => {
      const num = bet.chosen_number
      if (!distribution[num]) {
        distribution[num] = {
          count: 0,
          totalAmount: 0,
          isWinning: game.result === num
        }
      }
      distribution[num].count++
      distribution[num].totalAmount += bet.amount
    })

    return Object.entries(distribution)
      .map(([number, data]) => ({
        number,
        ...data
      }))
      .sort((a, b) => b.count - a.count)
  }, [bets, game.result])

  // Function to toggle sort
  const toggleSort = field => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  // Lọc danh sách cược dựa trên tìm kiếm và filter
  const filteredBets = useMemo(() => {
    const filtered = bets.filter(bet => {
      // Lọc theo số được chọn
      if (selectedNumber && bet.chosen_number !== selectedNumber) {
        return false
      }

      // Lọc theo trạng thái
      if (statusFilter !== 'all' && bet.status !== statusFilter) {
        return false
      }

      // Lọc theo từ khóa tìm kiếm
      if (searchTerm) {
        const username = bet.profiles?.username || ''
        const displayName = bet.profiles?.display_name || ''
        const email = bet.profiles?.email || ''

        return (
          username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bet.chosen_number.includes(searchTerm)
        )
      }

      return true
    })

    // Sort the filtered bets
    return [...filtered].sort((a, b) => {
      if (sortBy === 'time') {
        return sortOrder === 'asc'
          ? new Date(a.created_at) - new Date(b.created_at)
          : new Date(b.created_at) - new Date(a.created_at)
      } else if (sortBy === 'amount') {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount
      } else if (sortBy === 'win') {
        return sortOrder === 'asc'
          ? (a.potential_win || 0) - (b.potential_win || 0)
          : (b.potential_win || 0) - (a.potential_win || 0)
      }
      return 0
    })
  }, [bets, selectedNumber, statusFilter, searchTerm, sortBy, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredBets.length / perPage)
  const paginatedBets = useMemo(() => {
    const start = (currentPage - 1) * perPage
    return filteredBets.slice(start, start + perPage)
  }, [filteredBets, currentPage, perPage])

  // Hiển thị trạng thái cược
  const getStatusBadge = status => {
    switch (status) {
      case 'won':
        return (
          <Badge variant='default' className='bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium'>
            <Trophy className='h-3 w-3 mr-1' /> Thắng
          </Badge>
        )
      case 'lost':
        return (
          <Badge variant='outline' className='bg-slate-100 dark:bg-slate-800'>
            Thua
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant='secondary' className='bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'>
            Đang chờ
          </Badge>
        )
      default:
        return <Badge variant='outline'>{status}</Badge>
    }
  }

  if (isLoading || isBetsLoading) {
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

  if (betStats.total_bets === 0) {
    return (
      <motion.div
        className='flex flex-col items-center justify-center py-16 px-4 text-center'
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className='w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4'>
          <Users className='h-8 w-8 text-slate-400' />
        </div>
        <h3 className='text-xl font-semibold mb-2'>Chưa có lượt cược nào</h3>
        <p className='text-muted-foreground max-w-md'>
          Người dùng chưa đặt cược cho lượt chơi này. Các lượt cược sẽ hiển thị tại đây khi có người tham gia.
        </p>
      </motion.div>
    )
  }

  return (
    <div className='space-y-4'>
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
              <Users className='h-4 w-4 mr-2' />
              Danh sách cược
            </>
          ) : (
            <>
              <PieChart className='h-4 w-4 mr-2' />
              Phân tích số liệu
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
            <div className='border rounded-lg p-4 bg-card'>
              <h3 className='text-lg font-semibold mb-4 flex items-center'>
                <BarChart2 className='h-5 w-5 mr-2 text-primary' />
                Phân bố lượt đặt cược
              </h3>

              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'>
                {numberDistribution.slice(0, 12).map(item => (
                  <div
                    key={item.number}
                    className={`border rounded-lg p-3 transition-all ${
                      game.result === item.number
                        ? 'border-green-500 bg-green-50 dark:bg-green-950'
                        : 'hover:border-primary/50'
                    }`}
                  >
                    <div className='flex items-center justify-between mb-2'>
                      <Badge
                        variant={game.result === item.number ? 'default' : 'outline'}
                        className={game.result === item.number ? 'bg-green-500 text-white' : ''}
                      >
                        {item.number}
                      </Badge>
                      <span className='text-sm font-medium'>{item.count} lượt</span>
                    </div>

                    <div className='relative pt-1'>
                      <div className='overflow-hidden h-2 text-xs flex rounded bg-slate-200 dark:bg-slate-700'>
                        <div
                          style={{
                            width: `${(item.count / Math.max(...numberDistribution.map(d => d.count))) * 100}%`
                          }}
                          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                            game.result === item.number ? 'bg-green-500' : 'bg-primary'
                          }`}
                        ></div>
                      </div>
                    </div>

                    <div className='flex justify-between items-center mt-2 text-xs text-muted-foreground'>
                      <span>Tổng cược:</span>
                      <span className='font-medium text-foreground'>{formatCurrency(item.totalAmount)}</span>
                    </div>
                  </div>
                ))}
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
                  placeholder='Tìm người chơi, số...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent h-10'
                />
                {searchTerm && (
                  <Button variant='ghost' size='icon' className='h-6 w-6' onClick={() => setSearchTerm('')}>
                    <span className='sr-only'>Clear</span>
                    <span aria-hidden className='text-muted-foreground'>
                      ×
                    </span>
                  </Button>
                )}
              </div>

              <div className='flex items-center gap-2 w-full sm:w-auto'>
                <Tabs value={statusFilter} onValueChange={setStatusFilter} className='w-full sm:w-auto'>
                  <TabsList className='grid grid-cols-3 h-10'>
                    <TabsTrigger value='all' className='text-xs px-3 data-[state=active]:bg-background'>
                      Tất cả
                      <Badge className='ml-1.5 bg-primary/10 text-primary'>{filteredBets.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value='won' className='text-xs px-3 data-[state=active]:bg-background'>
                      Thắng
                      <Badge className='ml-1.5 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'>
                        {filteredBets.filter(b => b.status === 'won').length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value='lost' className='text-xs px-3 data-[state=active]:bg-background'>
                      Thua
                      <Badge className='ml-1.5 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'>
                        {filteredBets.filter(b => b.status === 'lost').length}
                      </Badge>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {selectedNumber && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => onSelectNumber(null)}
                          className='flex items-center h-10 border-primary/30 text-primary bg-primary/5'
                        >
                          <Filter className='h-4 w-4 mr-1' />
                          {selectedNumber}
                          <span className='ml-1.5 hover:bg-primary/10 rounded-full h-5 w-5 inline-flex items-center justify-center'>
                            ×
                          </span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side='bottom'>
                        <p>Bỏ lọc theo số</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>

            <div className='border rounded-lg overflow-hidden shadow-sm bg-card'>
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader className='bg-muted/50'>
                    <TableRow>
                      <TableHead className='font-medium'>Người chơi</TableHead>
                      <TableHead className='font-medium'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => toggleSort('amount')}
                          className='font-medium h-8 px-2'
                        >
                          Số tiền
                          <ArrowUpDown
                            className={`ml-1 h-3.5 w-3.5 ${
                              sortBy === 'amount' ? 'text-primary' : 'text-muted-foreground'
                            }`}
                          />
                        </Button>
                      </TableHead>
                      <TableHead className='font-medium'>Số đã chọn</TableHead>
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
                      <TableHead className='font-medium'>Trạng thái</TableHead>
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
                    {paginatedBets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className='h-32 text-center'>
                          <div className='flex flex-col items-center justify-center text-muted-foreground'>
                            <AlertCircle className='h-8 w-8 mb-2' />
                            <p>Không có dữ liệu phù hợp với điều kiện tìm kiếm</p>
                            <Button
                              variant='link'
                              className='mt-2'
                              onClick={() => {
                                setSearchTerm('')
                                setStatusFilter('all')
                                onSelectNumber(null)
                              }}
                            >
                              Xóa bộ lọc
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedBets.map(bet => (
                        <TableRow
                          key={bet.id}
                          className='group'
                          onMouseEnter={() => setHoverRow(bet.id)}
                          onMouseLeave={() => setHoverRow(null)}
                        >
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <Avatar className='h-8 w-8 border-2 border-muted'>
                                <AvatarImage src={bet.profiles?.avatar_url} alt={bet.profiles?.username} />
                                <AvatarFallback className='bg-primary/10 text-primary font-medium'>
                                  {(bet.profiles?.display_name || bet.profiles?.username || 'U')[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className='text-sm font-medium truncate max-w-[120px] sm:max-w-[200px]'>
                                  {bet.profiles?.display_name || bet.profiles?.username}
                                </p>
                                <p className='text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-[200px]'>
                                  {bet.profiles?.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className='font-medium'>{formatCurrency(bet.amount)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={bet.chosen_number === game.result ? 'default' : 'outline'}
                              className={`cursor-pointer ${
                                bet.chosen_number === game.result
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 hover:bg-green-200'
                                  : 'hover:bg-primary/10'
                              }`}
                              onClick={() =>
                                onSelectNumber(bet.chosen_number === selectedNumber ? null : bet.chosen_number)
                              }
                            >
                              {bet.chosen_number}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {bet.status === 'won' ? (
                              <span className='font-medium text-green-600 dark:text-green-400'>
                                {formatCurrency(bet.potential_win)}
                              </span>
                            ) : (
                              <span className='text-muted-foreground'>-</span>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(bet.status)}</TableCell>
                          <TableCell className='text-sm text-muted-foreground'>
                            {format(new Date(bet.created_at), 'HH:mm, dd/MM/yyyy')}
                          </TableCell>
                          <TableCell className='text-right'>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant={hoverRow === bet.id ? 'secondary' : 'ghost'} size='sm'>
                                  <Eye className='h-4 w-4' />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent side='left' className='w-80 p-0'>
                                <div className='p-4 border-b'>
                                  <div className='flex items-center gap-3'>
                                    <Avatar className='h-10 w-10 border-2 border-muted'>
                                      <AvatarImage src={bet.profiles?.avatar_url} alt={bet.profiles?.username} />
                                      <AvatarFallback className='bg-primary/10 text-primary font-medium'>
                                        {(bet.profiles?.display_name || bet.profiles?.username || 'U')[0].toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className='font-medium'>
                                        {bet.profiles?.display_name || bet.profiles?.username}
                                      </p>
                                      <p className='text-xs text-muted-foreground'>{bet.profiles?.email}</p>
                                    </div>
                                  </div>
                                </div>
                                <div className='p-4 space-y-3'>
                                  <div className='grid grid-cols-2 gap-3'>
                                    <div>
                                      <p className='text-xs text-muted-foreground'>ID người chơi</p>
                                      <p className='text-sm font-mono truncate'>{bet.profile_id}</p>
                                    </div>
                                    <div>
                                      <p className='text-xs text-muted-foreground'>ID cược</p>
                                      <p className='text-sm font-mono truncate'>{bet.id}</p>
                                    </div>
                                  </div>
                                  <div className='grid grid-cols-2 gap-3'>
                                    <div>
                                      <p className='text-xs text-muted-foreground'>Số đã chọn</p>
                                      <p className='text-sm font-medium'>{bet.chosen_number}</p>
                                    </div>
                                    <div>
                                      <p className='text-xs text-muted-foreground'>Trạng thái</p>
                                      <p className='text-sm'>{getStatusBadge(bet.status)}</p>
                                    </div>
                                  </div>
                                  <div className='grid grid-cols-2 gap-3'>
                                    <div>
                                      <p className='text-xs text-muted-foreground'>Số tiền cược</p>
                                      <p className='text-sm font-medium'>{formatCurrency(bet.amount)}</p>
                                    </div>
                                    <div>
                                      <p className='text-xs text-muted-foreground'>Tiền thắng</p>
                                      <p className='text-sm font-medium'>
                                        {bet.status === 'won' ? formatCurrency(bet.potential_win) : '-'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className='p-3 border-t bg-muted/30 flex justify-end'>
                                  <Button size='sm' onClick={() => onViewUser(bet.profile_id)}>
                                    Xem trang người dùng
                                  </Button>
                                </div>
                              </PopoverContent>
                            </Popover>
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
                    {Math.min(currentPage * perPage, filteredBets.length)} trong tổng số {filteredBets.length} lượt cược
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
