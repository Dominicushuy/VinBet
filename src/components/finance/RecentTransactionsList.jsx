// src/components/finance/RecentTransactionsList.jsx
'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { ArrowDownLeft, ArrowUpRight, Clock, CreditCard, DollarSign, Award, Eye, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/utils/formatUtils'
import { toast } from 'react-hot-toast'

export function RecentTransactionsList({ transactions }) {
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Handler để mở dialog
  const handleOpenDetails = transaction => {
    setSelectedTransaction(transaction)
    setIsDialogOpen(true)
  }

  // Handler để đóng dialog
  const handleCloseDetails = () => {
    setIsDialogOpen(false)
    // Delay clearing selected transaction to avoid UI flicker
    setTimeout(() => setSelectedTransaction(null), 100)
  }

  // Nếu không có giao dịch nào
  if (!transactions || transactions.length === 0) {
    return (
      <div className='text-center py-10'>
        <Clock className='h-10 w-10 mx-auto text-muted-foreground mb-3' />
        <p className='text-muted-foreground'>Chưa có giao dịch nào</p>
        <Button variant='outline' className='mt-4' asChild>
          <a href='/finance/deposit'>Nạp tiền ngay</a>
        </Button>
      </div>
    )
  }

  // Lấy icon dựa vào loại giao dịch
  const getTransactionIcon = type => {
    switch (type) {
      case 'deposit':
        return <ArrowUpRight className='h-4 w-4 text-green-500' />
      case 'withdrawal':
        return <ArrowDownLeft className='h-4 w-4 text-red-500' />
      case 'bet':
        return <DollarSign className='h-4 w-4 text-blue-500' />
      case 'win':
        return <Award className='h-4 w-4 text-amber-500' />
      case 'referral_reward':
        return <Award className='h-4 w-4 text-purple-500' />
      default:
        return <CreditCard className='h-4 w-4 text-gray-500' />
    }
  }

  // Lấy màu dựa vào loại giao dịch
  const getAmountColor = type => {
    switch (type) {
      case 'deposit':
      case 'win':
      case 'referral_reward':
        return 'text-green-600'
      case 'withdrawal':
      case 'bet':
        return 'text-red-600'
      default:
        return ''
    }
  }

  // Lấy prefix dựa vào loại giao dịch
  const getAmountPrefix = type => {
    switch (type) {
      case 'deposit':
      case 'win':
      case 'referral_reward':
        return '+'
      case 'withdrawal':
      case 'bet':
        return '-'
      default:
        return ''
    }
  }

  // Lấy tên loại giao dịch
  const getTransactionType = type => {
    switch (type) {
      case 'deposit':
        return 'Nạp tiền'
      case 'withdrawal':
        return 'Rút tiền'
      case 'bet':
        return 'Đặt cược'
      case 'win':
        return 'Thắng cược'
      case 'referral_reward':
        return 'Thưởng giới thiệu'
      default:
        return type
    }
  }

  // Lấy badge trạng thái
  const getStatusBadge = status => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant='outline' className='bg-green-100 text-green-800 border-green-200'>
            Hoàn thành
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant='outline' className='bg-yellow-100 text-yellow-800 border-yellow-200'>
            Đang xử lý
          </Badge>
        )
      case 'failed':
        return (
          <Badge variant='outline' className='bg-red-100 text-red-800 border-red-200'>
            Thất bại
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant='outline' className='bg-gray-100 text-gray-800 border-gray-200'>
            Đã hủy
          </Badge>
        )
      default:
        return <Badge variant='outline'>{status}</Badge>
    }
  }

  // Copy to clipboard
  const copyToClipboard = (text, successMessage = 'Đã sao chép') => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success(successMessage)
      })
      .catch(() => {
        toast.error('Không thể sao chép dữ liệu')
      })
  }

  return (
    <>
      {/* Danh sách giao dịch */}
      <div className='space-y-4'>
        {transactions.map(transaction => (
          <div
            key={transaction.id}
            className='flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors'
          >
            <div className='flex items-center gap-3'>
              <div className='flex-shrink-0 h-10 w-10 rounded-full bg-muted flex items-center justify-center'>
                {getTransactionIcon(transaction.type)}
              </div>
              <div>
                <p className='font-medium'>{getTransactionType(transaction.type)}</p>
                <p className='text-xs text-muted-foreground'>
                  {transaction.created_at
                    ? format(new Date(transaction.created_at), 'HH:mm, dd/MM/yyyy', { locale: vi })
                    : ''}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <div className='text-right'>
                <p className={`font-semibold ${getAmountColor(transaction.type)}`}>
                  {getAmountPrefix(transaction.type)}
                  {formatCurrency(transaction.amount)}
                </p>
                <div className='mt-1'>{getStatusBadge(transaction.status)}</div>
              </div>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => handleOpenDetails(transaction)}
                aria-label='Xem chi tiết giao dịch'
              >
                <Eye className='h-4 w-4' />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Dialog chi tiết giao dịch */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedTransaction && (
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle>Chi tiết giao dịch</DialogTitle>
              <DialogDescription>
                Thông tin chi tiết về giao dịch #{selectedTransaction.id?.substring(0, 8) || 'N/A'}
              </DialogDescription>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>Loại giao dịch:</span>
                <span className='font-medium'>{getTransactionType(selectedTransaction.type)}</span>
              </div>
              <Separator />
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>Số tiền:</span>
                <span className={`font-semibold ${getAmountColor(selectedTransaction.type)}`}>
                  {getAmountPrefix(selectedTransaction.type)}
                  {formatCurrency(selectedTransaction.amount)}
                </span>
              </div>
              <Separator />
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>Trạng thái:</span>
                {getStatusBadge(selectedTransaction.status)}
              </div>
              <Separator />
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>Thời gian:</span>
                <span>
                  {selectedTransaction.created_at
                    ? format(new Date(selectedTransaction.created_at), 'HH:mm:ss, dd/MM/yyyy', { locale: vi })
                    : 'N/A'}
                </span>
              </div>
              {selectedTransaction.description && (
                <>
                  <Separator />
                  <div className='flex flex-col gap-2'>
                    <span className='text-muted-foreground'>Mô tả:</span>
                    <span className='text-sm'>{selectedTransaction.description}</span>
                  </div>
                </>
              )}
              {selectedTransaction.reference_id && (
                <>
                  <Separator />
                  <div className='flex items-center justify-between'>
                    <span className='text-muted-foreground'>Mã tham chiếu:</span>
                    <div className='flex items-center gap-1'>
                      <code className='bg-muted p-1 rounded text-xs'>
                        {selectedTransaction.reference_id.substring(0, 12)}
                      </code>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-6 w-6'
                        onClick={() => copyToClipboard(selectedTransaction.reference_id, 'Đã sao chép mã tham chiếu')}
                      >
                        <CreditCard className='h-3 w-3' />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => {
                  const details = `${getTransactionType(selectedTransaction.type)} - ${
                    selectedTransaction.created_at
                      ? format(new Date(selectedTransaction.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })
                      : ''
                  } - ${formatCurrency(selectedTransaction.amount)}`
                  copyToClipboard(details, 'Đã sao chép thông tin giao dịch')
                }}
              >
                Sao chép thông tin
              </Button>
              <DialogClose asChild>
                <Button onClick={handleCloseDetails}>Đóng</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}
