'use client'

import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useTransactionHelpers } from '@/hooks/useTransactionHelpers'
import {
  ArrowDownToLine,
  Calendar,
  Check,
  Clock,
  CopyIcon,
  FileText,
  Hash,
  Link2Icon,
  PrinterIcon,
  Tag
} from 'lucide-react'
import { formatCurrency } from '@/utils/formatUtils'
import { ArrowUpRight, DollarSign, Award, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'

export function TransactionDetailModal({ transaction, isOpen, onClose }) {
  const {
    getTransactionIcon,
    getAmountColor,
    formatAmount,
    copyToClipboard,
    formatTransactionType,
    formatTransactionStatus
  } = useTransactionHelpers()

  if (!transaction) return null

  // Get transaction type icon
  const getTransactionTypeIcon = () => {
    const iconInfo = getTransactionIcon(transaction.type)

    // Dynamically import icons based on component name
    switch (iconInfo.component) {
      case 'ArrowUpRight':
        return <ArrowUpRight className={`h-6 w-6 ${iconInfo.color}`} />
      case 'ArrowDownRight':
        return <ArrowDownToLine className={`h-6 w-6 ${iconInfo.color}`} />
      case 'DollarSign':
        return <DollarSign className={`h-6 w-6 ${iconInfo.color}`} />
      case 'Award':
        return <Award className={`h-6 w-6 ${iconInfo.color}`} />
      default:
        return <CreditCard className='h-6 w-6 text-gray-500' />
    }
  }

  // Print receipt
  const printReceipt = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('Không thể mở cửa sổ in. Vui lòng kiểm tra trình duyệt của bạn.')
      return
    }

    const formattedDate = format(new Date(transaction.created_at), 'HH:mm:ss, dd/MM/yyyy', { locale: vi })
    const amountFormatted = formatAmount(transaction.amount, transaction.type)

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Biên lai giao dịch - VinBet</title>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              margin-bottom: 5px;
              color: #1a1a1a;
            }
            .header p {
              color: #666;
              margin-top: 0;
            }
            .receipt-info {
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 20px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              padding-bottom: 10px;
              border-bottom: 1px solid #eee;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .label {
              font-weight: bold;
              color: #555;
            }
            .amount {
              font-size: 24px;
              font-weight: bold;
              text-align: center;
              margin: 20px 0;
              color: ${getAmountColor(transaction.type).includes('green') ? 'green' : 'red'};
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              color: #999;
              font-size: 12px;
            }
            @media print {
              body {
                padding: 0;
              }
              button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>VinBet</h1>
            <p>Biên lai giao dịch</p>
          </div>
          
          <div class="amount">
            ${amountFormatted}
          </div>
          
          <div class="receipt-info">
            <div class="info-row">
              <span class="label">Loại giao dịch:</span>
              <span>${formatTransactionType(transaction.type)}</span>
            </div>
            <div class="info-row">
              <span class="label">Mã giao dịch:</span>
              <span>${transaction.id}</span>
            </div>
            <div class="info-row">
              <span class="label">Thời gian:</span>
              <span>${formattedDate}</span>
            </div>
            <div class="info-row">
              <span class="label">Trạng thái:</span>
              <span>${formatTransactionStatus(transaction.status)}</span>
            </div>
            ${
              transaction.reference_id
                ? `<div class="info-row">
                    <span class="label">Mã tham chiếu:</span>
                    <span>${transaction.reference_id}</span>
                   </div>`
                : ''
            }
            ${
              transaction.description
                ? `<div class="info-row">
                    <span class="label">Mô tả:</span>
                    <span>${transaction.description}</span>
                   </div>`
                : ''
            }
          </div>
          
          <div class="footer">
            <p>Cảm ơn bạn đã sử dụng dịch vụ của VinBet.</p>
            <p>Biên lai này được tạo tự động và có giá trị chứng minh giao dịch.</p>
            <p>Ngày in: ${new Date().toLocaleString('vi-VN')}</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `)

    printWindow.document.close()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader className='flex flex-col items-center text-center'>
          <div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2'>
            {getTransactionTypeIcon()}
          </div>
          <DialogTitle className='text-xl'>Chi tiết giao dịch</DialogTitle>
          <DialogDescription>
            {formatTransactionType(transaction.type)} - #{transaction.id.substring(0, 8)}
          </DialogDescription>

          <div className='mt-4'>{formatAmount(transaction.amount, transaction.type)}</div>
          <div className='mt-1'>
            <Badge
              variant='outline'
              className={
                transaction.status === 'completed'
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : transaction.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                  : transaction.status === 'failed'
                  ? 'bg-red-100 text-red-800 border-red-200'
                  : 'bg-gray-100 text-gray-800 border-gray-200'
              }
            >
              {formatTransactionStatus(transaction.status)}
            </Badge>
          </div>
        </DialogHeader>

        <div className='space-y-4 mt-4'>
          <div className='space-y-3'>
            <div className='flex items-center justify-between text-sm'>
              <div className='flex items-center gap-2 text-muted-foreground'>
                <Calendar className='h-4 w-4' />
                <span>Ngày giao dịch:</span>
              </div>
              <span className='font-medium'>
                {format(new Date(transaction.created_at), 'dd/MM/yyyy', {
                  locale: vi
                })}
              </span>
            </div>

            <div className='flex items-center justify-between text-sm'>
              <div className='flex items-center gap-2 text-muted-foreground'>
                <Clock className='h-4 w-4' />
                <span>Thời gian:</span>
              </div>
              <span className='font-medium'>
                {format(new Date(transaction.created_at), 'HH:mm:ss', {
                  locale: vi
                })}
              </span>
            </div>

            <div className='flex items-center justify-between text-sm'>
              <div className='flex items-center gap-2 text-muted-foreground'>
                <Tag className='h-4 w-4' />
                <span>Loại giao dịch:</span>
              </div>
              <span className='font-medium'>{formatTransactionType(transaction.type)}</span>
            </div>

            <div className='flex items-center justify-between text-sm'>
              <div className='flex items-center gap-2 text-muted-foreground'>
                <Hash className='h-4 w-4' />
                <span>Mã giao dịch:</span>
              </div>
              <div className='flex items-center gap-1'>
                <code className='text-xs bg-muted px-1 py-0.5 rounded'>{transaction.id.substring(0, 12)}...</code>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-6 w-6'
                  onClick={() => copyToClipboard(transaction.id, 'Đã sao chép mã giao dịch')}
                >
                  <CopyIcon className='h-3 w-3' />
                </Button>
              </div>
            </div>

            {transaction.reference_id && (
              <div className='flex items-center justify-between text-sm'>
                <div className='flex items-center gap-2 text-muted-foreground'>
                  <Link2Icon className='h-4 w-4' />
                  <span>Mã tham chiếu:</span>
                </div>
                <div className='flex items-center gap-1'>
                  <code className='text-xs bg-muted px-1 py-0.5 rounded'>
                    {transaction.reference_id.substring(0, 12)}...
                  </code>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6'
                    onClick={() => copyToClipboard(transaction.reference_id, 'Đã sao chép mã tham chiếu')}
                  >
                    <CopyIcon className='h-3 w-3' />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {transaction.description && (
            <div className='space-y-2'>
              <h3 className='text-sm font-medium'>Mô tả</h3>
              <p className='text-sm text-muted-foreground'>{transaction.description}</p>
            </div>
          )}
        </div>

        <DialogFooter className='flex-col sm:flex-row gap-2 mt-4'>
          <Button variant='outline' size='sm' className='gap-2' onClick={printReceipt}>
            <PrinterIcon className='h-4 w-4' /> In biên lai
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='gap-2'
            onClick={() =>
              copyToClipboard(
                `VinBet - ${formatTransactionType(transaction.type)} - ${format(
                  new Date(transaction.created_at),
                  'dd/MM/yyyy HH:mm',
                  {
                    locale: vi
                  }
                )} - ${formatCurrency(transaction.amount)} - Mã GD: ${transaction.id}`,
                'Đã sao chép thông tin giao dịch'
              )
            }
          >
            <FileText className='h-4 w-4' /> Sao chép
          </Button>
          <Button size='sm' className='gap-2' onClick={onClose}>
            <Check className='h-4 w-4' /> Xong
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
