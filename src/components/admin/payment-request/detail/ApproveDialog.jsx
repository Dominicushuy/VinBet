// src/components/admin/payment-request/detail/ApproveDialog.jsx
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { formatCurrency } from '@/utils/formatUtils'

export function ApproveDialog({ open, onOpenChange, request, notes, onNotesChange, onConfirm, isLoading }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận phê duyệt</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn phê duyệt yêu cầu {request.type === 'deposit' ? 'nạp' : 'rút'} tiền này? Số tiền{' '}
            {formatCurrency(request.amount)} sẽ {request.type === 'deposit' ? 'được cộng vào' : 'bị trừ từ'}
            tài khoản của người dùng.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className='py-4'>
          <Label>Ghi chú (không bắt buộc)</Label>
          <Textarea
            placeholder='Nhập ghi chú cho người dùng'
            className='mt-1'
            value={notes}
            onChange={e => onNotesChange(e.target.value)}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isLoading} className='bg-green-600 hover:bg-green-700'>
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Đang xử lý...
              </>
            ) : (
              'Phê duyệt'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
