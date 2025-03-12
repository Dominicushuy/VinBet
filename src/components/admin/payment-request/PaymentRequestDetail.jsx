// src/components/admin/PaymentRequestDetail.js
'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { useProcessPaymentRequestMutation } from '@/hooks/queries/useAdminQueries'
import { useRouter } from 'next/navigation'
import {
  Clock,
  FileText,
  CreditCard,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  BadgeCheck,
  ShieldAlert,
  Image as ImageIcon,
  UserCircle,
  History
} from 'lucide-react'
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
import { Zoom } from 'yet-another-react-lightbox/plugins'
import LightboxComponent from '@/components/ui/lightbox'
import { useToast } from '@/hooks/useToast'

export function PaymentRequestDetail({ request, onClose, onSuccess }) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('details')
  const [adminNotes, setAdminNotes] = useState('')
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [isImageOpen, setIsImageOpen] = useState(false)

  const approveMutation = useProcessPaymentRequestMutation('approve')
  const rejectMutation = useProcessPaymentRequestMutation('reject')

  const formatMoney = amount => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const confirmApprove = async () => {
    try {
      await approveMutation.mutateAsync({
        id: request.id,
        notes: adminNotes
      })
      onSuccess()
      toast({
        title: 'Yêu cầu đã được phê duyệt',
        description: 'Yêu cầu thanh toán đã được phê duyệt thành công'
      })
    } catch (error) {
      console.error('Error approving payment:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể phê duyệt yêu cầu thanh toán',
        variant: 'destructive'
      })
    }
  }

  const confirmReject = async () => {
    if (!adminNotes.trim()) {
      toast({
        title: 'Cần ghi chú',
        description: 'Vui lòng nhập lý do từ chối yêu cầu',
        variant: 'destructive'
      })
      return
    }

    try {
      await rejectMutation.mutateAsync({
        id: request.id,
        notes: adminNotes
      })
      onSuccess()
      toast({
        title: 'Yêu cầu đã bị từ chối',
        description: 'Yêu cầu thanh toán đã bị từ chối'
      })
    } catch (error) {
      console.error('Error rejecting payment:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể từ chối yêu cầu thanh toán',
        variant: 'destructive'
      })
    }
  }

  // Format the payment details
  const formatPaymentDetails = details => {
    if (!details) return 'Không có thông tin'

    try {
      const detailsObj = typeof details === 'string' ? JSON.parse(details) : details

      return (
        <div className='space-y-2'>
          {Object.entries(detailsObj).map(([key, value]) => (
            <div key={key} className='grid grid-cols-3 gap-2'>
              <span className='font-medium'>{formatDetailKey(key)}:</span>
              <span className='col-span-2'>{value}</span>
            </div>
          ))}
        </div>
      )
    } catch (e) {
      return 'Định dạng không hợp lệ'
    }
  }

  const formatDetailKey = key => {
    const mapping = {
      accountNumber: 'Số tài khoản',
      accountName: 'Tên tài khoản',
      bankName: 'Ngân hàng',
      branch: 'Chi nhánh',
      phoneNumber: 'Số điện thoại',
      cardNumber: 'Số thẻ',
      cardHolder: 'Chủ thẻ',
      expiryDate: 'Ngày hết hạn'
    }

    return mapping[key] || key
  }

  const renderActivityIcon = () => {
    if (request.type === 'deposit') {
      return <ArrowUpRight className='h-5 w-5 text-green-500' />
    } else {
      return <ArrowDownRight className='h-5 w-5 text-red-500' />
    }
  }

  const renderStatusIcon = () => {
    switch (request.status) {
      case 'approved':
        return <BadgeCheck className='h-5 w-5 text-green-500' />
      case 'rejected':
        return <ShieldAlert className='h-5 w-5 text-red-500' />
      case 'pending':
        return <Clock className='h-5 w-5 text-yellow-500' />
      default:
        return <AlertTriangle className='h-5 w-5 text-gray-500' />
    }
  }

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid grid-cols-3'>
          <TabsTrigger value='details'>Chi tiết</TabsTrigger>
          <TabsTrigger value='proof'>Bằng chứng</TabsTrigger>
          <TabsTrigger value='history'>Lịch sử</TabsTrigger>
        </TabsList>

        <TabsContent value='details' className='mt-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {/* Thông tin cơ bản */}
            <div className='col-span-1 space-y-4'>
              <div className='bg-muted p-4 rounded-lg'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center space-x-2'>
                    {renderActivityIcon()}
                    <h3 className='font-medium'>{request.type === 'deposit' ? 'Nạp tiền' : 'Rút tiền'}</h3>
                  </div>
                  <Badge
                    className={
                      request.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : request.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {request.status === 'approved'
                      ? 'Đã duyệt'
                      : request.status === 'rejected'
                      ? 'Từ chối'
                      : 'Đang xử lý'}
                  </Badge>
                </div>

                <div className='flex flex-col'>
                  <span className='text-sm text-muted-foreground'>Số tiền</span>
                  <span className='text-2xl font-bold'>{formatMoney(request.amount)}</span>
                </div>

                <div className='flex items-center space-x-1 text-sm text-muted-foreground mt-1'>
                  <Clock className='h-3.5 w-3.5' />
                  <span>{format(new Date(request.created_at), 'HH:mm:ss, dd/MM/yyyy', { locale: vi })}</span>
                </div>
              </div>

              <div className='space-y-4'>
                <div className='flex items-center space-x-2'>
                  <UserCircle className='h-5 w-5 text-blue-500' />
                  <h3 className='font-medium'>Thông tin người dùng</h3>
                </div>

                <div className='flex items-center space-x-3'>
                  <Avatar className='h-10 w-10'>
                    <AvatarImage src={request.profiles?.avatar_url} />
                    <AvatarFallback>
                      {(request.profiles?.display_name || request.profiles?.username || 'U')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <div className='font-medium'>{request.profiles?.display_name || request.profiles?.username}</div>
                    <div className='text-sm text-muted-foreground'>{request.profiles?.email}</div>
                  </div>
                </div>

                <Button
                  variant='outline'
                  size='sm'
                  className='w-full'
                  onClick={() => router.push(`/admin/users/${request.profile_id}`)}
                >
                  <UserCircle className='mr-2 h-4 w-4' />
                  Xem hồ sơ người dùng
                </Button>
              </div>

              {/* Hiển thị nút phê duyệt/từ chối cho yêu cầu đang xử lý */}
              {request.status === 'pending' && (
                <div className='space-y-3 pt-2'>
                  <Button className='w-full bg-green-600 hover:bg-green-700' onClick={() => setApproveDialogOpen(true)}>
                    <CheckCircle className='mr-2 h-4 w-4' />
                    Phê duyệt yêu cầu
                  </Button>

                  <Button
                    variant='outline'
                    className='w-full text-red-600 border-red-200 hover:bg-red-50'
                    onClick={() => setRejectDialogOpen(true)}
                  >
                    <XCircle className='mr-2 h-4 w-4' />
                    Từ chối yêu cầu
                  </Button>
                </div>
              )}
            </div>

            {/* Chi tiết giao dịch */}
            <div className='col-span-2 space-y-6'>
              <div className='space-y-4'>
                <div className='flex items-center space-x-2'>
                  <FileText className='h-5 w-5 text-purple-500' />
                  <h3 className='font-medium'>Thông tin chi tiết</h3>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='bg-muted/50 p-3 rounded-md space-y-2'>
                    <div className='text-sm text-muted-foreground'>ID Yêu cầu</div>
                    <div className='text-sm font-mono break-all'>{request.id}</div>
                  </div>

                  <div className='bg-muted/50 p-3 rounded-md space-y-2'>
                    <div className='text-sm text-muted-foreground'>Trạng thái</div>
                    <div className='flex items-center space-x-2'>
                      {renderStatusIcon()}
                      <span className='font-medium'>
                        {request.status === 'approved'
                          ? 'Đã duyệt'
                          : request.status === 'rejected'
                          ? 'Từ chối'
                          : 'Đang xử lý'}
                      </span>
                    </div>
                  </div>

                  <div className='bg-muted/50 p-3 rounded-md space-y-2'>
                    <div className='text-sm text-muted-foreground'>Thời gian tạo</div>
                    <div>{format(new Date(request.created_at), 'HH:mm:ss, dd/MM/yyyy', { locale: vi })}</div>
                  </div>

                  <div className='bg-muted/50 p-3 rounded-md space-y-2'>
                    <div className='text-sm text-muted-foreground'>Thời gian cập nhật</div>
                    <div>{format(new Date(request.updated_at), 'HH:mm:ss, dd/MM/yyyy', { locale: vi })}</div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className='space-y-4'>
                <div className='flex items-center space-x-2'>
                  <CreditCard className='h-5 w-5 text-indigo-500' />
                  <h3 className='font-medium'>Phương thức thanh toán</h3>
                </div>

                <div className='grid gap-3'>
                  <div className='bg-muted/50 p-3 rounded-md space-y-2'>
                    <div className='text-sm text-muted-foreground'>Phương thức</div>
                    <div className='font-medium'>
                      {request.payment_method === 'bank_transfer'
                        ? 'Chuyển khoản ngân hàng'
                        : request.payment_method === 'momo'
                        ? 'Ví điện tử MoMo'
                        : request.payment_method === 'zalopay'
                        ? 'Ví điện tử ZaloPay'
                        : request.payment_method === 'card'
                        ? 'Thẻ tín dụng/ghi nợ'
                        : request.payment_method}
                    </div>
                  </div>

                  <div className='bg-muted/50 p-3 rounded-md space-y-2'>
                    <div className='text-sm text-muted-foreground'>Chi tiết thanh toán</div>
                    <div className='text-sm'>{formatPaymentDetails(request.payment_details)}</div>
                  </div>
                </div>
              </div>

              {(request.status === 'approved' || request.status === 'rejected') && (
                <>
                  <Separator />

                  <div className='space-y-4'>
                    <div className='flex items-center space-x-2'>
                      {request.status === 'approved' ? (
                        <CheckCircle className='h-5 w-5 text-green-500' />
                      ) : (
                        <XCircle className='h-5 w-5 text-red-500' />
                      )}
                      <h3 className='font-medium'>
                        {request.status === 'approved' ? 'Thông tin phê duyệt' : 'Lý do từ chối'}
                      </h3>
                    </div>

                    <div className='grid gap-3'>
                      {request.approved_by && (
                        <div className='bg-muted/50 p-3 rounded-md space-y-2'>
                          <div className='text-sm text-muted-foreground'>Admin xử lý</div>
                          <div>
                            {request.approved_by_profile?.display_name ||
                              request.approved_by_profile?.username ||
                              'Admin'}
                          </div>
                        </div>
                      )}

                      {request.approved_at && (
                        <div className='bg-muted/50 p-3 rounded-md space-y-2'>
                          <div className='text-sm text-muted-foreground'>Thời gian xử lý</div>
                          <div>{format(new Date(request.approved_at), 'HH:mm:ss, dd/MM/yyyy', { locale: vi })}</div>
                        </div>
                      )}

                      {request.notes && (
                        <div className='bg-muted/50 p-3 rounded-md space-y-2'>
                          <div className='text-sm text-muted-foreground'>Ghi chú</div>
                          <div>{request.notes}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value='proof' className='mt-4'>
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
                  Yêu cầu rút tiền không yêu cầu tải lên bằng chứng thanh toán. Admin cần xác nhận thông tin và xử lý
                  theo quy trình nội bộ.
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
                        onClick={() => setIsImageOpen(true)}
                      />
                      <div className='absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center'>
                        <Button variant='outline' className='bg-white/80' onClick={() => setIsImageOpen(true)}>
                          <ImageIcon className='h-4 w-4 mr-2' />
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
                  Người dùng chưa tải lên bằng chứng thanh toán cho yêu cầu nạp tiền này. Bạn có thể từ chối yêu cầu này
                  hoặc liên hệ với người dùng để yêu cầu bổ sung.
                </p>
              </div>
            )}

            {request.status === 'pending' && (
              <div className='flex justify-end space-x-3 mt-4'>
                <Button
                  variant='outline'
                  className='text-red-600 border-red-200 hover:bg-red-50'
                  onClick={() => setRejectDialogOpen(true)}
                >
                  <XCircle className='mr-2 h-4 w-4' />
                  Từ chối
                </Button>

                <Button
                  className='bg-green-600 hover:bg-green-700'
                  onClick={() => setApproveDialogOpen(true)}
                  disabled={request.type === 'deposit' && !request.proof_url}
                >
                  <CheckCircle className='mr-2 h-4 w-4' />
                  Phê duyệt
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value='history' className='mt-4'>
          <div className='space-y-6'>
            <div className='flex items-center space-x-2'>
              <History className='h-5 w-5 text-blue-500' />
              <h3 className='font-medium'>Lịch sử xử lý</h3>
            </div>

            <div className='relative border-l-2 pl-6 ml-3 space-y-6'>
              {/* Điểm thời gian: Tạo yêu cầu */}
              <div className='relative'>
                <div className='absolute -left-[30px] flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 border-2 border-white'>
                  <FileText className='h-3 w-3' />
                </div>
                <div className='space-y-1'>
                  <div className='font-medium'>Yêu cầu được tạo</div>
                  <div className='text-sm text-muted-foreground'>
                    {format(new Date(request.created_at), 'HH:mm:ss, dd/MM/yyyy', { locale: vi })}
                  </div>
                  <div className='text-sm bg-muted/50 p-2 rounded-md'>
                    {request.type === 'deposit' ? 'Yêu cầu nạp tiền' : 'Yêu cầu rút tiền'} {formatMoney(request.amount)}{' '}
                    được tạo bởi người dùng {request.profiles?.display_name || request.profiles?.username}.
                  </div>
                </div>
              </div>

              {/* Điểm thời gian: Tải lên bằng chứng (nếu có) */}
              {request.type === 'deposit' && request.proof_url && (
                <div className='relative'>
                  <div className='absolute -left-[30px] flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-600 border-2 border-white'>
                    <ImageIcon className='h-3 w-3' />
                  </div>
                  <div className='space-y-1'>
                    <div className='font-medium'>Bằng chứng thanh toán được tải lên</div>
                    <div className='text-sm text-muted-foreground'>
                      {format(new Date(request.updated_at), 'HH:mm:ss, dd/MM/yyyy', { locale: vi })}
                    </div>
                    <div className='text-sm bg-muted/50 p-2 rounded-md'>
                      Người dùng đã tải lên bằng chứng thanh toán cho yêu cầu nạp tiền.
                    </div>
                  </div>
                </div>
              )}

              {/* Điểm thời gian: Phê duyệt hoặc từ chối */}
              {(request.status === 'approved' || request.status === 'rejected') && (
                <div className='relative'>
                  <div
                    className={`absolute -left-[30px] flex items-center justify-center w-6 h-6 rounded-full ${
                      request.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    } border-2 border-white`}
                  >
                    {request.status === 'approved' ? (
                      <CheckCircle className='h-3 w-3' />
                    ) : (
                      <XCircle className='h-3 w-3' />
                    )}
                  </div>
                  <div className='space-y-1'>
                    <div className='font-medium'>
                      Yêu cầu {request.status === 'approved' ? 'được phê duyệt' : 'bị từ chối'}
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      {request.approved_at
                        ? format(new Date(request.approved_at), 'HH:mm:ss, dd/MM/yyyy', { locale: vi })
                        : format(new Date(request.updated_at), 'HH:mm:ss, dd/MM/yyyy', { locale: vi })}
                    </div>
                    <div
                      className={`text-sm p-2 rounded-md ${
                        request.status === 'approved' ? 'bg-green-50' : 'bg-red-50'
                      }`}
                    >
                      {request.status === 'approved'
                        ? `Yêu cầu đã được phê duyệt bởi ${
                            request.approved_by_profile?.display_name ||
                            request.approved_by_profile?.username ||
                            'Admin'
                          }`
                        : `Yêu cầu đã bị từ chối bởi ${
                            request.approved_by_profile?.display_name ||
                            request.approved_by_profile?.username ||
                            'Admin'
                          }`}
                      {request.notes && <div className='mt-1 font-medium'>Ghi chú: {request.notes}</div>}
                    </div>
                  </div>
                </div>
              )}

              {/* Điểm thời gian hiện tại nếu vẫn đang xử lý */}
              {request.status === 'pending' && (
                <div className='relative'>
                  <div className='absolute -left-[30px] flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-600 border-2 border-white'>
                    <Clock className='h-3 w-3' />
                  </div>
                  <div className='space-y-1'>
                    <div className='font-medium'>Đang chờ xử lý</div>
                    <div className='text-sm text-muted-foreground'>
                      {format(new Date(), 'HH:mm:ss, dd/MM/yyyy', { locale: vi })}
                    </div>
                    <div className='text-sm bg-yellow-50 p-2 rounded-md'>Yêu cầu đang chờ admin xem xét và xử lý.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Approve Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận phê duyệt</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn phê duyệt yêu cầu {request.type === 'deposit' ? 'nạp' : 'rút'} tiền này? Số tiền{' '}
              {formatMoney(request.amount)} sẽ {request.type === 'deposit' ? 'được cộng vào' : 'bị trừ từ'} tài khoản
              của người dùng.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className='py-4'>
            <Label>Ghi chú (không bắt buộc)</Label>
            <Textarea
              placeholder='Nhập ghi chú cho người dùng'
              className='mt-1'
              value={adminNotes}
              onChange={e => setAdminNotes(e.target.value)}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmApprove}
              disabled={approveMutation.isLoading}
              className='bg-green-600 hover:bg-green-700'
            >
              {approveMutation.isLoading ? (
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

      {/* Reject Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
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
              value={adminNotes}
              onChange={e => setAdminNotes(e.target.value)}
              required
            />
            {adminNotes.trim() === '' && <p className='text-sm text-red-500 mt-1'>Vui lòng nhập lý do từ chối</p>}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReject}
              disabled={rejectMutation.isLoading || adminNotes.trim() === ''}
              className='bg-destructive hover:bg-destructive/90'
            >
              {rejectMutation.isLoading ? (
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

      {/* Image Lightbox */}
      {request.proof_url && (
        <LightboxComponent
          open={isImageOpen}
          close={() => setIsImageOpen(false)}
          slides={[{ src: request.proof_url }]}
          plugins={[Zoom]}
        />
      )}
    </>
  )
}
