// src/components/admin/payment-request/detail/RejectDialog.jsx
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

export function RejectDialog({ open, onOpenChange, request, notes, onNotesChange, onConfirm, isLoading }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận từ chối</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn từ chối yêu cầu {request.type === 'deposit' ? 'nạp' : 'rút'} tiền này?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className='py-4'>
          <Label>
            Lý do từ chối <span className='text-red-500'>*</span>
          </Label>
          <Textarea
            placeholder='Nhập lý do từ chối cho người dùng'
            className='mt-1'
            value={notes}
            onChange={e => onNotesChange(e.target.value)}
            required
          />
          {notes.trim() === '' && <p className='text-sm text-red-500 mt-1'>Vui lòng nhập lý do từ chối</p>}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading || notes.trim() === ''}
            className='bg-destructive hover:bg-destructive/90'
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Đang xử lý...
              </>
            ) : (
              'Từ chối'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
