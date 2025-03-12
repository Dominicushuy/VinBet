// src/components/admin/payment-request/detail/PaymentProofSection.jsx
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, ImageIcon, Eye, XCircle, CheckCircle } from 'lucide-react'

export function PaymentProofSection({ request, onImageOpen, onApprove, onReject }) {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <ImageIcon className='h-5 w-5 text-blue-500' />
          <h3 className='font-medium'>Bằng chứng thanh toán</h3>
        </div>
        {request.type === 'deposit' && (
          <Badge variant={request.proof_url ? 'outline' : 'destructive'}>
            {request.proof_url ? 'Đã tải lên' : 'Chưa tải lên'}
          </Badge>
        )}
      </div>

      {request.type === 'withdrawal' ? (
        <div className='bg-yellow-50 border border-yellow-200 rounded-md p-4'>
          <div className='flex items-center space-x-2'>
            <AlertTriangle className='h-5 w-5 text-yellow-500' />
            <p className='font-medium text-yellow-800'>Không yêu cầu bằng chứng</p>
          </div>
          <p className='text-sm text-yellow-700 mt-1'>
            Yêu cầu rút tiền không yêu cầu tải lên bằng chứng thanh toán. Admin cần xác nhận thông tin và xử lý theo quy
            trình nội bộ.
          </p>
        </div>
      ) : request.proof_url ? (
        <div className='space-y-4'>
          <div className='border rounded-lg overflow-hidden hover:shadow-md transition-shadow'>
            <div className='flex flex-col items-center justify-center'>
              <div className='relative w-full max-h-[400px] overflow-hidden'>
                <img
                  src={request.proof_url}
                  alt='Bằng chứng thanh toán'
                  className='w-full object-contain cursor-pointer'
                  onClick={onImageOpen}
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center'>
                  <Button variant='outline' className='bg-white/80' onClick={onImageOpen}>
                    <Eye className='h-4 w-4 mr-2' />
                    Phóng to
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className='bg-muted/50 p-4 rounded-md'>
            <div className='text-sm font-medium mb-2'>Hướng dẫn xác minh bằng chứng:</div>
            <ul className='list-disc list-inside space-y-1 text-sm'>
              <li>Kiểm tra tên người gửi có khớp với tên tài khoản người dùng</li>
              <li>Xác nhận số tiền chuyển khoản đúng với số tiền yêu cầu nạp</li>
              <li>Kiểm tra thời gian giao dịch hợp lý</li>
              <li>Đảm bảo nội dung giao dịch (nếu có) chính xác</li>
              <li>Xác minh các chi tiết thanh toán khớp với thông tin đã đăng ký</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className='bg-red-50 border border-red-200 rounded-md p-4'>
          <div className='flex items-center space-x-2'>
            <AlertTriangle className='h-5 w-5 text-red-500' />
            <p className='font-medium text-red-800'>Chưa tải lên bằng chứng</p>
          </div>
          <p className='text-sm text-red-700 mt-1'>
            Người dùng chưa tải lên bằng chứng thanh toán cho yêu cầu nạp tiền này. Bạn có thể từ chối yêu cầu này hoặc
            liên hệ với người dùng để yêu cầu bổ sung.
          </p>
        </div>
      )}

      {request.status === 'pending' && (
        <div className='flex justify-end space-x-3 mt-4'>
          <Button variant='outline' className='text-red-600 border-red-200 hover:bg-red-50' onClick={onReject}>
            <XCircle className='mr-2 h-4 w-4' />
            Từ chối
          </Button>

          <Button
            className='bg-green-600 hover:bg-green-700'
            onClick={onApprove}
            disabled={request.type === 'deposit' && !request.proof_url}
          >
            <CheckCircle className='mr-2 h-4 w-4' />
            Phê duyệt
          </Button>
        </div>
      )}
    </div>
  )
}
