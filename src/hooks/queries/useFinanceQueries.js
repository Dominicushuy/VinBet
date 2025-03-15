// src/hooks/queries/useFinanceQueries.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { fetchData, postData, buildQueryString } from '@/utils/fetchUtils'
import { AUTH_QUERY_KEYS } from './useAuthQueries'
import { useRouter } from 'next/navigation'
import { getBrowserInfo } from '@/utils/getBrowserInfo'

// Query keys
export const FINANCE_QUERY_KEYS = {
  paymentRequests: params => ['payment-requests', { ...params }],
  paymentRequest: id => ['payment-request', id],
  withdrawalRequests: params => ['withdrawal-requests', { ...params }],
  withdrawalRequest: id => ['withdrawal-request', id]
}

// API functions
const financeApi = {
  // Tạo yêu cầu nạp tiền
  createPaymentRequest: async data => {
    return postData('/api/payment-requests', data)
  },

  // Upload bằng chứng thanh toán (special case - uses FormData)
  uploadPaymentProof: async (requestId, file) => {
    const formData = new FormData()
    formData.append('proof', file)
    formData.append('requestId', requestId)

    const response = await fetch('/api/payment-requests/upload-proof', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Không thể upload bằng chứng thanh toán')
    }

    return response.json()
  },

  // Lấy danh sách yêu cầu nạp/rút tiền
  getPaymentRequests: async params => {
    const queryString = buildQueryString({
      type: params?.type,
      status: params?.status,
      page: params?.page,
      pageSize: params?.pageSize
    })

    return fetchData(`/api/payment-requests${queryString}`)
  },

  // Tạo yêu cầu rút tiền
  createWithdrawalRequest: async data => {
    return postData('/api/payment-requests/withdraw', data)
  },

  // Lấy danh sách yêu cầu rút tiền
  getWithdrawalRequests: async params => {
    const queryString = buildQueryString({
      status: params?.status,
      page: params?.page,
      pageSize: params?.pageSize
    })

    return fetchData(`/api/payment-requests/withdraw${queryString}`)
  },

  // Lấy chi tiết yêu cầu rút tiền
  getWithdrawalRequestDetail: async id => {
    return fetchData(`/api/payment-requests/withdraw/${id}`)
  }
}

// Queries
export function usePaymentRequestsQuery(params) {
  return useQuery({
    queryKey: FINANCE_QUERY_KEYS.paymentRequests(params),
    queryFn: () => financeApi.getPaymentRequests(params)
  })
}

// Mutations
export function useCreatePaymentRequestMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: financeApi.createPaymentRequest,
    onSuccess: data => {
      toast.success('Yêu cầu nạp tiền đã được tạo thành công')
      queryClient.invalidateQueries({
        queryKey: FINANCE_QUERY_KEYS.paymentRequests()
      })
      queryClient.invalidateQueries({
        queryKey: FINANCE_QUERY_KEYS.withdrawalRequests()
      })
      return data
    },
    onError: error => {
      toast.error(error.message || 'Không thể tạo yêu cầu nạp tiền')
    }
  })
}

export function useUploadPaymentProofMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ requestId, file }) => {
      try {
        const formData = new FormData()
        formData.append('proof', file)
        formData.append('requestId', requestId)

        console.log('Uploading file:', {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          requestId
        })

        const response = await fetch('/api/payment-requests/upload-proof', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          // Xử lý error response đầy đủ hơn
          const errorData = await response.json().catch(() => ({
            error: `HTTP error! status: ${response.status}`
          }))
          throw new Error(errorData.error || 'Không thể upload bằng chứng thanh toán')
        }

        return response.json()
      } catch (error) {
        console.error('Upload mutation error:', error)
        throw error
      }
    },
    onSuccess: () => {
      toast.success('Bằng chứng thanh toán đã được tải lên')
      queryClient.invalidateQueries({
        queryKey: FINANCE_QUERY_KEYS.paymentRequests()
      })
    },
    onError: error => {
      console.error('Upload error in mutation:', error)
      toast.error(error.message || 'Không thể tải lên bằng chứng thanh toán')
    }
  })
}

export function useCreateWithdrawalMutation() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async data => {
      try {
        // Kiểm tra số tiền có lớn không
        const isLargeAmount = data.amount >= 10000000 // 10 triệu VND

        // Thực hiện rút tiền
        const response = await postData('/api/payment-requests/withdraw', data)

        // Nếu là số tiền lớn, gửi cảnh báo bảo mật qua Telegram
        if (isLargeAmount) {
          try {
            // Sử dụng session để lấy userId
            const session = await fetchData('/api/auth/session')
            if (session && session.user) {
              const deviceInfo = getBrowserInfo()

              await postData('/api/telegram/send', {
                notificationType: 'security',
                userId: session.user.id,
                alertType: 'large_withdrawal',
                details: {
                  amount: data.amount,
                  device: deviceInfo,
                  time: new Date().toLocaleString('vi-VN')
                }
              })
            }
          } catch (error) {
            console.error('Error sending security alert:', error)
            // Không ảnh hưởng đến luồng chính
          }
        }

        return response
      } catch (error) {
        // Phân loại lỗi để thông báo phù hợp
        if (error.status === 400) {
          throw new Error('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.')
        } else if (error.status === 401) {
          // Nếu unauthorized, chuyển hướng đến trang đăng nhập
          router.push('/login?redirectTo=/finance/withdrawal')
          throw new Error('Vui lòng đăng nhập lại để tiếp tục.')
        } else if (error.status === 409) {
          throw new Error('Số dư không đủ để thực hiện giao dịch này.')
        } else {
          throw new Error('Không thể tạo yêu cầu rút tiền. Vui lòng thử lại sau.')
        }
      }
    },
    onSuccess: data => {
      toast.success('Yêu cầu rút tiền đã được tạo thành công')

      // Cập nhật query cache để UI hiển thị dữ liệu mới nhất
      queryClient.invalidateQueries({
        queryKey: FINANCE_QUERY_KEYS.withdrawalRequests()
      })

      // Cập nhật balance của user
      queryClient.invalidateQueries({
        queryKey: AUTH_QUERY_KEYS.profile
      })

      return data
    },
    onError: error => {
      toast.error(error.message || 'Không thể tạo yêu cầu rút tiền')
    }
  })
}

export function useWithdrawalRequestsQuery(params) {
  return useQuery({
    queryKey: FINANCE_QUERY_KEYS.withdrawalRequests(params),
    queryFn: () => financeApi.getWithdrawalRequests(params)
  })
}

export function useWithdrawalRequestQuery(id) {
  return useQuery({
    queryKey: FINANCE_QUERY_KEYS.withdrawalRequest(id),
    queryFn: () => financeApi.getWithdrawalRequestDetail(id),
    enabled: !!id
  })
}
