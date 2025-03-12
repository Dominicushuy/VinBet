// src/components/admin/payment-request/detail/index.jsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useProcessPaymentRequestMutation } from '@/hooks/queries/useAdminQueries'
import { useToast } from '@/hooks/useToast'
import { Zoom } from 'yet-another-react-lightbox/plugins'
import LightboxComponent from '@/components/ui/lightbox'

// Import các sub-components
import { PaymentRequestHeader } from './detail/PaymentRequestHeader'
import { PaymentUserInfo } from './detail/PaymentUserInfo'
import { PaymentRequestActions } from './detail/PaymentRequestActions'
import { PaymentRequestInfo } from './detail/PaymentRequestInfo'
import { PaymentMethodInfo } from './detail/PaymentMethodInfo'
import { PaymentApprovalInfo } from './detail/PaymentApprovalInfo'
import { PaymentProofSection } from './detail/PaymentProofSection'
import { PaymentRequestTimeline } from './detail/PaymentRequestTimeline'
import { ApproveDialog } from './detail/ApproveDialog'
import { RejectDialog } from './detail/RejectDialog'

export function PaymentRequestDetail({ request, onClose, onSuccess }) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('details')
  const [adminNotes, setAdminNotes] = useState('')
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [isImageOpen, setIsImageOpen] = useState(false)

  const processMutation = useProcessPaymentRequestMutation()

  const confirmApprove = async () => {
    try {
      await processMutation.mutateAsync({
        id: request.id,
        action: 'approve',
        data: { notes: adminNotes }
      })
      onSuccess?.()
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
      await processMutation.mutateAsync({
        id: request.id,
        action: 'reject',
        data: { notes: adminNotes }
      })
      onSuccess?.()
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

  const handleViewUser = () => {
    router.push(`/admin/users/${request.profile_id}`)
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
            {/* Cột bên trái - Thông tin cơ bản */}
            <div className='col-span-1 space-y-4'>
              <PaymentRequestHeader request={request} />
              <PaymentUserInfo request={request} onViewUser={handleViewUser} />

              {/* Hiển thị nút phê duyệt/từ chối cho yêu cầu đang xử lý */}
              {request.status === 'pending' && (
                <PaymentRequestActions
                  onApprove={() => setApproveDialogOpen(true)}
                  onReject={() => setRejectDialogOpen(true)}
                />
              )}
            </div>

            {/* Cột bên phải - Chi tiết giao dịch */}
            <div className='col-span-2 space-y-6'>
              <PaymentRequestInfo request={request} />

              <PaymentMethodInfo request={request} />

              {(request.status === 'approved' || request.status === 'rejected') && (
                <PaymentApprovalInfo request={request} />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value='proof' className='mt-4'>
          <PaymentProofSection
            request={request}
            onImageOpen={() => setIsImageOpen(true)}
            onApprove={() => setApproveDialogOpen(true)}
            onReject={() => setRejectDialogOpen(true)}
          />
        </TabsContent>

        <TabsContent value='history' className='mt-4'>
          <PaymentRequestTimeline request={request} />
        </TabsContent>
      </Tabs>

      {/* Dialog phê duyệt */}
      <ApproveDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        request={request}
        notes={adminNotes}
        onNotesChange={setAdminNotes}
        onConfirm={confirmApprove}
        isLoading={processMutation.isLoading}
      />

      {/* Dialog từ chối */}
      <RejectDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        request={request}
        notes={adminNotes}
        onNotesChange={setAdminNotes}
        onConfirm={confirmReject}
        isLoading={processMutation.isLoading}
      />

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
