// src/hooks/queries/useFinanceQueries.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'

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
    const response = await fetch('/api/payment-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Không thể tạo yêu cầu nạp tiền')
    }

    return response.json()
  },

  // Upload bằng chứng thanh toán
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
    const queryParams = new URLSearchParams()
    if (params?.type) queryParams.append('type', params.type)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())

    const response = await fetch(`/api/payment-requests?${queryParams}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Không thể lấy danh sách yêu cầu')
    }

    return response.json()
  },

  // Tạo yêu cầu rút tiền
  createWithdrawalRequest: async data => {
    const response = await fetch('/api/payment-requests/withdraw', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Không thể tạo yêu cầu rút tiền')
    }

    return response.json()
  },

  // Lấy danh sách yêu cầu rút tiền
  getWithdrawalRequests: async params => {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())

    const response = await fetch(`/api/payment-requests/withdraw?${queryParams}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Không thể lấy danh sách yêu cầu rút tiền')
    }

    return response.json()
  },

  // Lấy chi tiết yêu cầu rút tiền
  getWithdrawalRequestDetail: async id => {
    const response = await fetch(`/api/payment-requests/withdraw/${id}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Không thể lấy thông tin yêu cầu rút tiền')
    }

    return response.json()
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
    mutationFn: ({ requestId, file }) => financeApi.uploadPaymentProof(requestId, file),
    onSuccess: () => {
      toast.success('Bằng chứng thanh toán đã được tải lên')
      queryClient.invalidateQueries({
        queryKey: FINANCE_QUERY_KEYS.paymentRequests()
      })
    },
    onError: error => {
      toast.error(error.message || 'Không thể tải lên bằng chứng thanh toán')
    }
  })
}

export function useCreateWithdrawalMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: financeApi.createWithdrawalRequest,
    onSuccess: data => {
      toast.success('Yêu cầu rút tiền đã được tạo thành công')
      queryClient.invalidateQueries({
        queryKey: FINANCE_QUERY_KEYS.withdrawalRequests()
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
