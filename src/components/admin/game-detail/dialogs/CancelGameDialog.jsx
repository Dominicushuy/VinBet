// src/components/admin/game-detail/dialogs/CancelGameDialog.jsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { RefreshCw } from 'lucide-react'
import { formatCurrency } from '@/utils/formatUtils'

export function CancelGameDialog({ open, onClose, onConfirm, isLoading, game, betStats }) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận hủy lượt chơi</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn hủy lượt chơi này? Tất cả các cược sẽ được hoàn tiền.
            {betStats.total_bets > 0 && (
              <p className='mt-2 font-medium'>
                Có {betStats.total_bets} lượt cược với tổng số tiền {formatCurrency(betStats.total_bet_amount)} sẽ được
                hoàn trả.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Không, giữ nguyên</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className='bg-red-600 hover:bg-red-700'>
            {isLoading ? (
              <>
                <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                Đang xử lý...
              </>
            ) : (
              'Có, hủy lượt chơi'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
