// src/components/admin/payment-request/detail/PaymentRequestTimeline.jsx
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { History, FileText, ImageIcon, CheckCircle, XCircle, Clock } from 'lucide-react'
import { formatCurrency } from '@/utils/formatUtils'

export function PaymentRequestTimeline({ request }) {
  return (
    <div className='space-y-6'>
      <div className='flex items-center space-x-2'>
        <History className='h-5 w-5 text-blue-500' />
        <h3 className='font-medium'>Lịch sử xử lý</h3>
      </div>

      <div className='relative border-l-2 pl-6 ml-3 space-y-6'>
        {/* Điểm thời gian: Tạo yêu cầu */}
        <TimelineItem
          icon={<FileText className='h-3 w-3' />}
          title='Yêu cầu được tạo'
          time={request.created_at}
          color='blue'
          content={`${request.type === 'deposit' ? 'Yêu cầu nạp tiền' : 'Yêu cầu rút tiền'} ${formatCurrency(
            request.amount
          )} được tạo bởi người dùng ${request.profiles?.display_name || request.profiles?.username}.`}
        />

        {/* Điểm thời gian: Tải lên bằng chứng (nếu có) */}
        {request.type === 'deposit' && request.proof_url && (
          <TimelineItem
            icon={<ImageIcon className='h-3 w-3' />}
            title='Bằng chứng thanh toán được tải lên'
            time={request.updated_at}
            color='purple'
            content='Người dùng đã tải lên bằng chứng thanh toán cho yêu cầu nạp tiền.'
          />
        )}

        {/* Điểm thời gian: Phê duyệt hoặc từ chối */}
        {(request.status === 'approved' || request.status === 'rejected') && (
          <TimelineItem
            icon={request.status === 'approved' ? <CheckCircle className='h-3 w-3' /> : <XCircle className='h-3 w-3' />}
            title={`Yêu cầu ${request.status === 'approved' ? 'được phê duyệt' : 'bị từ chối'}`}
            time={request.approved_at || request.updated_at}
            color={request.status === 'approved' ? 'green' : 'red'}
            content={
              <>
                {request.status === 'approved'
                  ? `Yêu cầu đã được phê duyệt bởi ${
                      request.approved_by_profile?.display_name || request.approved_by_profile?.username || 'Admin'
                    }`
                  : `Yêu cầu đã bị từ chối bởi ${
                      request.approved_by_profile?.display_name || request.approved_by_profile?.username || 'Admin'
                    }`}
                {request.notes && <div className='mt-1 font-medium'>Ghi chú: {request.notes}</div>}
              </>
            }
          />
        )}

        {/* Điểm thời gian hiện tại nếu vẫn đang xử lý */}
        {request.status === 'pending' && (
          <TimelineItem
            icon={<Clock className='h-3 w-3' />}
            title='Đang chờ xử lý'
            time={new Date()}
            color='yellow'
            content='Yêu cầu đang chờ admin xem xét và xử lý.'
          />
        )}
      </div>
    </div>
  )
}

// Component cho từng mục trong timeline
function TimelineItem({ icon, title, time, color, content }) {
  return (
    <div className='relative'>
      <div
        className={`absolute -left-[30px] flex items-center justify-center w-6 h-6 rounded-full bg-${color}-100 text-${color}-600 border-2 border-white`}
      >
        {icon}
      </div>
      <div className='space-y-1'>
        <div className='font-medium'>{title}</div>
        <div className='text-sm text-muted-foreground'>
          {format(new Date(time), 'HH:mm:ss, dd/MM/yyyy', { locale: vi })}
        </div>
        <div className={`text-sm ${color === 'blue' ? 'bg-muted/50' : `bg-${color}-50`} p-2 rounded-md`}>{content}</div>
      </div>
    </div>
  )
}
